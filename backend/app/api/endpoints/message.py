from fastapi import APIRouter, Depends, HTTPException, status

from app.api.endpoints.auth import get_current_user
from app.crud.conversation import get_conversation_for_user
from app.crud.message import (
    create_message,
    get_conversation_messages,
    get_recent_messages,
)
from app.schemas.message import MessageCreate, MessageResponse


router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def message_to_response(message: dict) -> dict:
    """
    Convert MongoDB message document into API response format.
    """

    return {
        "id": str(message["_id"]),
        "conversation_id": message["conversation_id"],
        "sender_type": message["sender_type"],
        "sender_id": message["sender_id"],
        "content": message["content"],
        "created_at": message["created_at"],
    }


# -------------------------------------------------------------------
# Send Message
# -------------------------------------------------------------------

@router.post(
    "/{conversation_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    message_data: MessageCreate,
    user_id: str = Depends(get_current_user),
):
    """
    Send a human user's message to a conversation.

    The sender identity always comes from the authenticated user.
    The client cannot specify sender_type or sender_id.
    """

    # ---------------------------------------------------------------
    # Verify that the authenticated user belongs to the conversation
    # ---------------------------------------------------------------

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if not conversation["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation is inactive",
        )

    # ---------------------------------------------------------------
    # Create human message
    # ---------------------------------------------------------------

    message = await create_message(
        conversation_id=conversation_id,
        sender_type="user",
        sender_id=user_id,
        content=message_data.content,
    )

    return message_to_response(message)


# -------------------------------------------------------------------
# Get Conversation Messages
# -------------------------------------------------------------------

@router.get(
    "/{conversation_id}",
    response_model=list[MessageResponse],
)
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
):
    """
    Get all messages belonging to a conversation.

    Only conversation participants can access messages.
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

    messages = await get_conversation_messages(
        conversation_id=conversation_id
    )

    return [
        message_to_response(message)
        for message in messages
    ]


# -------------------------------------------------------------------
# Get Recent Messages
# -------------------------------------------------------------------

@router.get(
    "/{conversation_id}/recent",
    response_model=list[MessageResponse],
)
async def get_recent_conversation_messages(
    conversation_id: str,
    limit: int = 20,
    user_id: str = Depends(get_current_user),
):
    """
    Get recent messages from a conversation.

    This endpoint is useful for loading recent conversation
    context without retrieving the entire conversation.
    """

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = await get_recent_messages(
        conversation_id=conversation_id,
        limit=limit,
    )

    return [
        message_to_response(message)
        for message in messages
    ]