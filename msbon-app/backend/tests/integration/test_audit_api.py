"""Integration tests for audit log endpoints."""
import sys, os, uuid
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "fixtures"))
from conftest import *  # noqa: F403, F401

from datetime import datetime, timezone


def _insert_audit_log(db, transcript_id=None):
    from app.services.audit_service import AuditService
    svc = AuditService(db)
    svc.log(
        actor_id="staff_test",
        action_type="UPLOAD",
        action_detail={"filename": "test.pdf"},
        outcome="SUCCESS",
        transcript_id=transcript_id,
    )
    db.commit()


def test_list_all_audit_logs_empty(client):
    res = client.get("/api/v1/audit-logs")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_list_audit_logs_returns_entry(client, db):
    _insert_audit_log(db)
    res = client.get("/api/v1/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert any(log["action_type"] == "UPLOAD" for log in logs)


def test_get_audit_logs_for_transcript(client, db):
    from app.models.orm.transcript import Transcript
    tid = str(uuid.uuid4())
    t = Transcript(
        id=tid, filename="t.pdf", file_path="/tmp/t.pdf",
        file_type="pdf", status="UPLOADED",
        uploaded_at=datetime.now(timezone.utc), uploaded_by="staff_test",
    )
    db.add(t)
    db.commit()
    _insert_audit_log(db, transcript_id=tid)

    res = client.get(f"/api/v1/audit-logs/{tid}")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    assert all(log["transcript_id"] == tid for log in logs)


def test_export_audit_csv(client, db):
    from app.models.orm.transcript import Transcript
    tid = str(uuid.uuid4())
    t = Transcript(
        id=tid, filename="t.pdf", file_path="/tmp/t.pdf",
        file_type="pdf", status="UPLOADED",
        uploaded_at=datetime.now(timezone.utc), uploaded_by="staff_test",
    )
    db.add(t)
    db.commit()
    _insert_audit_log(db, transcript_id=tid)

    res = client.get(f"/api/v1/audit-logs/{tid}/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "UPLOAD" in res.text


def test_export_audit_json(client, db):
    from app.models.orm.transcript import Transcript
    tid = str(uuid.uuid4())
    t = Transcript(
        id=tid, filename="t.pdf", file_path="/tmp/t.pdf",
        file_type="pdf", status="UPLOADED",
        uploaded_at=datetime.now(timezone.utc), uploaded_by="staff_test",
    )
    db.add(t)
    db.commit()
    _insert_audit_log(db, transcript_id=tid)

    res = client.get(f"/api/v1/audit-logs/{tid}/export?format=json")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert data[0]["action_type"] == "UPLOAD"
