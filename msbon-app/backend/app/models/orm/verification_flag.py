from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.flagging_rule import FlaggingRule
    from app.models.orm.staff_review import StaffReview
    from app.models.orm.transcript import Transcript


class VerificationFlag(Base):
    __tablename__ = "verification_flags"
    __table_args__ = (
        UniqueConstraint("transcript_id", "rule_id", name="uq_flag_transcript_rule"),
        Index("ix_verification_flags_transcript_id", "transcript_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transcript_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False
    )
    rule_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flagging_rules.id"), nullable=False
    )
    severity: Mapped[str] = mapped_column(String(10), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    source_excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    is_fraud_indicator: Mapped[bool] = mapped_column(Boolean, nullable=False)
    flagged_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    transcript: Mapped["Transcript"] = relationship("Transcript", back_populates="flags")
    rule: Mapped["FlaggingRule"] = relationship("FlaggingRule", back_populates="flags")
    review: Mapped[Optional["StaffReview"]] = relationship(
        "StaffReview", back_populates="flag", uselist=False
    )
