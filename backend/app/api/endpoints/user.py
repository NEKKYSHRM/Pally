from fastapi import APIRouter, Depends, HTTPException, status

from app.api.endpoints.auth import get_current_user
from app.crud.user import (
    get_user_by_id,
    get_user_by_username,
    update_user,
)
from app.schemas.user import UserResponse, UsernameUpdate


router = APIRouter(
    prefix="/user",
    tags=["User"],
)


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def user_to_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "google_id": user["google_id"],
        "username": user.get("username"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_active": user.get("is_active", True),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
    }


# -------------------------------------------------------------------
# Set / Update Username
# -------------------------------------------------------------------

@router.patch(
    "/username",
    response_model=UserResponse,
)
async def update_username(
    username_data: UsernameUpdate,
    user_id: str = Depends(get_current_user),
):
    username = username_data.username.strip().lower()

    # Check whether username is already taken.
    existing_user = await get_user_by_username(username)

    if existing_user and str(existing_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )

    user = await update_user(
        user_id=user_id,
        username=username,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user_to_response(user)