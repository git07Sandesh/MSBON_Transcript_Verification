from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.models.schemas.audit import AuditLogOut
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    action_type: Optional[str] = Query(default=None),
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.EXPORT_AUDIT)),
    db: Session = Depends(get_db),
):
    svc = AuditService(db)
    return svc.list_all(skip=skip, limit=limit, action_type=action_type)


@router.get("/{transcript_id}", response_model=list[AuditLogOut])
def get_audit_logs_for_transcript(
    transcript_id: str,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.EXPORT_AUDIT)),
    db: Session = Depends(get_db),
):
    svc = AuditService(db)
    return svc.get_by_transcript(transcript_id)


@router.get("/{transcript_id}/export")
def export_audit_log(
    transcript_id: str,
    format: str = Query(default="json", pattern="^(json|csv)$"),
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.EXPORT_AUDIT)),
    db: Session = Depends(get_db),
):
    svc = AuditService(db)
    if format == "csv":
        content = svc.export_csv(transcript_id)
        return Response(
            content=content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=audit_{transcript_id}.csv"
            },
        )
    else:
        content = svc.export_json(transcript_id)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=audit_{transcript_id}.json"
            },
        )
