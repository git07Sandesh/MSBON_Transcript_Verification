import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.audit_log import AuditLog
    from app.models.orm.extracted_data import ExtractedData
    from app.models.orm.verification_flag import VerificationFlag


class TranscriptStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    EXTRACTING = "EXTRACTING"
    EXTRACTED = "EXTRACTED"
    VERIFYING = "VERIFYING"
    FLAGGED = "FLAGGED"
    CLEAR = "CLEAR"
    REVIEWED = "REVIEWED"
    OVERRIDDEN = "OVERRIDDEN"


class Transcript(Base):
    __tablename__ = "transcripts"
    __table_args__ = (
        Index("ix_transcripts_status_uploaded_at", "status", "uploaded_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(TranscriptStatus), nullable=False, default=TranscriptStatus.UPLOADED
    )
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(100), nullable=False)

    extracted_data: Mapped[Optional["ExtractedData"]] = relationship(
        "ExtractedData", back_populates="transcript", uselist=False
    )
    flags: Mapped[list["VerificationFlag"]] = relationship(
        "VerificationFlag", back_populates="transcript"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="transcript"
    )
