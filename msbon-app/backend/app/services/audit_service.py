"""Service for writing and reading audit logs."""
import csv
import io
import json
import logging
import uuid

logger = logging.getLogger(__name__)
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, db: Session) -> None:
        self.repo = AuditRepository(db)

    def log(
        self,
        actor_id: str,
        action_type: str,
        action_detail: dict,
        outcome: str,
        transcript_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        entry = AuditLog(
            id=str(uuid.uuid4()),
            transcript_id=transcript_id,
            actor_id=actor_id,
            action_type=action_type,
            action_detail=json.dumps(action_detail),
            outcome=outcome,
            timestamp=datetime.now(timezone.utc),
            ip_address=ip_address,
        )
        return self.repo.save(entry)

    def get_by_transcript(self, transcript_id: str) -> list[AuditLog]:
        return self.repo.get_by_transcript_id(transcript_id)

    def list_all(self, skip: int = 0, limit: int = 100,
                 action_type: Optional[str] = None) -> list[AuditLog]:
        return self.repo.list_all(skip=skip, limit=limit, action_type=action_type)

    def export_json(self, transcript_id: str) -> str:
        logs = self.repo.get_by_transcript_id(transcript_id)
        data = [
            {
                "id": log.id,
                "transcript_id": log.transcript_id,
                "actor_id": log.actor_id,
                "action_type": log.action_type,
                "action_detail": json.loads(log.action_detail),
                "outcome": log.outcome,
                "timestamp": log.timestamp.isoformat() + "Z",
                "ip_address": log.ip_address,
            }
            for log in logs
        ]
        return json.dumps(data, indent=2)

    def export_csv(self, transcript_id: str) -> str:
        logs = self.repo.get_by_transcript_id(transcript_id)
        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=["id", "transcript_id", "actor_id", "action_type",
                        "action_detail", "outcome", "timestamp", "ip_address"],
        )
        writer.writeheader()
        for log in logs:
            writer.writerow({
                "id": log.id,
                "transcript_id": log.transcript_id,
                "actor_id": log.actor_id,
                "action_type": log.action_type,
                "action_detail": log.action_detail,
                "outcome": log.outcome,
                "timestamp": log.timestamp.isoformat() + "Z",
                "ip_address": log.ip_address or "",
            })
        return output.getvalue()
