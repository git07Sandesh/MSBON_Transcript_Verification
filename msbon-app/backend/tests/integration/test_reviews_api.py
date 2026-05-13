"""Integration tests for review submission endpoint."""
import sys, os, uuid
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "fixtures"))
from conftest import *  # noqa: F403, F401

from datetime import datetime, timezone


def _insert_transcript_and_flag(db):
    """Insert a FLAGGED transcript and a flag directly into the test DB."""
    from app.models.orm.transcript import Transcript
    from app.models.orm.verification_flag import VerificationFlag

    tid = str(uuid.uuid4())
    t = Transcript(
        id=tid, filename="test.pdf", file_path="/tmp/t.pdf",
        file_type="pdf", status="FLAGGED",
        uploaded_at=datetime.now(timezone.utc),
        uploaded_by="staff_test",
    )
    db.add(t)

    fid = str(uuid.uuid4())
    flag = VerificationFlag(
        id=fid, transcript_id=tid, rule_id="GRAD-001",
        severity="HIGH", category="GRADUATION",
        description="No conferral", explanation="GRAD-001 test",
        is_fraud_indicator=False,
        flagged_at=datetime.now(timezone.utc),
    )
    db.add(flag)
    db.commit()
    return tid, fid


def test_submit_confirmed_review(client, db):
    tid, fid = _insert_transcript_and_flag(db)
    res = client.post("/api/v1/reviews", json={
        "flag_id": fid,
        "transcript_id": tid,
        "reviewer_id": "staff_test",
        "decision": "CONFIRMED",
    }, headers={"X-Staff-ID": "staff_test"})
    assert res.status_code == 201
    assert res.json()["decision"] == "CONFIRMED"


def test_submit_overridden_without_reason_returns_422(client, db):
    tid, fid = _insert_transcript_and_flag(db)
    res = client.post("/api/v1/reviews", json={
        "flag_id": fid,
        "transcript_id": tid,
        "reviewer_id": "staff_test",
        "decision": "OVERRIDDEN",
        # override_reason intentionally omitted
    }, headers={"X-Staff-ID": "staff_test"})
    assert res.status_code == 422


def test_submit_duplicate_review_returns_409(client, db):
    tid, fid = _insert_transcript_and_flag(db)
    client.post("/api/v1/reviews", json={
        "flag_id": fid, "transcript_id": tid,
        "reviewer_id": "staff_test", "decision": "CONFIRMED",
    }, headers={"X-Staff-ID": "staff_test"})
    # Second review on same flag
    res = client.post("/api/v1/reviews", json={
        "flag_id": fid, "transcript_id": tid,
        "reviewer_id": "staff_test", "decision": "CONFIRMED",
    }, headers={"X-Staff-ID": "staff_test"})
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "FLAG_ALREADY_REVIEWED"


def test_review_nonexistent_transcript_returns_404(client):
    res = client.post("/api/v1/reviews", json={
        "flag_id": str(uuid.uuid4()),
        "transcript_id": "nonexistent-id",
        "reviewer_id": "staff_test",
        "decision": "CONFIRMED",
    }, headers={"X-Staff-ID": "staff_test"})
    assert res.status_code == 404
