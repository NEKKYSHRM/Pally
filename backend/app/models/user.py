from datetime import datetime, timezone
from bson import ObjectId


class UserModel:
    collection_name = "users"

    def __init__(
        self,
        email: str,
        google_id: str,
        username: str | None = None,
        name: str | None = None,
        picture: str | None = None,
        date_of_birth: str | None = None,
        gender: str | None = None,
        profession: str | None = None,
        refresh_tokens: list[dict] | None = None,
        is_active: bool = True,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        _id: ObjectId | None = None,
    ):
        self._id = _id
        self.email = email
        self.google_id = google_id
        self.username = username
        self.name = name
        self.picture = picture
        self.date_of_birth = date_of_birth
        self.gender = gender
        self.profession = profession
        self.refresh_tokens = refresh_tokens or []
        self.is_active = is_active
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    def to_document(self) -> dict:
        return {
            "email": self.email,
            "google_id": self.google_id,
            "username": self.username,
            "name": self.name,
            "picture": self.picture,
            "date_of_birth": self.date_of_birth,
            "gender": self.gender,
            "profession": self.profession,
            "refresh_tokens": self.refresh_tokens,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }