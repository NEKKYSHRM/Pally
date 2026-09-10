from datetime import datetime

from pydantic import BaseModel, EmailStr


class GoogleAuthRequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None
    picture: str | None = None
    created_at: datetime