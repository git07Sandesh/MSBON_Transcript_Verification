"""Submit and retrieve staff review decisions."""
import logging
import uuid

logger = logging.getLogger(__name__)
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import (
    FlagAlreadyReviewedError,
    OverrideReasonRequiredError,
    TranscriptNotFoundError,
    TranscriptNotProcessedError,
)
from app.models.orm.staff_review import StaffReview
from app.repositories.review_repository import ReviewRepository
from app.repositories.transcript_repository import TranscriptRepository
from app.services.audit_service import AuditService

VERIFIED_STATUSES = {"VERIFIED", "FLAGGED", "CLEAR", "REVIEWED"}


class ReviewService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ReviewRepository(db)
        self.transcript_repo = TranscriptRepository(db)
        self.audit = AuditService(db)

    def submit_review(
        self,
        flag_id: str,
        transcript_id: str,
        reviewer_id: str,
        decision: str,
        annotation: Optional[str] = None,
        override_reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> StaffReview:
        # Validate transcript exists and is processed
        transcript = self.transcript_repo.get_by_id(transcript_id)
        if not transcript:
            raise TranscriptNotFoundError()
        if transcript.status not in VERIFIED_STATUSES:
            raise TranscriptNotProcessedError()

        # OVERRIDDEN requires override_reason
        if decision == "OVERRIDDEN" and not override_reason:
            raise OverrideReasonRequiredError()

        # Check flag not already reviewed
        existing = self.repo.get_by_flag_id(flag_id)
        if existing:
            raise FlagAlreadyReviewedError()

        # Wrap review save and transcript status update in a savepoint
        try:
            self.db.begin_nested()

            review = StaffReview(
                id=str(uuid.uuid4()),
                flag_id=flag_id,
                transcript_id=transcript_id,
                reviewer_id=reviewer_id,
                decision=decision,
                annotation=annotation,
                reviewed_at=datetime.now(timezone.utc),
                override_reason=override_reason,
            )
            saved = self.repo.save(review)

            # Update transcript status to REVIEWED
            self.transcript_repo.update_status(transcript_id, "REVIEWED")

            action_type = "OVERRIDE_FLAG" if decision == "OVERRIDDEN" else "REVIEW_FLAG"
            self.audit.log(
                actor_id=reviewer_id,
                action_type=action_type,
                action_detail={
                    "flag_id": flag_id,
                    "decision": decision,
                    "has_override_reason": bool(override_reason),
                },
                outcome="SUCCESS",
                transcript_id=transcript_id,
                ip_address=ip_address,
            )

            self.db.commit()
        except Exception:
            self.db.rollback()
            logger.exception("Failed to persist review for flag %s", flag_id)
            raise

        return saved

    def get_by_transcript(self, transcript_id: str) -> list[StaffReview]:
        return self.repo.get_by_transcript_id(transcript_id)
