from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.verification_flag import VerificationFlag


class StaffReview(Base):
    __tablename__ = "staff_reviews"
    __table_args__ = (
        Index("ix_staff_reviews_transcript_id", "transcript_id"),
        Index("ix_staff_reviews_reviewed_at", "reviewed_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    flag_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("verification_flags.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    transcript_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False
    )
    reviewer_id: Mapped[str] = mapped_column(String(100), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    annotation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    flag: Mapped["VerificationFlag"] = relationship(
        "VerificationFlag", back_populates="review"
    )
