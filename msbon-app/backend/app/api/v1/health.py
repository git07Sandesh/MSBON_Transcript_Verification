from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db
from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Check DB connectivity
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }


@router.get("/health/detailed")
def health_check_detailed(
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    db: Session = Depends(get_db),
):
    # Check DB connectivity
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    # Check LLM reachability (simple key presence check for PoC)
    llm_status = "reachable" if settings.gemini_api_key else "not_configured"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "llm_api": llm_status,
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }
