from fastapi import APIRouter, Depends, HTTPException, status

from app.api.endpoints.auth import get_current_user
from app.crud.conversation import (
    create_conversation,
    delete_conversation,
    get_conversation_for_user,
    get_user_conversations,
    update_conversation,
)
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    ConversationUpdate,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def conversation_to_response(
    conversation: dict,
) -> dict:
    """
    Convert MongoDB conversation document
    into API response format.
    """

    return {
        "id": str(conversation["_id"]),
        "participant_ids": conversation["participant_ids"],
        "is_active": conversation["is_active"],
        "context_summary": conversation.get("context_summary"),
        "created_at": conversation["created_at"],
        "updated_at": conversation["updated_at"],
    }


# -------------------------------------------------------------------
# Create Conversation
# -------------------------------------------------------------------

@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_conversation(
    conversation_data: ConversationCreate,
    user_id: str = Depends(get_current_user),
):
    """
    Create a new conversation.

    The authenticated user must be one of the participants.
    """

    if user_id not in conversation_data.participant_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authenticated user must be a conversation participant",
        )

    # Avoid duplicate participant IDs.
    participant_ids = list(
        dict.fromkeys(conversation_data.participant_ids)
    )

    if len(participant_ids) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one participant is required",
        )

    conversation = await create_conversation(
        participant_ids=participant_ids
    )

    return conversation_to_response(conversation)


# -------------------------------------------------------------------
# List User Conversations
# -------------------------------------------------------------------

@router.get(
    "",
    response_model=list[ConversationResponse],
)
async def get_conversations(
    user_id: str = Depends(get_current_user),
):
    """
    Get all active conversations belonging to the
    authenticated user.
    """

    conversations = await get_user_conversations(
        user_id=user_id
    )

    return [
        conversation_to_response(conversation)
        for conversation in conversations
    ]


# -------------------------------------------------------------------
# Get Single Conversation
# -------------------------------------------------------------------

@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
):
    """
    Get a conversation only if the authenticated user
    is a participant.
    """

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return conversation_to_response(conversation)


# -------------------------------------------------------------------
# Update Conversation
# -------------------------------------------------------------------

@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
async def update_user_conversation(
    conversation_id: str,
    conversation_data: ConversationUpdate,
    user_id: str = Depends(get_current_user),
):
    """
    Update a conversation only if the authenticated user
    is a participant.
    """

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    updated_conversation = await update_conversation(
        conversation_id=conversation_id,
        is_active=conversation_data.is_active,
        context_summary=conversation_data.context_summary,
    )

    if not updated_conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return conversation_to_response(
        updated_conversation
    )


# -------------------------------------------------------------------
# Delete Conversation
# -------------------------------------------------------------------

@router.delete(
    "/{conversation_id}",
)
async def delete_user_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
):
    """
    Delete a conversation only if the authenticated user
    is a participant.
    """

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    deleted = await delete_conversation(
        conversation_id=conversation_id
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return {
        "message": "Conversation deleted successfully"
    }