from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel


class ConversationModel(BaseModel):
    """
    Represents a conversation between a user and another user.
    Pally can participate in the conversation when enabled/triggered.
    """

    collection_name: ClassVar[str] = "conversations"

    # ---------------------------------------------------------------
    # Participants
    # ---------------------------------------------------------------

    participant_ids: list[str]

    # ---------------------------------------------------------------
    # Conversation state
    # ---------------------------------------------------------------

    is_active: bool = True

    # ---------------------------------------------------------------
    # AI context
    # ---------------------------------------------------------------

    context_summary: str | None = None

    # ---------------------------------------------------------------
    # Timestamps
    # ---------------------------------------------------------------

    created_at: datetime

    updated_at: datetime

    def to_document(self) -> dict:
        return {
            "participant_ids": self.participant_ids,
            "is_active": self.is_active,
            "context_summary": self.context_summary,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }