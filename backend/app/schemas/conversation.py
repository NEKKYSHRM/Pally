from datetime import datetime

from pydantic import BaseModel, Field


# -------------------------------------------------------------------
# Create Conversation
# -------------------------------------------------------------------

class ConversationCreate(BaseModel):
    """
    Data required to create a conversation.
    """

    participant_ids: list[str] = Field(
        min_length=1,
        max_length=2,
    )


# -------------------------------------------------------------------
# Update Conversation
# -------------------------------------------------------------------

class ConversationUpdate(BaseModel):
    """
    Data that can be updated on a conversation.
    """

    is_active: bool | None = None

    context_summary: str | None = Field(
        default=None,
        max_length=5000,
    )


# -------------------------------------------------------------------
# Conversation Response
# -------------------------------------------------------------------

class ConversationResponse(BaseModel):
    """
    Conversation returned by the API.
    """

    id: str

    participant_ids: list[str]

    is_active: bool

    context_summary: str | None

    created_at: datetime

    updated_at: datetime