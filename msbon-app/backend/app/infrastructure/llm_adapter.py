"""Google Gemini LLM adapter with retry logic."""
import json
import logging
import time

logger = logging.getLogger(__name__)
from typing import Any

from app.config import settings

SYSTEM_INSTRUCTION = """You are a transcript verification assistant for the Mississippi State Board of Nursing (MSBON).
Your only task is to extract structured information from nursing school transcripts.
Do not infer, guess, or fabricate any information.
If a field cannot be determined from the document, return null for that field.
Return ONLY a valid JSON object - no explanation, no markdown, no code fences."""

USER_PROMPT_TEMPLATE = """Extract the following information from this nursing school transcript and return it as JSON.

Required output schema:
{{
  "student_name": string | null,
  "institution_name": string | null,
  "program_name": string | null,
  "degree_type": "ADN" | "BSN" | "MSN" | "DNP" | "LPN" | "OTHER" | null,
  "graduation_date": "YYYY-MM-DD" | null,
  "graduation_confirmed": boolean,
  "enrollment_date": "YYYY-MM-DD" | null,
  "courses": [
    {{
      "code": string | null,
      "name": string,
      "grade": string,
      "credits": number | null,
      "semester": string | null,
      "year": string | null
    }}
  ],
  "extraction_notes": string | null
}}

Rules:
- graduation_confirmed = true ONLY when an explicit degree conferral or graduation statement is present
- Return dates strictly in ISO 8601 format (YYYY-MM-DD)
- Do not populate courses array with non-nursing courses if easily distinguishable

TRANSCRIPT TEXT:
---
{raw_text}
---"""

MAX_RETRIES = 3
BASE_DELAY_SECONDS = 2.0


class LLMAdapter:
    def __init__(self) -> None:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SYSTEM_INSTRUCTION,
        )

    def extract_structured_data(self, raw_text: str) -> dict[str, Any]:
        """Call Gemini with retry. Returns parsed JSON dict."""
        prompt = USER_PROMPT_TEMPLATE.format(raw_text=raw_text)
        last_error: Exception | None = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = self._model.generate_content(prompt)
                text = response.text.strip()
                # Strip accidental markdown fences
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                    text = text.strip()
                parsed = json.loads(text)
                return parsed
            except json.JSONDecodeError as exc:
                raise LLMParseError(f"Gemini returned non-JSON response: {exc}") from exc
            except Exception as exc:
                last_error = exc
                if attempt < MAX_RETRIES:
                    time.sleep(BASE_DELAY_SECONDS * (2 ** (attempt - 1)))

        raise LLMUnavailableError(f"Gemini API unreachable after {MAX_RETRIES} attempts: {last_error}")


class LLMUnavailableError(Exception):
    http_status = 503
    code = "LLM_UNAVAILABLE"

    def __init__(self, detail: str = "LLM service unavailable."):
        self.detail = detail
        super().__init__(detail)


class LLMParseError(Exception):
    http_status = 500
    code = "LLM_PARSE_ERROR"

    def __init__(self, detail: str = "LLM returned unparseable response."):
        self.detail = detail
        super().__init__(detail)
