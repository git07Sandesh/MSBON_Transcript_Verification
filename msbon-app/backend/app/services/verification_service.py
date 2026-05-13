"""Run rule engine against extracted data and persist flags."""
import json
import logging
import uuid

logger = logging.getLogger(__name__)
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.domain.rule_engine import RuleEngine
from app.models.orm.verification_flag import VerificationFlag
from app.repositories.transcript_repository import TranscriptRepository
from app.services.audit_service import AuditService


class VerificationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TranscriptRepository(db)
        self.audit = AuditService(db)
        self.engine = RuleEngine()

    def verify(self, transcript_id: str, actor_id: str = "system") -> list[VerificationFlag]:
        from app.models.orm.extracted_data import ExtractedData

        transcript = self.repo.get_by_id(transcript_id)
        if not transcript:
            from app.exceptions import TranscriptNotFoundError
            raise TranscriptNotFoundError()

        ed = self.db.query(ExtractedData).filter(
            ExtractedData.transcript_id == transcript_id
        ).first()

        self.repo.update_status(transcript_id, "VERIFYING")

        extracted_dict = {}
        if ed:
            extracted_dict = {
                "student_name": ed.student_name,
                "institution_name": ed.institution_name,
                "program_name": ed.program_name,
                "degree_type": ed.degree_type,
                "graduation_date": ed.graduation_date,
                "graduation_confirmed": ed.graduation_confirmed,
                "enrollment_date": ed.enrollment_date,
                "courses": json.loads(ed.courses_json) if ed.courses_json else [],
                "extraction_notes": None,
            }

        flag_results = self.engine.run_all(extracted_dict, self.db)

        orm_flags: list[VerificationFlag] = []
        for fr in flag_results:
            vf = VerificationFlag(
                id=str(uuid.uuid4()),
                transcript_id=transcript_id,
                rule_id=fr.rule_id,
                severity=fr.severity,
                category=fr.category,
                description=fr.description,
                source_excerpt=fr.source_excerpt,
                explanation=fr.explanation,
                is_fraud_indicator=fr.is_fraud_indicator,
                flagged_at=datetime.now(timezone.utc),
            )
            self.db.add(vf)
            orm_flags.append(vf)

        new_status = "FLAGGED" if orm_flags else "CLEAR"
        self.repo.update_status(
            transcript_id, new_status, processed_at=datetime.now(timezone.utc)
        )

        # Audit log inside the transaction so it is atomic with the flags
        self.audit.log(
            actor_id, "VERIFY",
            {"flags_generated": len(orm_flags), "status": new_status},
            "SUCCESS", transcript_id,
        )
        self.db.commit()

        return orm_flags
