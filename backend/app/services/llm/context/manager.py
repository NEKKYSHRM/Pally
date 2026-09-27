from app.crud.connection import get_connection_between_users
from app.crud.conversation import get_conversation_by_id
from app.crud.message import get_recent_pally_messages
from app.crud.pet import get_pet_by_user_id
from app.crud.user import get_user_by_id

from app.services.llm.context.models import (
    ConversationContext,
    PallyContext,
    PallyProfileContext,
    RelationshipContext,
    UserProfileContext,
)


class PallyContextManager:
    """
    Builds the complete context required by a Pally for a conversation.

    The manager collects information from the different application
    domains and converts it into a single PallyContext object.
    """

    async def build(
        self,
        conversation_id: str,
        current_user_id: str,
        responding_pet_id: str,
    ) -> PallyContext:

        # -----------------------------------------------------------
        # Get conversation
        # -----------------------------------------------------------

        conversation = await get_conversation_by_id(
            conversation_id
        )

        if not conversation:
            raise ValueError("Conversation not found")

        participant_ids = conversation["participant_ids"]

        if len(participant_ids) != 2:
            raise ValueError(
                "Pally conversation must have exactly two participants"
            )

        if current_user_id not in participant_ids:
            raise ValueError(
                "Current user is not a conversation participant"
            )

        # -----------------------------------------------------------
        # Find the other user
        # -----------------------------------------------------------

        other_user_id = next(
            user_id
            for user_id in participant_ids
            if user_id != current_user_id
        )

        # -----------------------------------------------------------
        # Get users
        # -----------------------------------------------------------

        current_user = await get_user_by_id(
            current_user_id
        )

        other_user = await get_user_by_id(
            other_user_id
        )

        if not current_user:
            raise ValueError("Current user not found")

        if not other_user:
            raise ValueError("Other user not found")

        # -----------------------------------------------------------
        # Get Pallys
        # -----------------------------------------------------------

        current_pally = await get_pet_by_user_id(
            current_user_id
        )

        other_pally = await get_pet_by_user_id(
            other_user_id
        )

        if not current_pally:
            raise ValueError(
                "Current user's Pally not found"
            )

        if not other_pally:
            raise ValueError(
                "Other user's Pally not found"
            )

        # -----------------------------------------------------------
        # Verify responding Pally
        # -----------------------------------------------------------

        if str(current_pally["_id"]) != responding_pet_id:
            raise ValueError(
                "Responding Pally does not belong to current user"
            )

        # -----------------------------------------------------------
        # Get relationship
        # -----------------------------------------------------------

        connection = await get_connection_between_users(
            current_user_id,
            other_user_id,
        )

        relationship = self._build_relationship_context(
            connection=connection,
            current_user_id=current_user_id,
        )

        # -----------------------------------------------------------
        # Get recent Pally messages
        # -----------------------------------------------------------

        recent_pally_messages = (
            await get_recent_pally_messages(
                conversation_id,
                limit=15,
            )
        )

        # -----------------------------------------------------------
        # Build complete context
        # -----------------------------------------------------------

        return PallyContext(
            current_user=self._build_user_context(
                current_user
            ),
            current_pally=self._build_pally_context(
                current_pally
            ),
            other_user=self._build_user_context(
                other_user
            ),
            other_pally=self._build_pally_context(
                other_pally
            ),
            relationship=relationship,
            conversation=ConversationContext(
                conversation_id=str(
                    conversation["_id"]
                ),
                participant_ids=participant_ids,
                is_active=conversation.get(
                    "is_active",
                    True,
                ),
                context_summary=conversation.get(
                    "context_summary"
                ),
            ),
            recent_pally_messages=recent_pally_messages,
        )

    # ---------------------------------------------------------------
    # User Context
    # ---------------------------------------------------------------

    def _build_user_context(
        self,
        user: dict,
    ) -> UserProfileContext:

        return UserProfileContext(
            id=str(user["_id"]),
            name=user.get("name"),
            date_of_birth=user.get("date_of_birth"),
            gender=user.get("gender"),
            profession=user.get("profession"),
        )

    # ---------------------------------------------------------------
    # Pally Context
    # ---------------------------------------------------------------

    def _build_pally_context(
        self,
        pet: dict,
    ) -> PallyProfileContext:

        return PallyProfileContext(
            id=str(pet["_id"]),
            name=pet.get("name", ""),
            personality=pet.get(
                "personality",
                [],
            ),
            humor=pet.get(
                "humor",
                [],
            ),
            languages=pet.get(
                "languages",
                [],
            ),
            interests=pet.get(
                "interests",
                [],
            ),
            is_active=pet.get(
                "is_active",
                True,
            ),
            activity_enabled=pet.get(
                "activity_enabled",
                False,
            ),
        )

    # ---------------------------------------------------------------
    # Relationship Context
    # ---------------------------------------------------------------

    def _build_relationship_context(
        self,
        connection: dict | None,
        current_user_id: str,
    ) -> RelationshipContext:

        if not connection:
            return RelationshipContext()

        # -----------------------------------------------------------
        # Select the preferences belonging to the current user.
        #
        # requester_preferences -> requester controls how their
        # Pally behaves toward the receiver.
        #
        # receiver_preferences -> receiver controls how their
        # Pally behaves toward the requester.
        # -----------------------------------------------------------

        if connection["requester_id"] == current_user_id:

            preferences = connection.get(
                "requester_preferences",
                {},
            )

        elif connection["receiver_id"] == current_user_id:

            preferences = connection.get(
                "receiver_preferences",
                {},
            )

        else:
            raise ValueError(
                "Current user is not part of the connection"
            )

        return RelationshipContext(
            relationship=preferences.get(
                "relationship"
            ),
            tone=preferences.get(
                "tone"
            ),
            humor_level=preferences.get(
                "humor_level"
            ),
            language=preferences.get(
                "language"
            ),
            custom_instruction=preferences.get(
                "custom_instruction"
            ),
        )


pally_context_manager = PallyContextManager()