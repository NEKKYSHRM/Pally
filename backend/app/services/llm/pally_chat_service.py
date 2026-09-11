from app.crud.conversation import get_conversation_by_id
from app.crud.message import get_recent_pally_messages
from app.crud.pet import get_pet_by_user_id
from app.services.llm.gemini_service import gemini_service
from app.services.llm.pally_prompt import (
    build_pally_messages,
    build_pally_system_prompt,
)


class PallyChatService:
    """
    Orchestrates Pally-to-Pally LLM conversations.

    This service is responsible for:
    - loading both Pallys in the conversation
    - identifying the current Pally
    - loading recent Pally-only conversation context
    - building the Pally prompt
    - calling Gemini
    """

    CONTEXT_MESSAGE_LIMIT = 15

    async def generate_response(
        self,
        user_id: str,
        conversation_id: str,
    ) -> str | None:
        """
        Generate a response for the current user's Pally.

        Only previous Pally-generated messages are used
        as LLM conversation context.
        """

        # -----------------------------------------------------------
        # Get conversation
        # -----------------------------------------------------------

        conversation = await get_conversation_by_id(
            conversation_id=conversation_id,
        )

        if not conversation:
            return None

        participant_ids = conversation.get(
            "participant_ids",
            [],
        )

        if user_id not in participant_ids:
            return None

        # -----------------------------------------------------------
        # Conversation must contain two participants
        # -----------------------------------------------------------

        if len(participant_ids) != 2:
            return None

        # -----------------------------------------------------------
        # Identify current user and other user
        # -----------------------------------------------------------

        other_user_id = next(
            (
                participant_id
                for participant_id in participant_ids
                if participant_id != user_id
            ),
            None,
        )

        if not other_user_id:
            return None

        # -----------------------------------------------------------
        # Get both Pallys
        # -----------------------------------------------------------

        current_pet = await get_pet_by_user_id(
            user_id,
        )

        other_pet = await get_pet_by_user_id(
            other_user_id,
        )

        if not current_pet or not other_pet:
            return None

        current_pet_id = str(
            current_pet["_id"]
        )

        # -----------------------------------------------------------
        # Get recent Pally-only conversation context
        # -----------------------------------------------------------

        previous_messages = await get_recent_pally_messages(
            conversation_id=conversation_id,
            limit=self.CONTEXT_MESSAGE_LIMIT,
        )

        # -----------------------------------------------------------
        # Build system prompt
        # -----------------------------------------------------------

        system_prompt = build_pally_system_prompt(
            pet=current_pet,
            other_pet=other_pet,
        )

        # -----------------------------------------------------------
        # Build Gemini conversation messages
        # -----------------------------------------------------------

        messages = build_pally_messages(
            messages=previous_messages,
            pet_id=current_pet_id,
        )

        # -----------------------------------------------------------
        # Generate response
        # -----------------------------------------------------------

        response = await gemini_service.generate_response(
            system_prompt=system_prompt,
            messages=messages,
        )

        return response.strip()


pally_chat_service = PallyChatService()