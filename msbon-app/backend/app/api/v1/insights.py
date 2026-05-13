"""Aggregate insights for the dashboard + public transparency stats.

Two endpoints:
  - ``GET /insights/public``  — anonymous, counts only, safe to render on the
    public-facing /impact page.
  - ``GET /insights/summary`` — JWT-gated, full breakdown for the staff
    dashboard (per-rule firing counts, decision distribution, recent activity).

Computation is intentionally simple SQL aggregates, no caching, no extra tables.
The dataset is small (PoC) and the endpoint is hit once per page load.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.dependencies import verify_token
from app.database import get_db
# Import every ORM module so SQLAlchemy can resolve back-references between
# Transcript -> ExtractedData/VerificationFlag/StaffReview/AuditLog at mapper
# configure time. Without this, the first query through any one of them
# raises InvalidRequestError.
from app.models.orm.accredited_program import AccreditedProgram   # noqa: F401
from app.models.orm.audit_log import AuditLog
from app.models.orm.extracted_data import ExtractedData            # noqa: F401
from app.models.orm.flagging_rule import FlaggingRule              # noqa: F401
from app.models.orm.staff_review import StaffReview
from app.models.orm.transcript import Transcript
from app.models.orm.verification_flag import VerificationFlag

router = APIRouter(prefix="/insights", tags=["insights"])


# --- Schemas -----------------------------------------------------------------

class PublicInsights(BaseModel):
    transcripts_total:        int
    flags_total:              int
    reviews_total:            int
    overrides_total:          int
    rules_active:             int = 12
    accredited_programs:      int
    days_running:             int  # since the earliest audit row


class RuleCount(BaseModel):
    rule_id: str
    count: int


class StatusCount(BaseModel):
    status: str
    count: int


class DecisionCount(BaseModel):
    decision: str
    count: int


class DailyCount(BaseModel):
    date: str            # YYYY-MM-DD
    count: int


class RecentAction(BaseModel):
    timestamp: str
    actor_id: str
    action_type: str
    transcript_id: Optional[str]
    outcome: str


class FullInsights(BaseModel):
    public:               PublicInsights
    transcript_status:    list[StatusCount]
    top_firing_rules:     list[RuleCount]
    decision_breakdown:   list[DecisionCount]
    decisions_last_14_days: list[DailyCount]
    recent_actions:       list[RecentAction]


# --- Helpers -----------------------------------------------------------------

def _public(db: Session) -> PublicInsights:
    transcripts_total = db.query(func.count(Transcript.id)).scalar() or 0
    flags_total       = db.query(func.count(VerificationFlag.id)).scalar() or 0
    reviews_total     = db.query(func.count(StaffReview.id)).scalar() or 0
    overrides_total   = (
        db.query(func.count(StaffReview.id))
        .filter(StaffReview.decision == "OVERRIDDEN")
        .scalar()
        or 0
    )
    earliest = db.query(func.min(AuditLog.timestamp)).scalar()
    if earliest and earliest.tzinfo is None:
        earliest = earliest.replace(tzinfo=timezone.utc)
    days = (datetime.now(timezone.utc) - earliest).days if earliest else 0

    programs = (
        db.query(func.count(AccreditedProgram.id))
        .filter(AccreditedProgram.is_active == True)
        .scalar()
        or 0
    )

    return PublicInsights(
        transcripts_total=transcripts_total,
        flags_total=flags_total,
        reviews_total=reviews_total,
        overrides_total=overrides_total,
        accredited_programs=programs,
        days_running=max(days, 0),
    )


# --- Routes ------------------------------------------------------------------

@router.get("/public", response_model=PublicInsights)
def public_insights(db: Session = Depends(get_db)) -> PublicInsights:
    """Anonymous: counts only. Safe to render on the marketing site."""
    return _public(db)


@router.get("/summary", response_model=FullInsights)
def full_insights(
    db: Session = Depends(get_db),
    _token: dict = Depends(verify_token),
) -> FullInsights:
    public = _public(db)

    status_rows = (
        db.query(Transcript.status, func.count(Transcript.id))
        .group_by(Transcript.status)
        .all()
    )
    transcript_status = [StatusCount(status=s, count=c) for s, c in status_rows]

    rule_rows = (
        db.query(VerificationFlag.rule_id, func.count(VerificationFlag.id).label("c"))
        .group_by(VerificationFlag.rule_id)
        .order_by(func.count(VerificationFlag.id).desc())
        .limit(8)
        .all()
    )
    top_firing_rules = [RuleCount(rule_id=r, count=c) for r, c in rule_rows]

    decision_rows = (
        db.query(StaffReview.decision, func.count(StaffReview.id))
        .group_by(StaffReview.decision)
        .all()
    )
    decision_breakdown = [DecisionCount(decision=d, count=c) for d, c in decision_rows]

    fourteen_ago = datetime.now(timezone.utc) - timedelta(days=14)
    # Postgres uses to_char for date formatting — SQLite's strftime is unavailable.
    daily_rows = (
        db.query(
            func.to_char(StaffReview.reviewed_at, "YYYY-MM-DD").label("d"),
            func.count(StaffReview.id).label("c"),
        )
        .filter(StaffReview.reviewed_at >= fourteen_ago)
        .group_by("d")
        .order_by("d")
        .all()
    )
    decisions_last_14_days = [DailyCount(date=d, count=c) for d, c in daily_rows]

    recent = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(8)
        .all()
    )
    recent_actions = [
        RecentAction(
            timestamp=row.timestamp.isoformat() + "Z",
            actor_id=row.actor_id,
            action_type=row.action_type,
            transcript_id=row.transcript_id,
            outcome=row.outcome,
        )
        for row in recent
    ]

    return FullInsights(
        public=public,
        transcript_status=transcript_status,
        top_firing_rules=top_firing_rules,
        decision_breakdown=decision_breakdown,
        decisions_last_14_days=decisions_last_14_days,
        recent_actions=recent_actions,
    )
