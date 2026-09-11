from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ConnectionCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
    )


class ConnectionStatusUpdate(BaseModel):
    status: Literal[
        "accepted",
        "rejected",
        "blocked",
    ]


class ConnectionFriend(BaseModel):
    id: str
    username: str
    name: str | None = None
    picture: str | None = None


class ConnectionResponse(BaseModel):
    id: str
    requester_id: str
    receiver_id: str
    status: Literal[
        "pending",
        "accepted",
        "rejected",
        "blocked",
    ]
    created_at: datetime
    updated_at: datetime
    friend: ConnectionFriend