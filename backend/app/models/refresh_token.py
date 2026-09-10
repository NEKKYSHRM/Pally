from datetime import datetime, timezone

from bson import ObjectId


class RefreshTokenModel:
    collection_name = "refresh_tokens"

    def __init__(
        self,
        user_id: ObjectId,
        token_hash: str,
        expires_at: datetime,
        created_at: datetime | None = None,
        revoked_at: datetime | None = None,
        _id: ObjectId | None = None,
    ):
        self._id = _id
        self.user_id = user_id
        self.token_hash = token_hash
        self.expires_at = expires_at
        self.created_at = created_at or datetime.now(timezone.utc)
        self.revoked_at = revoked_at

    def to_document(self) -> dict:
        return {
            "user_id": self.user_id,
            "token_hash": self.token_hash,
            "expires_at": self.expires_at,
            "created_at": self.created_at,
            "revoked_at": self.revoked_at,
        }