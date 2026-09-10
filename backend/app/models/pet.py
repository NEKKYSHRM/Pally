from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, Field


class PetModel(BaseModel):
    """
    Represents a user's Pally pet.
    """

    collection_name: ClassVar[str] = "pets"

    # ---------------------------------------------------------------
    # Owner
    # ---------------------------------------------------------------

    user_id: str

    # ---------------------------------------------------------------
    # Basic information
    # ---------------------------------------------------------------

    name: str

    # ---------------------------------------------------------------
    # Personality
    # ---------------------------------------------------------------

    personality: list[str] = Field(
        default_factory=list
    )

    humor: list[str] = Field(
        default_factory=list
    )

    # ---------------------------------------------------------------
    # Communication
    # ---------------------------------------------------------------

    languages: list[str] = Field(
        default_factory=list
    )

    # ---------------------------------------------------------------
    # Interests
    # ---------------------------------------------------------------

    interests: list[str] = Field(
        default_factory=list
    )

    # ---------------------------------------------------------------
    # Activity settings
    # ---------------------------------------------------------------

    is_active: bool = True

    activity_enabled: bool = True

    # ---------------------------------------------------------------
    # Timestamps
    # ---------------------------------------------------------------

    created_at: datetime

    updated_at: datetime

    def to_document(self) -> dict:
        return {
            "user_id": self.user_id,
            "name": self.name,
            "personality": self.personality,
            "humor": self.humor,
            "languages": self.languages,
            "interests": self.interests,
            "is_active": self.is_active,
            "activity_enabled": self.activity_enabled,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }