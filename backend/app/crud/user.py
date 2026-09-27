from datetime import datetime, timezone
from uuid import uuid4

from bson import ObjectId

from app.db.database import database
from app.models.user import UserModel


users_collection = database[
    UserModel.collection_name
]


# -------------------------------------------------------------------
# Get User by Google ID
# -------------------------------------------------------------------

async def get_user_by_google_id(
    google_id: str,
) -> dict | None:
    return await users_collection.find_one(
        {"google_id": google_id}
    )


# -------------------------------------------------------------------
# Get User by Email
# -------------------------------------------------------------------

async def get_user_by_email(
    email: str,
) -> dict | None:
    return await users_collection.find_one(
        {"email": email}
    )


# -------------------------------------------------------------------
# Get User by Username
# -------------------------------------------------------------------

async def get_user_by_username(
    username: str,
) -> dict | None:
    return await users_collection.find_one(
        {"username": username}
    )


# -------------------------------------------------------------------
# Get User by ID
# -------------------------------------------------------------------

async def get_user_by_id(
    user_id: str,
) -> dict | None:
    return await users_collection.find_one(
        {"_id": ObjectId(user_id)}
    )


# -------------------------------------------------------------------
# Create User
# -------------------------------------------------------------------

async def create_user(
    email: str,
    google_id: str,
    username: str | None = None,
    name: str | None = None,
    picture: str | None = None,
    date_of_birth: str | None = None,
    gender: str | None = None,
    profession: str | None = None,
) -> dict:
    now = datetime.now(timezone.utc)

    user = UserModel(
        email=email,
        google_id=google_id,
        username=username,
        name=name,
        picture=picture,
        date_of_birth=date_of_birth,
        gender=gender,
        profession=profession,
        refresh_tokens=[],
        created_at=now,
        updated_at=now,
    )

    result = await users_collection.insert_one(
        user.to_document()
    )

    return await users_collection.find_one(
        {"_id": result.inserted_id}
    )


# -------------------------------------------------------------------
# Update User
# -------------------------------------------------------------------

async def update_user(
    user_id: str,
    username: str | None = None,
    name: str | None = None,
    picture: str | None = None,
    date_of_birth: str | None = None,
    gender: str | None = None,
    profession: str | None = None,
) -> dict | None:
    update_data = {
        "updated_at": datetime.now(timezone.utc)
    }

    if username is not None:
        update_data["username"] = username

    if name is not None:
        update_data["name"] = name

    if picture is not None:
        update_data["picture"] = picture

    if date_of_birth is not None:
        update_data["date_of_birth"] = date_of_birth

    if gender is not None:
        update_data["gender"] = gender

    if profession is not None:
        update_data["profession"] = profession

    return await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
    )


# ===================================================================
# Refresh Token CRUD
# ===================================================================


# -------------------------------------------------------------------
# Create Refresh Token
# -------------------------------------------------------------------

async def create_refresh_token(
    user_id: str,
    token_hash: str,
    expires_at: datetime,
) -> dict | None:
    """
    Store a new refresh-token session
    inside the user's document.
    """

    refresh_token = {
        "id": str(uuid4()),
        "token_hash": token_hash,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
        "revoked_at": None,
    }

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$push": {
                "refresh_tokens": refresh_token,
            },
            "$set": {
                "updated_at": datetime.now(timezone.utc),
            },
        },
    )

    if result.modified_count == 0:
        return None

    return refresh_token


# -------------------------------------------------------------------
# Get Refresh Token
# -------------------------------------------------------------------

async def get_refresh_token(token_hash: str):
    now = datetime.now(timezone.utc)

    user = await users_collection.find_one(
        {
            "refresh_tokens": {
                "$elemMatch": {
                    "token_hash": token_hash,
                    "revoked_at": None,
                    "expires_at": {"$gt": now},
                }
            }
        }
    )

    if not user:
        return None

    for refresh_token in user.get("refresh_tokens", []):
        if refresh_token.get("token_hash") != token_hash:
            continue

        if refresh_token.get("revoked_at") is not None:
            continue

        expires_at = refresh_token.get("expires_at")

        if not expires_at:
            continue

        # MongoDB/PyMongo may return datetimes without tzinfo.
        # Normalize them to UTC before comparing.
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= now:
            continue

        return {
            **refresh_token,
            "user_id": str(user["_id"]),
        }

    return None


# -------------------------------------------------------------------
# Revoke Refresh Token
# -------------------------------------------------------------------

async def revoke_refresh_token(
    token_hash: str,
) -> bool:
    """
    Revoke a single refresh-token session.
    """

    result = await users_collection.update_one(
        {
            "refresh_tokens": {
                "$elemMatch": {
                    "token_hash": token_hash,
                    "revoked_at": None,
                }
            }
        },
        {
            "$set": {
                "refresh_tokens.$.revoked_at": (
                    datetime.now(timezone.utc)
                ),
                "updated_at": (
                    datetime.now(timezone.utc)
                ),
            }
        },
    )

    return result.modified_count > 0


# -------------------------------------------------------------------
# Revoke All User Refresh Tokens
# -------------------------------------------------------------------

async def revoke_all_user_refresh_tokens(
    user_id: str,
) -> bool:
    """
    Revoke all active refresh-token sessions
    belonging to a user.
    """

    now = datetime.now(timezone.utc)

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "refresh_tokens.$[token].revoked_at": now,
                "updated_at": now,
            }
        },
        array_filters=[
            {
                "token.revoked_at": None,
            }
        ],
    )

    return result.modified_count > 0