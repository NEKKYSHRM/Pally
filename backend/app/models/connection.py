from datetime import datetime
from typing import ClassVar, Literal

from pydantic import BaseModel


class ConnectionModel(BaseModel):
    collection_name: ClassVar[str] = "connections"

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

    def to_document(self) -> dict:
        return {
            "requester_id": self.requester_id,
            "receiver_id": self.receiver_id,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }