from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.transcript import Transcript


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_transcript_timestamp", "transcript_id", "timestamp"),
        CheckConstraint("outcome IN ('SUCCESS', 'FAILURE')", name="ck_audit_outcome"),
        CheckConstraint("action_type != ''", name="ck_audit_action_type_nonempty"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transcript_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("transcripts.id", ondelete="SET NULL"), nullable=True
    )
    actor_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    action_detail: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    transcript: Mapped[Optional["Transcript"]] = relationship(
        "Transcript", back_populates="audit_logs"
    )
