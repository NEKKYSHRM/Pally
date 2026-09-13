from datetime import datetime

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    id: str
    email: str
    google_id: str
    username: str | None
    name: str | None
    picture: str | None
    date_of_birth: str | None
    gender: str | None
    profession: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    date_of_birth: str | None = None
    gender: str | None = None
    profession: str | None = None


class UsernameUpdate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
    )