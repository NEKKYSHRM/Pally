from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId

from app.db.database import database
from app.models.message import MessageModel


messages_collection = database[
    MessageModel.collection_name
]


# -------------------------------------------------------------------
# Create Message
# -------------------------------------------------------------------

async def create_message(
    conversation_id: str,
    sender_type: Literal["user", "pet"],
    sender_id: str,
    content: str,
) -> dict:
    """
    Create and store a message in a conversation.
    """

    now = datetime.now(timezone.utc)

    message = MessageModel(
        conversation_id=conversation_id,
        sender_type=sender_type,
        sender_id=sender_id,
        content=content,
        created_at=now,
    )

    result = await messages_collection.insert_one(
        message.to_document()
    )

    return await messages_collection.find_one(
        {"_id": result.inserted_id}
    )


# -------------------------------------------------------------------
# Get Message
# -------------------------------------------------------------------

async def get_message_by_id(
    message_id: str,
) -> dict | None:
    return await messages_collection.find_one(
        {"_id": ObjectId(message_id)}
    )


# -------------------------------------------------------------------
# Get Conversation Messages
# -------------------------------------------------------------------

async def get_conversation_messages(
    conversation_id: str,
) -> list[dict]:
    """
    Get all messages in chronological order.
    """

    cursor = messages_collection.find(
        {
            "conversation_id": conversation_id,
        }
    ).sort(
        "created_at",
        1,
    )

    return await cursor.to_list(
        length=None
    )


# -------------------------------------------------------------------
# Get Recent Messages
# -------------------------------------------------------------------

async def get_recent_messages(
    conversation_id: str,
    limit: int = 20,
) -> list[dict]:
    """
    Get the most recent messages for AI context.

    Messages are returned in chronological order.
    """

    cursor = (
        messages_collection
        .find(
            {
                "conversation_id": conversation_id,
            }
        )
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    messages = await cursor.to_list(
        length=limit
    )

    messages.reverse()

    return messages