from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import hashlib
import secrets
import string
import httpx
import jwt

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Response,
    status,
)
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.crud.user import (
    create_user,
    get_user_by_google_id,
    get_user_by_id,
)
from app.crud.refresh_token import (
    create_refresh_token as save_refresh_token,
    get_refresh_token,
    revoke_refresh_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


bearer_scheme = HTTPBearer()

def generate_username() -> str:
    return "".join(
        secrets.choice(string.ascii_lowercase)
        for _ in range(6)
    )


# -------------------------------------------------------------------
# Google OAuth
# -------------------------------------------------------------------

GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_USER_INFO_URL = (
    "https://www.googleapis.com/oauth2/v3/userinfo"
)


@router.get("/google")
async def google_login():
    """
    Redirect the user to Google's OAuth consent screen.
    """

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }

    google_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

    return RedirectResponse(
        url=google_url
    )


@router.get("/google/callback")
async def google_callback(code: str):
    """
    Handle Google's OAuth callback.

    Google sends an authorization code.
    We exchange it for Google's tokens and retrieve
    the user's Google profile.

    After successful authentication:
    - Create/find the Pally user.
    - Create Pally access and refresh tokens.
    - Store the hashed refresh token in MongoDB.
    - Store the actual refresh token in an HttpOnly cookie.
    - Redirect the user to the Next.js /chats page.
    """

    async with httpx.AsyncClient() as client:

        # -----------------------------------------------------------
        # Exchange authorization code for Google tokens
        # -----------------------------------------------------------

        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            },
        )

        if token_response.status_code != 200:
            print("Google token exchange failed")
            print("Status:", token_response.status_code)
            print("Response:", token_response.text)

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Google",
            )

        google_tokens = token_response.json()

        google_access_token = google_tokens.get(
            "access_token"
        )

        if not google_access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google access token not received",
            )

        # -----------------------------------------------------------
        # Get Google user information
        # -----------------------------------------------------------

        userinfo_response = await client.get(
            GOOGLE_USER_INFO_URL,
            headers={
                "Authorization": (
                    f"Bearer {google_access_token}"
                )
            },
        )

        if userinfo_response.status_code != 200:
            print("Google user info failed")
            print(
                "Status:",
                userinfo_response.status_code,
            )
            print(
                "Response:",
                userinfo_response.text,
            )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "Failed to retrieve "
                    "Google user information"
                ),
            )

        google_user = userinfo_response.json()

    # ---------------------------------------------------------------
    # Extract Google profile
    # ---------------------------------------------------------------

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")
    picture = google_user.get("picture")

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google account information",
        )

    # ---------------------------------------------------------------
    # Find existing Pally user
    # ---------------------------------------------------------------

    user = await get_user_by_google_id(
        google_id
    )

    # ---------------------------------------------------------------
    # Create new user if first login
    # ---------------------------------------------------------------

    if not user:
        username = generate_username()

        user = await create_user(
            email=email,
            google_id=google_id,
            username=username,
            name=name,
            picture=picture,
        )

    user_id = str(user["_id"])

    # ---------------------------------------------------------------
    # Create Pally tokens
    # ---------------------------------------------------------------

    access_token = create_access_token(
        user_id
    )

    refresh_token = create_refresh_token(
        user_id
    )

    # ---------------------------------------------------------------
    # Store HASH of refresh token in MongoDB
    # ---------------------------------------------------------------

    refresh_token_hash = hashlib.sha256(
        refresh_token.encode()
    ).hexdigest()

    refresh_expiry = (
        datetime.now(timezone.utc)
        + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    await save_refresh_token(
        user_id=user_id,
        token_hash=refresh_token_hash,
        expires_at=refresh_expiry,
    )

    # ---------------------------------------------------------------
    # Redirect to Next.js
    # ---------------------------------------------------------------
    #
    # IMPORTANT:
    # We do NOT put access_token or refresh_token
    # into the URL.
    #
    # The refresh token is stored as an HttpOnly cookie.
    #
    # The access token will be obtained by the frontend
    # through the refresh endpoint.
    # ---------------------------------------------------------------

    response = RedirectResponse(
        url=f"{settings.FRONTEND_URL}/chats",
        status_code=status.HTTP_302_FOUND,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=(
            settings.REFRESH_TOKEN_EXPIRE_DAYS
            * 24
            * 60
            * 60
        ),
    )

    return response


# -------------------------------------------------------------------
# Refresh token
# -------------------------------------------------------------------

@router.post("/refresh")
async def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
):
    """
    Exchange the HttpOnly refresh-token cookie for
    a new access token and rotated refresh token.
    """

    # ---------------------------------------------------------------
    # Check refresh token exists
    # ---------------------------------------------------------------

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
        )

    # ---------------------------------------------------------------
    # Decode refresh token
    # ---------------------------------------------------------------

    try:
        payload = decode_token(
            refresh_token
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # ---------------------------------------------------------------
    # Verify token type
    # ---------------------------------------------------------------

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # ---------------------------------------------------------------
    # Hash supplied refresh token
    # ---------------------------------------------------------------

    token_hash = hashlib.sha256(
        refresh_token.encode()
    ).hexdigest()

    # ---------------------------------------------------------------
    # Check whether refresh session is active
    # ---------------------------------------------------------------

    stored_token = await get_refresh_token(
        token_hash
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked or expired",
        )

    # ---------------------------------------------------------------
    # Rotate refresh token
    # ---------------------------------------------------------------

    await revoke_refresh_token(
        token_hash
    )

    new_access_token = create_access_token(
        user_id
    )

    new_refresh_token = create_refresh_token(
        user_id
    )

    # ---------------------------------------------------------------
    # Store new refresh token hash
    # ---------------------------------------------------------------

    new_refresh_token_hash = hashlib.sha256(
        new_refresh_token.encode()
    ).hexdigest()

    new_refresh_expiry = (
        datetime.now(timezone.utc)
        + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    await save_refresh_token(
        user_id=user_id,
        token_hash=new_refresh_token_hash,
        expires_at=new_refresh_expiry,
    )

    # ---------------------------------------------------------------
    # Replace HttpOnly refresh-token cookie
    # ---------------------------------------------------------------

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=(
            settings.REFRESH_TOKEN_EXPIRE_DAYS
            * 24
            * 60
            * 60
        ),
    )

    # ---------------------------------------------------------------
    # Return only access token
    # ---------------------------------------------------------------

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


# -------------------------------------------------------------------
# Logout
# -------------------------------------------------------------------

@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
):
    """
    Revoke the current refresh-token session
    and clear the refresh-token cookie.
    """

    # ---------------------------------------------------------------
    # Check refresh token exists
    # ---------------------------------------------------------------

    if refresh_token:
        token_hash = hashlib.sha256(
            refresh_token.encode()
        ).hexdigest()

        await revoke_refresh_token(
            token_hash
        )

    # ---------------------------------------------------------------
    # Clear refresh-token cookie
    # ---------------------------------------------------------------

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
    )

    return {
        "message": "Logged out successfully"
    }


# -------------------------------------------------------------------
# Current user dependency
# -------------------------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
):
    """
    Validate the access token and return
    the current user ID.
    """

    token = credentials.credentials

    try:
        payload = decode_token(
            token
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    return user_id


# -------------------------------------------------------------------
# Current user
# -------------------------------------------------------------------

@router.get("/me")
async def get_me(
    user_id: str = Depends(get_current_user),
):
    """
    Return the authenticated user's basic information.
    """

    user = await get_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "username": user.get("username"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_active": user.get("is_active", True),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
    }