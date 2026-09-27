from google import genai
from google.genai import types

from app.core.config import settings


class GeminiService:

    MODEL = "gemini-3.6-flash"

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(
                retry_options=types.HttpRetryOptions(
                    attempts=4,
                    initial_delay=2.0,
                    exp_base=2.0,
                    max_delay=10.0,
                    jitter=1.0,
                    http_status_codes=[
                        408,
                        429,
                        500,
                        502,
                        503,
                        504,
                    ],
                ),
            ),
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
        #
        # The google-genai SDK handles transient retries such as
        # 429 and 5xx errors using the retry configuration above.
        # -----------------------------------------------------------

        try:
            print(
                f"[GEMINI] Generating response "
                f"using {self.MODEL}"
            )

            response = (
                await self.client.aio.models.generate_content(
                    model=self.MODEL,
                    contents=contents,
                    config={
                        "system_instruction": system_prompt,
                    },
                )
            )

            if not response.text:
                print(
                    "[GEMINI] Generation returned empty response"
                )
                return ""

            result = response.text.strip()

            print(
                "[GEMINI] Response generated successfully "
                f"(length={len(result)})"
            )

            return result

        except Exception as exc:
            print(
                "[GEMINI] Generation failed after SDK retries: "
                f"{type(exc).__name__}: {exc}"
            )
            raise


gemini_service = GeminiService()