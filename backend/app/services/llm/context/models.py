from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class PallyProfileContext:
    """
    Information about a Pally involved in the conversation.
    """

    id: str
    name: str
    personality: list[str] = field(default_factory=list)
    humor: list[str] = field(default_factory=list)
    languages: list[str] = field(default_factory=list)
    interests: list[str] = field(default_factory=list)
    is_active: bool = True
    activity_enabled: bool = False


@dataclass
class UserProfileContext:
    """
    Information about a Pally's owner.
    """

    id: str
    name: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    profession: str | None = None


@dataclass
class RelationshipContext:
    """
    How the Pally's owner relates to the other user.
    """

    relationship: str | None = None
    tone: str | None = None
    humor_level: str | None = None
    language: str | None = None
    custom_instruction: str | None = None


@dataclass
class ConversationContext:
    """
    Basic information about the current conversation.
    """

    conversation_id: str
    participant_ids: list[str] = field(default_factory=list)
    is_active: bool = True
    context_summary: str | None = None


@dataclass
class PallyContext:
    """
    Complete context available to PALLY for a conversation.

    This object is the single structured representation of the
    social situation that will eventually be passed to the
    behavior resolver and prompt builder.
    """

    current_user: UserProfileContext
    current_pally: PallyProfileContext

    other_user: UserProfileContext
    other_pally: PallyProfileContext

    relationship: RelationshipContext

    conversation: ConversationContext

    recent_pally_messages: list[dict] = field(default_factory=list)

    created_at: datetime = field(default_factory=datetime.utcnow)