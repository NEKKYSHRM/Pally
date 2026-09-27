from datetime import datetime, timezone

from bson import ObjectId

from app.db.database import database
from app.models.connection import ConnectionModel


connections_collection = database[ConnectionModel.collection_name]


async def create_connection(
    requester_id: str,
    receiver_id: str,
) -> dict:
    now = datetime.now(timezone.utc)

    connection = ConnectionModel(
        requester_id=requester_id,
        receiver_id=receiver_id,
        status="pending",
        created_at=now,
        updated_at=now,
    )

    result = await connections_collection.insert_one(
        connection.to_document()
    )

    return await connections_collection.find_one(
        {"_id": result.inserted_id}
    )


async def get_connection_by_id(
    connection_id: str,
) -> dict | None:
    return await connections_collection.find_one(
        {"_id": ObjectId(connection_id)}
    )


async def get_connection_between_users(
    user_a_id: str,
    user_b_id: str,
) -> dict | None:
    return await connections_collection.find_one(
        {
            "$or": [
                {
                    "requester_id": user_a_id,
                    "receiver_id": user_b_id,
                },
                {
                    "requester_id": user_b_id,
                    "receiver_id": user_a_id,
                },
            ]
        }
    )


async def get_user_connections(
    user_id: str,
) -> list[dict]:
    cursor = connections_collection.find(
        {
            "$or": [
                {"requester_id": user_id},
                {"receiver_id": user_id},
            ]
        }
    ).sort("updated_at", -1)

    return await cursor.to_list(length=None)


async def get_pending_received_connections(
    user_id: str,
) -> list[dict]:
    cursor = connections_collection.find(
        {
            "receiver_id": user_id,
            "status": "pending",
        }
    ).sort("created_at", -1)

    return await cursor.to_list(length=None)


async def get_pending_sent_connections(
    user_id: str,
) -> list[dict]:
    cursor = connections_collection.find(
        {
            "requester_id": user_id,
            "status": "pending",
        }
    ).sort("created_at", -1)

    return await cursor.to_list(length=None)


async def update_connection_status(
    connection_id: str,
    status: str,
) -> dict | None:
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc),
    }

    return await connections_collection.find_one_and_update(
        {"_id": ObjectId(connection_id)},
        {"$set": update_data},
        return_document=True,
    )


async def update_relationship_preferences(
    connection_id: str,
    user_id: str,
    preferences: dict,
) -> dict | None:
    """
    Update the relationship preferences belonging to the
    current user.

    The user can only update their own side of the connection.
    """

    connection = await connections_collection.find_one(
        {"_id": ObjectId(connection_id)}
    )

    if not connection:
        return None

    if connection["requester_id"] == user_id:
        preferences_field = "requester_preferences"

    elif connection["receiver_id"] == user_id:
        preferences_field = "receiver_preferences"

    else:
        return None

    update_data = {
        preferences_field: preferences,
        "updated_at": datetime.now(timezone.utc),
    }

    return await connections_collection.find_one_and_update(
        {"_id": ObjectId(connection_id)},
        {"$set": update_data},
        return_document=True,
    )


async def delete_connection(
    connection_id: str,
) -> bool:
    result = await connections_collection.delete_one(
        {"_id": ObjectId(connection_id)}
    )

    return result.deleted_count > 0