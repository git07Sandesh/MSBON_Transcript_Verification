"""Unit tests for ReviewService and AuditService."""
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
# Import all ORM models so SQLAlchemy can resolve relationships
from app.models.orm import (  # noqa: F401
    transcript, extracted_data, verification_flag,
    staff_review, audit_log, flagging_rule, accredited_program,
)

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def _seed_rules_and_transcript(db):
    """Helper: insert minimal seeded data."""
    import uuid
    from datetime import datetime, timezone
    from app.models.orm.flagging_rule import FlaggingRule
    from app.models.orm.transcript import Transcript
    from app.models.orm.verification_flag import VerificationFlag

    rule = FlaggingRule(
        id="GRAD-001", name="Missing graduation confirmation",
        category="GRADUATION", severity="HIGH",
        description="No explicit conferral", is_active=True,
        rule_config=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(rule)

    tid = str(uuid.uuid4())
    t = Transcript(
        id=tid, filename="test.pdf", file_path="/tmp/test.pdf",
        file_type="pdf", status="FLAGGED",
        uploaded_at=datetime.now(timezone.utc), uploaded_by="staff_test",
    )
    db.add(t)

    fid = str(uuid.uuid4())
    flag = VerificationFlag(
        id=fid, transcript_id=tid, rule_id="GRAD-001",
        severity="HIGH", category="GRADUATION",
        description="No conferral", explanation="GRAD-001: missing",
        is_fraud_indicator=False,
        flagged_at=datetime.now(timezone.utc),
    )
    db.add(flag)
    db.commit()
    return tid, fid


def test_review_service_confirmed(db):
    from app.services.review_service import ReviewService
    tid, fid = _seed_rules_and_transcript(db)
    svc = ReviewService(db)
    review = svc.submit_review(
        flag_id=fid, transcript_id=tid,
        reviewer_id="staff_test", decision="CONFIRMED",
    )
    assert review.decision == "CONFIRMED"
    assert review.override_reason is None


def test_review_service_overridden_with_reason(db):
    from app.services.review_service import ReviewService
    tid, fid = _seed_rules_and_transcript(db)
    svc = ReviewService(db)
    review = svc.submit_review(
        flag_id=fid, transcript_id=tid,
        reviewer_id="staff_test", decision="OVERRIDDEN",
        override_reason="Accelerated bridge program.",
    )
    assert review.decision == "OVERRIDDEN"
    assert review.override_reason == "Accelerated bridge program."


def test_review_service_overridden_without_reason_raises(db):
    from app.services.review_service import ReviewService
    from app.exceptions import OverrideReasonRequiredError
    tid, fid = _seed_rules_and_transcript(db)
    svc = ReviewService(db)
    with pytest.raises(OverrideReasonRequiredError):
        svc.submit_review(
            flag_id=fid, transcript_id=tid,
            reviewer_id="staff_test", decision="OVERRIDDEN",
        )


def test_review_service_flag_already_reviewed(db):
    from app.services.review_service import ReviewService
    from app.exceptions import FlagAlreadyReviewedError
    tid, fid = _seed_rules_and_transcript(db)
    svc = ReviewService(db)
    svc.submit_review(flag_id=fid, transcript_id=tid, reviewer_id="staff_test", decision="CONFIRMED")
    with pytest.raises(FlagAlreadyReviewedError):
        svc.submit_review(flag_id=fid, transcript_id=tid, reviewer_id="staff_test", decision="CONFIRMED")


def test_audit_service_immutability(db):
    from app.repositories.audit_repository import AuditRepository, OperationNotPermittedError
    repo = AuditRepository(db)
    with pytest.raises(OperationNotPermittedError):
        repo.update()
    with pytest.raises(OperationNotPermittedError):
        repo.delete()


def test_audit_service_logs_entry(db):
    from app.services.audit_service import AuditService
    svc = AuditService(db)
    entry = svc.log(
        actor_id="staff_test",
        action_type="UPLOAD",
        action_detail={"filename": "test.pdf"},
        outcome="SUCCESS",
    )
    assert entry.id is not None
    assert entry.action_type == "UPLOAD"
