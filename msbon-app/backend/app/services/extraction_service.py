"""Run OCR + LLM extraction pipeline for a transcript."""
import json
import logging
import uuid

logger = logging.getLogger(__name__)
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import ExtractionFailedError, LLMUnavailableError, LLMParseError
from app.infrastructure.document_extractor import extract_text
from app.infrastructure.document_extractor import ExtractionFailedError as ExtractorError
from app.infrastructure.llm_adapter import LLMAdapter
from app.infrastructure.llm_adapter import LLMUnavailableError as LLMUnavailError
from app.infrastructure.llm_adapter import LLMParseError as LLMParsErr
from app.infrastructure.mock_llm_adapter import MockLLMAdapter


def _build_default_llm_adapter():
    """Return MockLLMAdapter when GEMINI_API_KEY starts with 'mock', else real."""
    if MockLLMAdapter.is_active(settings.gemini_api_key):
        logger.info("Using MockLLMAdapter (GEMINI_API_KEY starts with 'mock').")
        return MockLLMAdapter()
    return LLMAdapter()
from app.models.orm.extracted_data import ExtractedData
from app.repositories.transcript_repository import TranscriptRepository
from app.services.audit_service import AuditService


class ExtractionService:
    def __init__(self, db: Session, llm_adapter: LLMAdapter | None = None) -> None:
        self.db = db
        self.repo = TranscriptRepository(db)
        self.audit = AuditService(db)
        self.llm = llm_adapter or _build_default_llm_adapter()

    def process(self, transcript_id: str, actor_id: str = "system") -> ExtractedData:
        transcript = self.repo.get_by_id(transcript_id)
        if not transcript:
            from app.exceptions import TranscriptNotFoundError
            raise TranscriptNotFoundError()

        self.repo.update_status(transcript_id, "EXTRACTING")

        try:
            raw_text = extract_text(transcript.file_path, transcript.file_type)
        except ExtractorError as exc:
            self.repo.update_status(transcript_id, "UPLOADED")
            self.audit.log(actor_id, "EXTRACT", {"error": str(exc)}, "FAILURE", transcript_id)
            raise ExtractionFailedError(str(exc)) from exc

        try:
            structured = self.llm.extract_structured_data(raw_text)
        except LLMUnavailError as exc:
            self.repo.update_status(transcript_id, "UPLOADED")
            self.audit.log(actor_id, "EXTRACT", {"error": str(exc)}, "FAILURE", transcript_id)
            raise LLMUnavailableError(str(exc)) from exc
        except LLMParsErr as exc:
            self.repo.update_status(transcript_id, "UPLOADED")
            self.audit.log(actor_id, "EXTRACT", {"error": str(exc)}, "FAILURE", transcript_id)
            raise LLMParseError(str(exc)) from exc

        from datetime import date as date_type
        grad_date = structured.get("graduation_date")
        if isinstance(grad_date, str) and grad_date:
            try:
                grad_date = date_type.fromisoformat(grad_date)
            except ValueError:
                grad_date = None

        enroll_date = structured.get("enrollment_date")
        if isinstance(enroll_date, str) and enroll_date:
            try:
                enroll_date = date_type.fromisoformat(enroll_date)
            except ValueError:
                enroll_date = None

        # Wrap all DB mutations in a single savepoint for atomicity
        try:
            self.db.begin_nested()
            extracted = ExtractedData(
                id=str(uuid.uuid4()),
                transcript_id=transcript_id,
                student_name=structured.get("student_name"),
                institution_name=structured.get("institution_name"),
                program_name=structured.get("program_name"),
                degree_type=structured.get("degree_type"),
                graduation_date=grad_date,
                graduation_confirmed=bool(structured.get("graduation_confirmed", False)),
                enrollment_date=enroll_date,
                courses_json=json.dumps(structured.get("courses") or []),
                raw_text=raw_text,
                extraction_confidence=None,
                extracted_at=datetime.now(timezone.utc),
                llm_model_used=settings.gemini_model,
            )
            self.db.add(extracted)
            self.repo.update_status(transcript_id, "EXTRACTED")
            self.audit.log(
                actor_id, "EXTRACT",
                {"llm_model": settings.gemini_model, "text_length": len(raw_text)},
                "SUCCESS", transcript_id,
            )
            self.db.commit()
        except Exception:
            self.db.rollback()
            logger.exception("Failed to persist extraction results for %s", transcript_id)
            self.repo.update_status(transcript_id, "UPLOADED")
            self.db.commit()
            raise

        return extracted
