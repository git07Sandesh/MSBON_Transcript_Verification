from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.verification_flag import VerificationFlag


class FlaggingRule(Base):
    __tablename__ = "flagging_rules"
    __table_args__ = (
        UniqueConstraint("name", name="uq_flagging_rule_name"),
        Index("ix_flagging_rules_category", "category"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # e.g. "GRAD-001"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    rule_config: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    flags: Mapped[list["VerificationFlag"]] = relationship(
        "VerificationFlag", back_populates="rule"
    )
