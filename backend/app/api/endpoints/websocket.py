from fastapi import APIRouter, WebSocket, WebSocketDisconnect

import jwt

from app.core.security import decode_token
from app.crud.conversation import get_conversation_for_user
from app.crud.message import create_message
from app.services.llm.pally_chat_service import pally_chat_service
from app.services.websocket_manager import websocket_manager


router = APIRouter(
    prefix="/ws",
    tags=["WebSocket"],
)


# -------------------------------------------------------------------
# WebSocket Authentication
# -------------------------------------------------------------------

def get_user_id_from_token(
    token: str,
) -> str | None:
    """
    Validate an access JWT and return the authenticated user ID.

    Returns None when the token is invalid, expired, has the wrong
    token type, or does not contain a user ID.
    """
    try:
        payload = decode_token(token)
    except jwt.InvalidTokenError:
        return None

    if payload.get("type") != "access":
        return None

    user_id = payload.get("sub")

    if not user_id:
        return None

    return user_id


# -------------------------------------------------------------------
# Message Event Builder
# -------------------------------------------------------------------

def build_message_event(
    message: dict,
) -> dict:
    """
    Convert a MongoDB message document into a WebSocket event.
    """
    return {
        "type": "message",
        "message": {
            "id": str(message["_id"]),
            "conversation_id": message["conversation_id"],
            "sender_type": message["sender_type"],
            "sender_id": message["sender_id"],
            "content": message["content"],
            "created_at": message["created_at"].isoformat(),
        },
    }


# -------------------------------------------------------------------
# Conversation WebSocket
# -------------------------------------------------------------------

@router.websocket("/conversations/{conversation_id}")
async def conversation_websocket(
    websocket: WebSocket,
    conversation_id: str,
):
    """
    Real-time WebSocket connection for a conversation.

    The client provides the access token through the WebSocket
    query parameter:

        /ws/conversations/{conversation_id}?token=<access_token>
    """

    # ---------------------------------------------------------------
    # Authenticate WebSocket
    # ---------------------------------------------------------------

    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    user_id = get_user_id_from_token(token)

    if not user_id:
        await websocket.close(code=1008)
        return

    # ---------------------------------------------------------------
    # Verify conversation membership
    # ---------------------------------------------------------------

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        await websocket.close(code=1008)
        return

    # ---------------------------------------------------------------
    # Verify conversation is active
    # ---------------------------------------------------------------

    if not conversation["is_active"]:
        await websocket.close(code=1008)
        return

    # ---------------------------------------------------------------
    # Register WebSocket
    # ---------------------------------------------------------------

    await websocket_manager.connect(
        conversation_id=conversation_id,
        websocket=websocket,
    )

    try:
        # -----------------------------------------------------------
        # Receive messages
        # -----------------------------------------------------------

        while True:
            data = await websocket.receive_json()

            message_type = data.get("type")

            # -------------------------------------------------------
            # Handle normal user message
            # -------------------------------------------------------

            if message_type == "message":
                content = data.get("content")

                if not isinstance(content, str):
                    continue

                content = content.strip()

                if not content:
                    continue

                if len(content) > 10000:
                    continue

                # ---------------------------------------------------
                # Persist user message
                # ---------------------------------------------------

                message = await create_message(
                    conversation_id=conversation_id,
                    sender_type="user",
                    sender_id=user_id,
                    content=content,
                )

                # ---------------------------------------------------
                # Broadcast user message
                #
                # IMPORTANT:
                # No LLM call happens here.
                # Manual user chat is NOT sent to Gemini.
                # ---------------------------------------------------

                event = build_message_event(message)

                await websocket_manager.broadcast(
                    conversation_id=conversation_id,
                    event=event,
                )

            # -------------------------------------------------------
            # Handle Pally-generated conversation
            # -------------------------------------------------------

            elif message_type == "pally_message":
                response = await pally_chat_service.generate_response(
                    user_id=user_id,
                    conversation_id=conversation_id,
                )

                if not response:
                    continue

                # ---------------------------------------------------
                # Get current user's Pally
                #
                # pally_chat_service has already validated that the
                # Pally exists. The generated response is therefore
                # stored as a pet message.
                # ---------------------------------------------------

                from app.crud.pet import get_pet_by_user_id

                pet = await get_pet_by_user_id(user_id)

                if not pet:
                    continue

                pet_id = str(pet["_id"])

                # ---------------------------------------------------
                # Persist Pally response
                # ---------------------------------------------------

                message = await create_message(
                    conversation_id=conversation_id,
                    sender_type="pet",
                    sender_id=pet_id,
                    content=response,
                )

                # ---------------------------------------------------
                # Broadcast Pally response
                # ---------------------------------------------------

                event = build_message_event(message)

                await websocket_manager.broadcast(
                    conversation_id=conversation_id,
                    event=event,
                )

    except WebSocketDisconnect:
        pass

    finally:
        await websocket_manager.disconnect(
            conversation_id=conversation_id,
            websocket=websocket,
        )