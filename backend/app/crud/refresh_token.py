from datetime import datetime, timezone

from bson import ObjectId

from app.db.database import database
from app.models.refresh_token import RefreshTokenModel


refresh_tokens_collection = database[
    RefreshTokenModel.collection_name
]


async def create_refresh_token(
    user_id: str,
    token_hash: str,
    expires_at: datetime,
) -> dict:
    """
    Store a new refresh-token session.
    """

    refresh_token = RefreshTokenModel(
        user_id=ObjectId(user_id),
        token_hash=token_hash,
        expires_at=expires_at,
    )

    result = await refresh_tokens_collection.insert_one(
        refresh_token.to_document()
    )

    return await refresh_tokens_collection.find_one(
        {"_id": result.inserted_id}
    )


async def get_refresh_token(
    token_hash: str,
) -> dict | None:
    """
    Find an active refresh-token session by its hash.
    """

    now = datetime.now(timezone.utc)

    return await refresh_tokens_collection.find_one(
        {
            "token_hash": token_hash,
            "revoked_at": None,
            "expires_at": {"$gt": now},
        }
    )


async def revoke_refresh_token(
    token_hash: str,
) -> bool:
    """
    Revoke a refresh-token session.
    """

    result = await refresh_tokens_collection.update_one(
        {
            "token_hash": token_hash,
            "revoked_at": None,
        },
        {
            "$set": {
                "revoked_at": datetime.now(timezone.utc)
            }
        },
    )

    return result.modified_count > 0


async def revoke_all_user_refresh_tokens(
    user_id: str,
) -> int:
    """
    Revoke all active refresh-token sessions for a user.
    """

    result = await refresh_tokens_collection.update_many(
        {
            "user_id": ObjectId(user_id),
            "revoked_at": None,
        },
        {
            "$set": {
                "revoked_at": datetime.now(timezone.utc)
            }
        },
    )

    return result.modified_count