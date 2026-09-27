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


class RelationshipPreferenceUpdate(BaseModel):
    """
    Defines how the current user's Pally should behave
    with the other person in the connection.
    """

    relationship: str | None = Field(
        default=None,
        max_length=50,
    )

    tone: str | None = Field(
        default=None,
        max_length=50,
    )

    humor_level: str | None = Field(
        default=None,
        max_length=30,
    )

    language: str | None = Field(
        default=None,
        max_length=30,
    )

    custom_instruction: str | None = Field(
        default=None,
        max_length=500,
    )


class RelationshipPreferenceResponse(BaseModel):
    relationship: str | None = None
    tone: str | None = None
    humor_level: str | None = None
    language: str | None = None
    custom_instruction: str | None = None


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

    # Directional preference belonging to the
    # current authenticated user.
    relationship_preferences: RelationshipPreferenceResponse

    created_at: datetime
    updated_at: datetime

    friend: ConnectionFriend