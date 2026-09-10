from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo import ASCENDING

from app.core.config import settings


client = AsyncMongoClient(
    settings.MONGODB_URL
)

database: AsyncDatabase = client[
    settings.MONGODB_DATABASE
]


async def connect_to_database() -> None:
    await client.admin.command("ping")

    # ---------------------------------------------------------------
    # Users indexes
    # ---------------------------------------------------------------

    await database.users.create_index(
        [("username", ASCENDING)],
        unique=True,
        partialFilterExpression={
            "username": {
                "$type": "string"
            }
        },
        name="unique_username",
    )

    print("Connected to MongoDB")


async def close_database_connection() -> None:
    await client.close()

    print("MongoDB connection closed")