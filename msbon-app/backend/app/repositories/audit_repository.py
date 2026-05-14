"""
Audit repository, intentionally write-only.
update() and delete() raise OperationNotPermittedError per SDD §5.5.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm.audit_log import AuditLog


class OperationNotPermittedError(Exception):
    """Raised when a forbidden mutation is attempted on audit_logs."""


class AuditRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def save(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_transcript_id(self, transcript_id: str) -> list[AuditLog]:
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.transcript_id == transcript_id)
            .order_by(AuditLog.timestamp.asc())
            .all()
        )

    def list_all(self, skip: int = 0, limit: int = 100,
                 action_type: Optional[str] = None) -> list[AuditLog]:
        query = self.db.query(AuditLog)
        if action_type:
            query = query.filter(AuditLog.action_type == action_type)
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    def update(self, *args, **kwargs):
        raise OperationNotPermittedError("audit_logs records are immutable, update is not permitted.")

    def delete(self, *args, **kwargs):
        raise OperationNotPermittedError("audit_logs records are immutable, delete is not permitted.")
