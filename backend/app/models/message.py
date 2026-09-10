from datetime import datetime
from typing import ClassVar, Literal

from pydantic import BaseModel


class MessageModel(BaseModel):
    """
    Represents a single message inside a conversation.

    A message can be sent either by a human user
    or by a Pally pet.
    """

    collection_name: ClassVar[str] = "messages"

    # ---------------------------------------------------------------
    # Conversation
    # ---------------------------------------------------------------

    conversation_id: str

    # ---------------------------------------------------------------
    # Sender
    # ---------------------------------------------------------------

    sender_type: Literal["user", "pet"]

    sender_id: str

    # ---------------------------------------------------------------
    # Message content
    # ---------------------------------------------------------------

    content: str

    # ---------------------------------------------------------------
    # Timestamps
    # ---------------------------------------------------------------

    created_at: datetime

    def to_document(self) -> dict:
        return {
            "conversation_id": self.conversation_id,
            "sender_type": self.sender_type,
            "sender_id": self.sender_id,
            "content": self.content,
            "created_at": self.created_at,
        }