from datetime import datetime
from typing import ClassVar, Literal

from pydantic import BaseModel, Field


class RelationshipPreference(BaseModel):
    """
    Defines how a user's Pally should behave with the other
    person in this connection.
    """

    relationship: str | None = None

    tone: str | None = None

    humor_level: str | None = None

    language: str | None = None

    custom_instruction: str | None = None


class ConnectionModel(BaseModel):
    """
    Represents a connection between two users.

    Relationship preferences are directional:
    each user can define how their own Pally should behave
    with the other user.
    """

    collection_name: ClassVar[str] = "connections"

    # ---------------------------------------------------------------
    # Users
    # ---------------------------------------------------------------

    requester_id: str

    receiver_id: str

    # ---------------------------------------------------------------
    # Connection state
    # ---------------------------------------------------------------

    status: Literal[
        "pending",
        "accepted",
        "rejected",
        "blocked",
    ]

    # ---------------------------------------------------------------
    # Directional relationship preferences
    # ---------------------------------------------------------------

    requester_preferences: RelationshipPreference = Field(
        default_factory=RelationshipPreference
    )

    receiver_preferences: RelationshipPreference = Field(
        default_factory=RelationshipPreference
    )

    # ---------------------------------------------------------------
    # Timestamps
    # ---------------------------------------------------------------

    created_at: datetime

    updated_at: datetime

    def to_document(self) -> dict:
        return {
            "requester_id": self.requester_id,
            "receiver_id": self.receiver_id,
            "status": self.status,
            "requester_preferences": self.requester_preferences.model_dump(),
            "receiver_preferences": self.receiver_preferences.model_dump(),
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }