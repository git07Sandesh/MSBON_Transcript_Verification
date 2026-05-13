from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orm.transcript import Transcript

# ---------------------------------------------------------------------------
# PII Encryption helpers
# ---------------------------------------------------------------------------
# We attempt to use sqlalchemy-utils EncryptedType for PII columns.  When
# no encryption_key is configured we fall back to plain-text columns so the
# application can still start in development / testing without a key.
# ---------------------------------------------------------------------------
_use_encryption = False
_EncryptedColumn = Text  # fallback type

try:
    from sqlalchemy_utils import StringEncryptedType
    from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
    from app.config import settings as _settings

    if _settings.encryption_key:
        _use_encryption = True
except ImportError:
    pass


def _encrypted_text():
    """Return the appropriate column type for PII fields."""
    if _use_encryption:
        from app.config import settings as _s
        return StringEncryptedType(Text, _s.encryption_key, AesEngine, "pkcs5")
    return Text


class ExtractedData(Base):
    __tablename__ = "extracted_data"
    __table_args__ = (
        Index("ix_extracted_data_transcript_id", "transcript_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transcript_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transcripts.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    student_name: Mapped[Optional[str]] = mapped_column(_encrypted_text(), nullable=True)
    institution_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    program_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    degree_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    graduation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    graduation_confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    enrollment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    courses_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_text: Mapped[Optional[str]] = mapped_column(_encrypted_text(), nullable=True)
    extraction_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extracted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    llm_model_used: Mapped[str] = mapped_column(String(100), nullable=False)

    transcript: Mapped["Transcript"] = relationship(
        "Transcript", back_populates="extracted_data"
    )
