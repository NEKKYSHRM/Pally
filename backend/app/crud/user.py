from datetime import datetime, timezone

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
) -> dict:
    now = datetime.now(timezone.utc)

    user = UserModel(
        email=email,
        google_id=google_id,
        username=username,
        name=name,
        picture=picture,
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

    return await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
    )