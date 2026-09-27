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


def pet_response(pet: dict) -> dict:
    return {
        "id": str(pet["_id"]),
        "user_id": pet["user_id"],
        "name": pet["name"],
        "personality": pet["personality"],
        "humor": pet["humor"],
        "languages": pet["languages"],
        "interests": pet["interests"],
        "mood": pet["mood"],
        "is_active": pet["is_active"],
        "activity_enabled": pet["activity_enabled"],
        "created_at": pet["created_at"],
        "updated_at": pet["updated_at"],
    }


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_user_pet(
    pet_data: PetCreate,
    user_id: str = Depends(get_current_user),
):
    existing_pet = await get_pet_by_user_id(user_id)

    if existing_pet:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has a Pally",
        )

    pet = await create_pet(
        user_id=user_id,
        name=pet_data.name,
        personality=pet_data.personality,
        humor=pet_data.humor,
        languages=pet_data.languages,
        interests=pet_data.interests,
        mood=pet_data.mood,
    )

    return pet_response(pet)


@router.get("")
async def get_user_pet(
    user_id: str = Depends(get_current_user),
):
    pet = await get_pet_by_user_id(user_id)

    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return pet_response(pet)


@router.patch("")
async def update_user_pet(
    pet_data: PetUpdate,
    user_id: str = Depends(get_current_user),
):
    pet = await update_pet(
        user_id=user_id,
        name=pet_data.name,
        personality=pet_data.personality,
        humor=pet_data.humor,
        languages=pet_data.languages,
        interests=pet_data.interests,
        mood=pet_data.mood,
        is_active=pet_data.is_active,
        activity_enabled=pet_data.activity_enabled,
    )

    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return pet_response(pet)


@router.delete("")
async def delete_user_pet(
    user_id: str = Depends(get_current_user),
):
    deleted = await delete_pet(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pally not found",
        )

    return {
        "message": "Pally deleted successfully"
    }