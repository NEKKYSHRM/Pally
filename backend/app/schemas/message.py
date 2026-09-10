from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# -------------------------------------------------------------------
# Create Message
# -------------------------------------------------------------------

class MessageCreate(BaseModel):
    """
    Data required to create a message.
    """

    content: str = Field(
        min_length=1,
        max_length=10000,
    )


# -------------------------------------------------------------------
# Message Response
# -------------------------------------------------------------------

class MessageResponse(BaseModel):
    """
    Message returned by the API.
    """

    id: str

    conversation_id: str

    sender_type: Literal["user", "pet"]

    sender_id: str

    content: str

    created_at: datetime