import asyncio

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
        # Generate response with retry handling
        # -----------------------------------------------------------

        max_attempts = 3

        for attempt in range(1, max_attempts + 1):

            try:

                print(
                    "[GEMINI] Generate attempt "
                    f"{attempt}/{max_attempts}"
                )

                response = (
                    await self.client.aio.models.generate_content(
                        model="gemini-3.6-flash",
                        contents=contents,
                        config={
                            "system_instruction": system_prompt,
                        },
                    )
                )

                if not response.text:
                    return ""

                return response.text.strip()

            except Exception as exc:

                print(
                    "[GEMINI] Generation failed: "
                    f"{type(exc).__name__}: {exc}"
                )

                # ---------------------------------------------------
                # If this was the final attempt, let the exception
                # propagate to PallyChatService.
                # ---------------------------------------------------

                if attempt == max_attempts:
                    raise

                # ---------------------------------------------------
                # Wait before retrying.
                #
                # 2 seconds before attempt 2
                # 4 seconds before attempt 3
                # ---------------------------------------------------

                retry_delay = attempt * 2

                print(
                    "[GEMINI] Retrying in "
                    f"{retry_delay}s..."
                )

                await asyncio.sleep(retry_delay)


gemini_service = GeminiService()