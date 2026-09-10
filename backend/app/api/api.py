from fastapi import APIRouter

from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.pet import router as pet_router
from app.api.endpoints.user import router as user_router
from app.api.endpoints.conversation import router as conversation_router
from app.api.endpoints.message import router as message_router


api_router = APIRouter()


api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(pet_router)
api_router.include_router(conversation_router)
api_router.include_router(message_router)