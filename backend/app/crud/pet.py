from datetime import datetime, timezone

from app.db.database import database
from app.models.pet import PetModel


pets_collection = database[PetModel.collection_name]


# -------------------------------------------------------------------
# Get Pet
# -------------------------------------------------------------------

async def get_pet_by_user_id(
    user_id: str,
) -> dict | None:
    return await pets_collection.find_one(
        {"user_id": user_id}
    )


# -------------------------------------------------------------------
# Create Pet
# -------------------------------------------------------------------

async def create_pet(
    user_id: str,
    name: str,
    personality: list[str],
    humor: list[str],
    languages: list[str],
    interests: list[str],
) -> dict:
    now = datetime.now(timezone.utc)

    pet = PetModel(
        user_id=user_id,
        name=name,
        personality=personality,
        humor=humor,
        languages=languages,
        interests=interests,
        is_active=True,
        activity_enabled=True,
        created_at=now,
        updated_at=now,
    )

    result = await pets_collection.insert_one(
        pet.to_document()
    )

    return await pets_collection.find_one(
        {"_id": result.inserted_id}
    )


# -------------------------------------------------------------------
# Update Pet
# -------------------------------------------------------------------

async def update_pet(
    user_id: str,
    name: str | None = None,
    personality: list[str] | None = None,
    humor: list[str] | None = None,
    languages: list[str] | None = None,
    interests: list[str] | None = None,
    is_active: bool | None = None,
    activity_enabled: bool | None = None,
) -> dict | None:

    update_data = {
        "updated_at": datetime.now(timezone.utc)
    }

    if name is not None:
        update_data["name"] = name

    if personality is not None:
        update_data["personality"] = personality

    if humor is not None:
        update_data["humor"] = humor

    if languages is not None:
        update_data["languages"] = languages

    if interests is not None:
        update_data["interests"] = interests

    if is_active is not None:
        update_data["is_active"] = is_active

    if activity_enabled is not None:
        update_data["activity_enabled"] = activity_enabled

    return await pets_collection.find_one_and_update(
        {"user_id": user_id},
        {"$set": update_data},
        return_document=True,
    )


# -------------------------------------------------------------------
# Delete Pet
# -------------------------------------------------------------------

async def delete_pet(
    user_id: str,
) -> bool:

    result = await pets_collection.delete_one(
        {"user_id": user_id}
    )

    return result.deleted_count > 0