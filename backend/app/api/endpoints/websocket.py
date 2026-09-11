import asyncio
import time

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
# Pally Conversation Configuration
# -------------------------------------------------------------------

PALLY_CONVERSATION_DURATION = 60
PALLY_MESSAGE_DELAY = 2


# -------------------------------------------------------------------
# Active Pally Conversations
# -------------------------------------------------------------------

# Keeps track of conversations that currently have an autonomous
# Pally-to-Pally conversation running.
#
# Key:
#     conversation_id
#
# Value:
#     asyncio.Task
#
# This prevents multiple Pally loops from being started for the
# same conversation at the same time.
active_pally_conversations: dict[str, asyncio.Task] = {}


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
# Generate One Pally Message
# -------------------------------------------------------------------

async def generate_and_broadcast_pally_message(
    user_id: str,
    conversation_id: str,
) -> bool:
    """
    Generate one Pally response, persist it, and broadcast it.

    Returns:
        True  -> message generated successfully
        False -> generation failed
    """

    print(
        "[PALLY] ---------------------------------------"
    )

    print(
        "[PALLY] Generating next Pally response..."
    )

    try:
        response = (
            await pally_chat_service.generate_response(
                user_id=user_id,
                conversation_id=conversation_id,
            )
        )

    except Exception as exc:
        print(
            "[PALLY] ERROR while generating response: "
            f"{type(exc).__name__}: {exc}"
        )

        import traceback

        traceback.print_exc()

        return False

    if not response:
        print(
            "[PALLY] No response generated."
        )

        return False

    # ---------------------------------------------------------------
    # PallyChatService now tells us which Pally actually responded.
    # ---------------------------------------------------------------

    pet_id = response.get("pet_id")
    content = response.get("content")

    if not pet_id:
        print(
            "[PALLY] ERROR: response does not contain pet_id"
        )

        return False

    if not content:
        print(
            "[PALLY] ERROR: response does not contain content"
        )

        return False

    print(
        "[PALLY] Responding Pally ID="
        f"{pet_id}"
    )

    print(
        "[PALLY] Response="
        f"{content!r}"
    )

    # ---------------------------------------------------------------
    # Persist Pally message
    # ---------------------------------------------------------------

    message = await create_message(
        conversation_id=conversation_id,
        sender_type="pet",
        sender_id=pet_id,
        content=content,
    )

    print(
        "[PALLY] Pally message saved: "
        f"message_id={message['_id']}"
    )

    # ---------------------------------------------------------------
    # Broadcast Pally message
    # ---------------------------------------------------------------

    event = build_message_event(message)

    await websocket_manager.broadcast(
        conversation_id=conversation_id,
        event=event,
    )

    print(
        "[PALLY] Pally response broadcast complete"
    )

    return True


# -------------------------------------------------------------------
# Autonomous Pally Conversation
# -------------------------------------------------------------------

async def run_pally_conversation(
    user_id: str,
    conversation_id: str,
) -> None:
    """
    Run an autonomous Pally-to-Pally conversation for a maximum
    of PALLY_CONVERSATION_DURATION seconds.

    PallyChatService determines which Pally should speak next
    based on the most recent Pally message.
    """

    print(
        "[PALLY LOOP] ======================================="
    )

    print(
        "[PALLY LOOP] Started"
    )

    print(
        f"[PALLY LOOP] conversation_id={conversation_id}"
    )

    print(
        f"[PALLY LOOP] duration={PALLY_CONVERSATION_DURATION}s"
    )

    started_at = time.monotonic()

    try:
        while True:
            elapsed = time.monotonic() - started_at

            # -------------------------------------------------------
            # Hard 60-second limit
            # -------------------------------------------------------

            if elapsed >= PALLY_CONVERSATION_DURATION:
                print(
                    "[PALLY LOOP] Maximum duration reached."
                )

                break

            # -------------------------------------------------------
            # Generate next Pally message
            # -------------------------------------------------------

            success = await generate_and_broadcast_pally_message(
                user_id=user_id,
                conversation_id=conversation_id,
            )

            if not success:
                print(
                    "[PALLY LOOP] Stopping because "
                    "message generation failed."
                )

                break

            # -------------------------------------------------------
            # Check time again after Gemini generation.
            #
            # Gemini itself may take several seconds, so the loop
            # must never continue beyond the 60-second window.
            # -------------------------------------------------------

            elapsed = time.monotonic() - started_at

            if elapsed >= PALLY_CONVERSATION_DURATION:
                print(
                    "[PALLY LOOP] 60-second limit reached "
                    "after response."
                )

                break

            # -------------------------------------------------------
            # Small pause between Pally messages
            # -------------------------------------------------------

            remaining_time = (
                PALLY_CONVERSATION_DURATION - elapsed
            )

            delay = min(
                PALLY_MESSAGE_DELAY,
                remaining_time,
            )

            await asyncio.sleep(delay)

    except asyncio.CancelledError:
        print(
            "[PALLY LOOP] Conversation task cancelled."
        )

        raise

    except Exception as exc:
        print(
            "[PALLY LOOP] ERROR: "
            f"{type(exc).__name__}: {exc}"
        )

        import traceback

        traceback.print_exc()

    finally:
        # -----------------------------------------------------------
        # Remove conversation from active loop registry.
        # -----------------------------------------------------------

        current_task = asyncio.current_task()

        if (
            active_pally_conversations.get(
                conversation_id
            )
            is current_task
        ):
            active_pally_conversations.pop(
                conversation_id,
                None,
            )

        elapsed = time.monotonic() - started_at

        print(
            "[PALLY LOOP] Finished"
        )

        print(
            f"[PALLY LOOP] elapsed={elapsed:.2f}s"
        )

        print(
            "[PALLY LOOP] ======================================="
        )


# -------------------------------------------------------------------
# Start Autonomous Pally Conversation
# -------------------------------------------------------------------

def start_pally_conversation(
    user_id: str,
    conversation_id: str,
) -> bool:
    """
    Start an autonomous Pally conversation.

    Returns:
        True  -> a new conversation was started
        False -> a conversation is already running
    """

    existing_task = active_pally_conversations.get(
        conversation_id
    )

    if existing_task and not existing_task.done():
        print(
            "[PALLY LOOP] Conversation already running: "
            f"conversation_id={conversation_id}"
        )

        return False

    task = asyncio.create_task(
        run_pally_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
        )
    )

    active_pally_conversations[
        conversation_id
    ] = task

    print(
        "[PALLY LOOP] New conversation task created: "
        f"conversation_id={conversation_id}"
    )

    return True


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

    print(
        f"[WS] Connection attempt: "
        f"conversation={conversation_id}"
    )

    # ---------------------------------------------------------------
    # Authenticate WebSocket
    # ---------------------------------------------------------------

    token = websocket.query_params.get("token")

    if not token:
        print(
            "[WS] Connection rejected: missing token"
        )

        await websocket.close(code=1008)
        return

    user_id = get_user_id_from_token(token)

    if not user_id:
        print(
            "[WS] Connection rejected: invalid token"
        )

        await websocket.close(code=1008)
        return

    print(
        f"[WS] Authenticated user: "
        f"user_id={user_id}"
    )

    # ---------------------------------------------------------------
    # Verify conversation membership
    # ---------------------------------------------------------------

    conversation = await get_conversation_for_user(
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if not conversation:
        print(
            "[WS] Connection rejected: "
            "user is not a conversation participant"
        )

        await websocket.close(code=1008)
        return

    # ---------------------------------------------------------------
    # Verify conversation is active
    # ---------------------------------------------------------------

    if not conversation["is_active"]:
        print(
            "[WS] Connection rejected: "
            "conversation is inactive"
        )

        await websocket.close(code=1008)
        return

    # ---------------------------------------------------------------
    # Register WebSocket
    # ---------------------------------------------------------------

    await websocket_manager.connect(
        conversation_id=conversation_id,
        websocket=websocket,
    )

    print(
        f"[WS] Connection established: "
        f"conversation={conversation_id}, "
        f"user={user_id}"
    )

    try:

        # -----------------------------------------------------------
        # Receive messages
        # -----------------------------------------------------------

        while True:

            data = await websocket.receive_json()

            print(
                f"[WS] Received: "
                f"conversation={conversation_id}, "
                f"user={user_id}, "
                f"data={data}"
            )

            message_type = data.get("type")

            # -------------------------------------------------------
            # Handle normal user message
            # -------------------------------------------------------

            if message_type == "message":

                print(
                    "[WS] Handling normal user message"
                )

                content = data.get("content")

                if not isinstance(content, str):
                    print(
                        "[WS] Ignoring message: "
                        "content is not a string"
                    )

                    continue

                content = content.strip()

                if not content:
                    print(
                        "[WS] Ignoring message: "
                        "content is empty"
                    )

                    continue

                if len(content) > 10000:
                    print(
                        "[WS] Ignoring message: "
                        "content exceeds limit"
                    )

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

                print(
                    f"[WS] User message saved: "
                    f"message_id={message['_id']}"
                )

                # ---------------------------------------------------
                # Broadcast user message
                #
                # IMPORTANT:
                #
                # No LLM call happens here.
                # Manual user chat is NOT sent to Gemini.
                # ---------------------------------------------------

                event = build_message_event(message)

                await websocket_manager.broadcast(
                    conversation_id=conversation_id,
                    event=event,
                )

                print(
                    "[WS] User message broadcast complete"
                )

            # -------------------------------------------------------
            # Handle Pally-generated conversation
            # -------------------------------------------------------

            elif message_type == "pally_message":

                print(
                    "[PALLY] ======================================="
                )

                print(
                    "[PALLY] Pally conversation requested"
                )

                print(
                    f"[PALLY] conversation_id={conversation_id}"
                )

                print(
                    f"[PALLY] user_id={user_id}"
                )

                # ---------------------------------------------------
                # Start autonomous conversation.
                #
                # The task runs independently from the WebSocket
                # receive loop.
                #
                # This means the WebSocket remains available while
                # Pally A and Pally B are talking.
                # ---------------------------------------------------

                started = start_pally_conversation(
                    user_id=user_id,
                    conversation_id=conversation_id,
                )

                if started:
                    print(
                        "[PALLY] 60-second Pally conversation started"
                    )
                else:
                    print(
                        "[PALLY] Ignoring request because "
                        "conversation is already running"
                    )

                print(
                    "[PALLY] ======================================="
                )

            # -------------------------------------------------------
            # Unknown message type
            # -------------------------------------------------------

            else:

                print(
                    f"[WS] Unknown message type: "
                    f"{message_type!r}"
                )

    except WebSocketDisconnect:

        print(
            f"[WS] Client disconnected: "
            f"conversation={conversation_id}, "
            f"user={user_id}"
        )

    except Exception as exc:

        print(
            f"[WS] Unexpected WebSocket error: "
            f"{type(exc).__name__}: {exc}"
        )

        import traceback

        traceback.print_exc()

    finally:

        await websocket_manager.disconnect(
            conversation_id=conversation_id,
            websocket=websocket,
        )

        print(
            f"[WS] Connection cleaned up: "
            f"conversation={conversation_id}, "
            f"user={user_id}"
        )