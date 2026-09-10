from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    id: str
    email: str
    google_id: str
    username: str | None
    name: str | None
    picture: str | None
    is_active: bool
    created_at: str
    updated_at: str


class UsernameUpdate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
    )