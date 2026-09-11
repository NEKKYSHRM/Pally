from google import genai

from app.core.config import settings


class GeminiService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    async def generate_response(
        self,
        system_prompt: str,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Generate a response using Gemini.

        messages must contain Gemini-compatible roles:
        - user  -> other Pally
        - model -> current Pally
        """

        contents = []

        for message in messages:
            role = message["role"]
            content = message["content"].strip()

            if role not in {"user", "model"}:
                continue

            if not content:
                continue

            contents.append(
                {
                    "role": role,
                    "parts": [
                        {
                            "text": content,
                        }
                    ],
                }
            )

        # -----------------------------------------------------------
        # Gemini needs a user turn to start a conversation.
        #
        # If there is no previous Pally message, start the
        # conversation with a small instruction.
        # -----------------------------------------------------------

        if not contents:
            contents.append(
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                "Start a natural conversation with "
                                "the other Pally."
                            ),
                        }
                    ],
                }
            )

        # -----------------------------------------------------------
        # Generate response
        # -----------------------------------------------------------

        response = await self.client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config={
                "system_instruction": system_prompt,
            },
        )

        if not response.text:
            return ""

        return response.text.strip()


gemini_service = GeminiService()