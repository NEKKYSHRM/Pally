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

    The service determines which Pally should speak next.

    Rules:
    - On a new conversation, the current user's Pally speaks first.
    - After a Pally message exists, the OTHER Pally speaks next.
    - Only Pally-generated messages are used as LLM context.
    """

    CONTEXT_MESSAGE_LIMIT = 15

    async def generate_response(
        self,
        user_id: str,
        conversation_id: str,
    ) -> dict[str, str] | None:
        print(
            "[PALLY SERVICE] ======================================="
        )
        print(
            "[PALLY SERVICE] generate_response() started"
        )
        print(
            f"[PALLY SERVICE] user_id={user_id}"
        )
        print(
            f"[PALLY SERVICE] conversation_id={conversation_id}"
        )

        # -----------------------------------------------------------
        # Get conversation
        # -----------------------------------------------------------

        conversation = await get_conversation_by_id(
            conversation_id=conversation_id,
        )

        if not conversation:
            print(
                "[PALLY SERVICE] STOP: conversation not found"
            )
            return None

        participant_ids = conversation.get(
            "participant_ids",
            [],
        )

        if user_id not in participant_ids:
            print(
                "[PALLY SERVICE] STOP: "
                "current user is not a participant"
            )
            return None

        if len(participant_ids) != 2:
            print(
                "[PALLY SERVICE] STOP: "
                f"expected 2 participants, "
                f"found {len(participant_ids)}"
            )
            return None

        other_user_id = next(
            (
                participant_id
                for participant_id in participant_ids
                if participant_id != user_id
            ),
            None,
        )

        if not other_user_id:
            print(
                "[PALLY SERVICE] STOP: "
                "could not identify other user"
            )
            return None

        # -----------------------------------------------------------
        # Load both Pallys
        # -----------------------------------------------------------

        current_user_pet = await get_pet_by_user_id(
            user_id,
        )

        other_user_pet = await get_pet_by_user_id(
            other_user_id,
        )

        if not current_user_pet:
            print(
                "[PALLY SERVICE] STOP: "
                "current user's Pally not found"
            )
            return None

        if not other_user_pet:
            print(
                "[PALLY SERVICE] STOP: "
                "other user's Pally not found"
            )
            return None

        print(
            "[PALLY SERVICE] Current user Pally: "
            f"{current_user_pet.get('name')}"
        )

        print(
            "[PALLY SERVICE] Other user Pally: "
            f"{other_user_pet.get('name')}"
        )

        current_user_pet_id = str(
            current_user_pet["_id"]
        )

        other_user_pet_id = str(
            other_user_pet["_id"]
        )

        # -----------------------------------------------------------
        # Get recent Pally-only context
        # -----------------------------------------------------------

        previous_messages = (
            await get_recent_pally_messages(
                conversation_id=conversation_id,
                limit=self.CONTEXT_MESSAGE_LIMIT,
            )
        )

        print(
            "[PALLY SERVICE] Recent Pally messages: "
            f"{len(previous_messages)}"
        )

        # -----------------------------------------------------------
        # Determine who should speak next
        # -----------------------------------------------------------

        if not previous_messages:
            # New conversation.
            #
            # The user who initiated the Pally interaction
            # gets the first turn.

            responding_pet = current_user_pet
            responding_pet_id = current_user_pet_id
            other_pet = other_user_pet

            print(
                "[PALLY SERVICE] No previous Pally messages."
            )

            print(
                "[PALLY SERVICE] First speaker: "
                f"{responding_pet.get('name')}"
            )

        else:
            last_message = previous_messages[-1]

            last_pet_id = str(
                last_message["sender_id"]
            )

            print(
                "[PALLY SERVICE] Last Pally speaker: "
                f"{last_pet_id}"
            )

            # The next speaker must always be the OTHER Pally.

            if last_pet_id == current_user_pet_id:
                responding_pet = other_user_pet
                responding_pet_id = other_user_pet_id
                other_pet = current_user_pet

            elif last_pet_id == other_user_pet_id:
                responding_pet = current_user_pet
                responding_pet_id = current_user_pet_id
                other_pet = other_user_pet

            else:
                print(
                    "[PALLY SERVICE] STOP: "
                    "last Pally message belongs to "
                    "an unknown Pally"
                )
                return None

            print(
                "[PALLY SERVICE] Next speaker: "
                f"{responding_pet.get('name')}"
            )

        # -----------------------------------------------------------
        # Build system prompt
        # -----------------------------------------------------------

        system_prompt = build_pally_system_prompt(
            pet=responding_pet,
            other_pet=other_pet,
        )

        print(
            "[PALLY SERVICE] System prompt built"
        )

        # -----------------------------------------------------------
        # Build Gemini conversation
        # -----------------------------------------------------------

        messages = build_pally_messages(
            messages=previous_messages,
            pet_id=responding_pet_id,
        )

        print(
            "[PALLY SERVICE] Gemini messages built: "
            f"count={len(messages)}"
        )

        if messages:
            print(
                "[PALLY SERVICE] Gemini final role: "
                f"{messages[-1]['role']}"
            )

        # -----------------------------------------------------------
        # Generate response
        # -----------------------------------------------------------

        print(
            "[PALLY SERVICE] Calling GeminiService..."
        )

        response = await gemini_service.generate_response(
            system_prompt=system_prompt,
            messages=messages,
        )

        if not response:
            print(
                "[PALLY SERVICE] Gemini returned empty response"
            )
            return None

        response = response.strip()

        print(
            "[PALLY SERVICE] Gemini response length="
            f"{len(response)}"
        )

        print(
            "[PALLY SERVICE] Responding Pally="
            f"{responding_pet.get('name')}"
        )

        print(
            "[PALLY SERVICE] Responding Pally ID="
            f"{responding_pet_id}"
        )

        print(
            "[PALLY SERVICE] ======================================="
        )

        return {
            "pet_id": responding_pet_id,
            "content": response,
        }


pally_chat_service = PallyChatService()