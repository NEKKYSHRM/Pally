from fastapi import APIRouter, Depends, HTTPException, status

from app.api.endpoints.auth import get_current_user

from app.crud.connection import (
    create_connection,
    delete_connection,
    get_connection_between_users,
    get_connection_by_id,
    get_pending_received_connections,
    get_pending_sent_connections,
    get_user_connections,
    update_connection_status,
    update_relationship_preferences,
)

from app.crud.user import (
    get_user_by_id,
    get_user_by_username,
)

from app.schemas.connection import (
    ConnectionCreate,
    ConnectionResponse,
    ConnectionStatusUpdate,
    RelationshipPreferenceUpdate,
)


router = APIRouter(
    prefix="/connections",
    tags=["Connections"],
)


# -------------------------------------------------------------------
# Convert connection document to API response
# -------------------------------------------------------------------

async def connection_to_response(
    connection: dict,
    current_user_id: str,
) -> dict:
    requester_id = connection["requester_id"]
    receiver_id = connection["receiver_id"]

    # Determine who the other user is.
    if requester_id == current_user_id:
        friend_id = receiver_id
        preferences = connection.get(
            "requester_preferences",
            {},
        )
    else:
        friend_id = requester_id
        preferences = connection.get(
            "receiver_preferences",
            {},
        )

    friend = await get_user_by_id(friend_id)

    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend user not found",
        )

    return {
        "id": str(connection["_id"]),
        "requester_id": requester_id,
        "receiver_id": receiver_id,
        "status": connection["status"],
        "relationship_preferences": preferences,
        "created_at": connection["created_at"],
        "updated_at": connection["updated_at"],
        "friend": {
            "id": str(friend["_id"]),
            "username": friend["username"],
            "name": friend.get("name"),
            "picture": friend.get("picture"),
        },
    }


# -------------------------------------------------------------------
# Send connection request
# -------------------------------------------------------------------

@router.post(
    "",
    response_model=ConnectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_connection_request(
    connection_data: ConnectionCreate,
    user_id: str = Depends(get_current_user),
):
    username = connection_data.username.strip().lower()

    receiver = await get_user_by_username(username)

    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not receiver.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    receiver_id = str(receiver["_id"])

    if receiver_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a connection request to yourself",
        )

    existing_connection = await get_connection_between_users(
        user_a_id=user_id,
        user_b_id=receiver_id,
    )

    if existing_connection:
        existing_status = existing_connection["status"]

        if existing_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A connection request already exists",
            )

        if existing_status == "accepted":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already connected with this user",
            )

        if existing_status == "blocked":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Connection with this user is blocked",
            )

        if existing_status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A previous connection request was rejected",
            )

    connection = await create_connection(
        requester_id=user_id,
        receiver_id=receiver_id,
    )

    return await connection_to_response(
        connection,
        current_user_id=user_id,
    )


# -------------------------------------------------------------------
# Get all connections
# -------------------------------------------------------------------

@router.get(
    "",
    response_model=list[ConnectionResponse],
)
async def get_connections(
    user_id: str = Depends(get_current_user),
):
    connections = await get_user_connections(
        user_id=user_id,
    )

    return [
        await connection_to_response(
            connection,
            current_user_id=user_id,
        )
        for connection in connections
    ]


# -------------------------------------------------------------------
# Get received pending requests
# -------------------------------------------------------------------

@router.get(
    "/requests/received",
    response_model=list[ConnectionResponse],
)
async def get_received_connection_requests(
    user_id: str = Depends(get_current_user),
):
    connections = await get_pending_received_connections(
        user_id=user_id,
    )

    return [
        await connection_to_response(
            connection,
            current_user_id=user_id,
        )
        for connection in connections
    ]


# -------------------------------------------------------------------
# Get sent pending requests
# -------------------------------------------------------------------

@router.get(
    "/requests/sent",
    response_model=list[ConnectionResponse],
)
async def get_sent_connection_requests(
    user_id: str = Depends(get_current_user),
):
    connections = await get_pending_sent_connections(
        user_id=user_id,
    )

    return [
        await connection_to_response(
            connection,
            current_user_id=user_id,
        )
        for connection in connections
    ]


# -------------------------------------------------------------------
# Get connection by ID
# -------------------------------------------------------------------

@router.get(
    "/{connection_id}",
    response_model=ConnectionResponse,
)
async def get_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user),
):
    connection = await get_connection_by_id(
        connection_id=connection_id,
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    if (
        connection["requester_id"] != user_id
        and connection["receiver_id"] != user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this connection",
        )

    return await connection_to_response(
        connection,
        current_user_id=user_id,
    )


# -------------------------------------------------------------------
# Update relationship preferences
# -------------------------------------------------------------------

@router.patch(
    "/{connection_id}/preferences",
    response_model=ConnectionResponse,
)
async def update_preferences(
    connection_id: str,
    preferences_data: RelationshipPreferenceUpdate,
    user_id: str = Depends(get_current_user),
):
    connection = await get_connection_by_id(
        connection_id=connection_id,
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    if user_id not in (
        connection["requester_id"],
        connection["receiver_id"],
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this connection",
        )

    updated_connection = await update_relationship_preferences(
        connection_id=connection_id,
        user_id=user_id,
        preferences=preferences_data.model_dump(),
    )

    if not updated_connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    return await connection_to_response(
        updated_connection,
        current_user_id=user_id,
    )


# -------------------------------------------------------------------
# Update connection status
# -------------------------------------------------------------------

@router.patch(
    "/{connection_id}",
    response_model=ConnectionResponse,
)
async def update_connection(
    connection_id: str,
    status_data: ConnectionStatusUpdate,
    user_id: str = Depends(get_current_user),
):
    connection = await get_connection_by_id(
        connection_id=connection_id,
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    requester_id = connection["requester_id"]
    receiver_id = connection["receiver_id"]
    current_status = connection["status"]
    new_status = status_data.status

    if user_id not in (requester_id, receiver_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this connection",
        )

    if new_status in ("accepted", "rejected"):
        if current_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending connection requests can be accepted or rejected",
            )

        if user_id != receiver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the receiver can accept or reject this request",
            )

    if new_status == "blocked":
        if current_status == "blocked":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Connection is already blocked",
            )

    updated_connection = await update_connection_status(
        connection_id=connection_id,
        status=new_status,
    )

    if not updated_connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    return await connection_to_response(
        updated_connection,
        current_user_id=user_id,
    )


# -------------------------------------------------------------------
# Delete connection
# -------------------------------------------------------------------

@router.delete(
    "/{connection_id}",
)
async def remove_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user),
):
    connection = await get_connection_by_id(
        connection_id=connection_id,
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    if user_id not in (
        connection["requester_id"],
        connection["receiver_id"],
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this connection",
        )

    deleted = await delete_connection(
        connection_id=connection_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    return {
        "message": "Connection removed successfully",
    }