from fastapi import APIRouter, Depends, HTTPException, status

from app.api.endpoints.auth import get_current_user
from app.crud.pet import (
    create_pet,
    delete_pet,
    get_pet_by_user_id,
    update_pet,
)
from app.schemas.pet import PetCreate, PetUpdate


router = APIRouter(
    prefix="/pet",
    tags=["Pet"],
)


# -------------------------------------------------------------------
# Create Pet
# -------------------------------------------------------------------

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_user_pet(
    pet_data: PetCreate,
    user_id: str = Depends(get_current_user),
):
    """
    Create a Pally for the authenticated user.

    Each user can have only one Pally.
    """

    # ---------------------------------------------------------------
    # Check whether user already has a Pally
    # ---------------------------------------------------------------

    existing_pet = await get_pet_by_user_id(user_id)

    if existing_pet:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has a Pally",
        )

    # ---------------------------------------------------------------
    # Create Pally
    # ---------------------------------------------------------------

    pet = await create_pet(
        user_id=user_id,
        name=pet_data.name,
        personality=pet_data.personality,
        humor=pet_data.humor,
        languages=pet_data.languages,
        interests=pet_data.interests,
    )

    return {
        "id": str(pet["_id"]),
        "user_id": pet["user_id"],
        "name": pet["name"],
        "personality": pet["personality"],
        "humor": pet["humor"],
        "languages": pet["languages"],
        "interests": pet["interests"],
        "is_active": pet["is_active"],
        "activity_enabled": pet["activity_enabled"],
        "created_at": pet["created_at"],
        "updated_at": pet["updated_at"],
    }


# -------------------------------------------------------------------
# Get Pet
# -------------------------------------------------------------------

@router.get("")
async def get_user_pet(
    user_id: str = Depends(get_current_user),
):
    """
    Get the authenticated user's Pally.
    """

    pet = await get_pet_by_user_id(user_id)

    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return {
        "id": str(pet["_id"]),
        "user_id": pet["user_id"],
        "name": pet["name"],
        "personality": pet["personality"],
        "humor": pet["humor"],
        "languages": pet["languages"],
        "interests": pet["interests"],
        "is_active": pet["is_active"],
        "activity_enabled": pet["activity_enabled"],
        "created_at": pet["created_at"],
        "updated_at": pet["updated_at"],
    }


# -------------------------------------------------------------------
# Update Pet
# -------------------------------------------------------------------

@router.patch("")
async def update_user_pet(
    pet_data: PetUpdate,
    user_id: str = Depends(get_current_user),
):
    """
    Update the authenticated user's Pally.
    """

    pet = await update_pet(
        user_id=user_id,
        name=pet_data.name,
        personality=pet_data.personality,
        humor=pet_data.humor,
        languages=pet_data.languages,
        interests=pet_data.interests,
        is_active=pet_data.is_active,
        activity_enabled=pet_data.activity_enabled,
    )

    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return {
        "id": str(pet["_id"]),
        "user_id": pet["user_id"],
        "name": pet["name"],
        "personality": pet["personality"],
        "humor": pet["humor"],
        "languages": pet["languages"],
        "interests": pet["interests"],
        "is_active": pet["is_active"],
        "activity_enabled": pet["activity_enabled"],
        "created_at": pet["created_at"],
        "updated_at": pet["updated_at"],
    }


# -------------------------------------------------------------------
# Delete Pet
# -------------------------------------------------------------------

@router.delete("")
async def delete_user_pet(
    user_id: str = Depends(get_current_user),
):
    """
    Delete the authenticated user's Pally.
    """

    deleted = await delete_pet(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return {
        "message": "Pally deleted successfully"
    }