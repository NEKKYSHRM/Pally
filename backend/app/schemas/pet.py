from pydantic import BaseModel, Field


# -------------------------------------------------------------------
# Allowed values
# -------------------------------------------------------------------

ALLOWED_LANGUAGES = {
    "hindi",
    "english",
    "hinglish",
}   


# -------------------------------------------------------------------
# Create Pet
# -------------------------------------------------------------------

class PetCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=50,
    )

    personality: list[str] = Field(
        default_factory=list,
        max_length=10,
    )

    humor: list[str] = Field(
        default_factory=list,
        max_length=10,
    )

    languages: list[str] = Field(
        default_factory=lambda: ["english"],
        min_length=1,
        max_length=3,
    )

    interests: list[str] = Field(
        default_factory=list,
        max_length=20,
    )


# -------------------------------------------------------------------
# Update Pet
# -------------------------------------------------------------------

class PetUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    personality: list[str] | None = Field(
        default=None,
        max_length=10,
    )

    humor: list[str] | None = Field(
        default=None,
        max_length=10,
    )

    languages: list[str] | None = Field(
        default=None,
        min_length=1,
        max_length=3,
    )

    interests: list[str] | None = Field(
        default=None,
        max_length=20,
    )

    is_active: bool | None = None

    activity_enabled: bool | None = None


# -------------------------------------------------------------------
# Pet Response
# -------------------------------------------------------------------

class PetResponse(BaseModel):
    id: str

    user_id: str

    name: str

    personality: list[str]

    humor: list[str]

    languages: list[str]

    interests: list[str]

    is_active: bool

    activity_enabled: bool

    created_at: str

    updated_at: str