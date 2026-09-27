from pydantic import BaseModel, Field, field_validator

ALLOWED_LANGUAGES = {
    "hindi",
    "english",
    "hinglish",
}


def validate_languages(
    languages: list[str] | None,
) -> list[str] | None:
    if languages is None:
        return None

    normalized_languages = [
        language.strip().lower()
        for language in languages
    ]

    invalid_languages = [
        language
        for language in normalized_languages
        if language not in ALLOWED_LANGUAGES
    ]

    if invalid_languages:
        raise ValueError(
            f"Unsupported language(s): {', '.join(invalid_languages)}. "
            f"Allowed languages: {', '.join(sorted(ALLOWED_LANGUAGES))}"
        )

    return normalized_languages


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

    @field_validator("languages")
    @classmethod
    def validate_language_values(
        cls,
        languages: list[str],
    ) -> list[str]:
        return validate_languages(languages) or []


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
    mood: str | None = None
    is_active: bool | None = None
    activity_enabled: bool | None = None

    @field_validator("languages")
    @classmethod
    def validate_language_values(
        cls,
        languages: list[str] | None,
    ) -> list[str] | None:
        return validate_languages(languages)


class PetResponse(BaseModel):
    id: str
    user_id: str
    name: str
    personality: list[str]
    humor: list[str]
    languages: list[str]
    interests: list[str]
    mood: str
    is_active: bool
    activity_enabled: bool
    created_at: str
    updated_at: str