from datetime import datetime
from typing import ClassVar
from pydantic import BaseModel, Field


class PetModel(BaseModel):
    collection_name: ClassVar[str] = "pets"

    user_id: str
    name: str
    personality: list[str] = Field(default_factory=list)
    humor: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    mood: str = "neutral"
    observed_behavior: dict = Field(default_factory=dict)
    applied_behavior: dict = Field(default_factory=dict)
    is_active: bool = True
    activity_enabled: bool = True
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
            "mood": self.mood,
            "observed_behavior": self.observed_behavior,
            "applied_behavior": self.applied_behavior,
            "is_active": self.is_active,
            "activity_enabled": self.activity_enabled,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }