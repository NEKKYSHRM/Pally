from datetime import datetime, timezone

from bson import ObjectId

from app.db.database import database
from app.models.conversation import ConversationModel


conversations_collection = database[
    ConversationModel.collection_name
]


# -------------------------------------------------------------------
# Get Conversation
# -------------------------------------------------------------------

async def get_conversation_by_id(
    conversation_id: str,
) -> dict | None:
    return await conversations_collection.find_one(
        {"_id": ObjectId(conversation_id)}
    )


# -------------------------------------------------------------------
# Get Conversation For User
# -------------------------------------------------------------------

async def get_conversation_for_user(
    conversation_id: str,
    user_id: str,
) -> dict | None:
    """
    Get a conversation only if the user is a participant.
    """

    return await conversations_collection.find_one(
        {
            "_id": ObjectId(conversation_id),
            "participant_ids": user_id,
        }
    )


# -------------------------------------------------------------------
# Get User Conversations
# -------------------------------------------------------------------

async def get_user_conversations(
    user_id: str,
) -> list[dict]:
    """
    Get all active conversations where the user is a participant.
    """

    cursor = conversations_collection.find(
        {
            "participant_ids": user_id,
            "is_active": True,
        }
    ).sort(
        "updated_at",
        -1,
    )

    return await cursor.to_list(
        length=None
    )


# -------------------------------------------------------------------
# Create Conversation
# -------------------------------------------------------------------

async def create_conversation(
    participant_ids: list[str],
) -> dict:
    now = datetime.now(timezone.utc)

    conversation = ConversationModel(
        participant_ids=participant_ids,
        is_active=True,
        context_summary=None,
        created_at=now,
        updated_at=now,
    )

    result = await conversations_collection.insert_one(
        conversation.to_document()
    )

    return await conversations_collection.find_one(
        {"_id": result.inserted_id}
    )


# -------------------------------------------------------------------
# Update Conversation
# -------------------------------------------------------------------

async def update_conversation(
    conversation_id: str,
    is_active: bool | None = None,
    context_summary: str | None = None,
) -> dict | None:
    update_data = {
        "updated_at": datetime.now(timezone.utc)
    }

    if is_active is not None:
        update_data["is_active"] = is_active

    if context_summary is not None:
        update_data["context_summary"] = context_summary

    return await conversations_collection.find_one_and_update(
        {"_id": ObjectId(conversation_id)},
        {"$set": update_data},
        return_document=True,
    )


# -------------------------------------------------------------------
# Delete Conversation
# -------------------------------------------------------------------

async def delete_conversation(
    conversation_id: str,
) -> bool:
    result = await conversations_collection.delete_one(
        {"_id": ObjectId(conversation_id)}
    )

    return result.deleted_count > 0