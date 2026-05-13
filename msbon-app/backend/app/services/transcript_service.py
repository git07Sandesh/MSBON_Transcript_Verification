"""Upload, list, and retrieve transcripts."""
import logging
import os
import uuid

logger = logging.getLogger(__name__)
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import InvalidFileTypeError, FileTooLargeError, TranscriptNotFoundError
from app.models.orm.transcript import Transcript
from app.repositories.transcript_repository import TranscriptRepository
from app.services.audit_service import AuditService

ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/tiff": "image",
}

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif"}


# Magic-byte signatures for the four allowed transcript types. Used as a
# fallback when libmagic isn't installed (common on dev laptops without
# `brew install libmagic`). Order matters: longer / more specific prefixes first.
_MAGIC_BYTE_SIGNATURES: tuple[tuple[bytes, str], ...] = (
    (b"%PDF-", "application/pdf"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"II*\x00", "image/tiff"),    # little-endian TIFF
    (b"MM\x00*", "image/tiff"),    # big-endian TIFF
)


def _sniff_mime_from_bytes(file_bytes: bytes) -> Optional[str]:
    """Recognize PDF/PNG/JPEG/TIFF from their leading magic bytes."""
    head = file_bytes[:16]
    for sig, mime in _MAGIC_BYTE_SIGNATURES:
        if head.startswith(sig):
            return mime
    return None


def _detect_mime_type(file_bytes: bytes) -> Optional[str]:
    """Detect MIME from file bytes.

    Prefers libmagic via python-magic for full coverage. Falls back to a
    pure-Python signature sniffer that covers the four allowed transcript
    formats so the system still works on hosts without libmagic installed.
    """
    try:
        import magic
        detected = magic.from_buffer(file_bytes, mime=True)
        if detected:
            return detected
    except Exception:
        pass
    return _sniff_mime_from_bytes(file_bytes)


class TranscriptService:
    def __init__(self, db: Session) -> None:
        self.repo = TranscriptRepository(db)
        self.audit = AuditService(db)

    def upload(
        self,
        filename: str,
        file_bytes: bytes,
        uploaded_by: str,
        ip_address: Optional[str] = None,
    ) -> Transcript:
        # Size check
        if len(file_bytes) > settings.max_file_size_bytes:
            raise FileTooLargeError(
                f"File size {len(file_bytes)} bytes exceeds {settings.max_file_size_mb}MB limit."
            )

        # MIME type check via magic bytes
        mime = _detect_mime_type(file_bytes)
        file_type = ALLOWED_MIME_TYPES.get(mime)
        if not file_type:
            raise InvalidFileTypeError(f"Detected MIME type '{mime}' is not allowed.")

        # Save file as {uuid}.{ext} — original filename never concatenated to path
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            ext = ".pdf" if file_type == "pdf" else ".png"

        transcript_id = str(uuid.uuid4())
        safe_filename = f"{transcript_id}{ext}"
        upload_path = os.path.abspath(settings.upload_dir)
        os.makedirs(upload_path, exist_ok=True)
        file_path = os.path.join(upload_path, safe_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # Wrap DB insert in try/except: clean up file on DB failure
        try:
            transcript = Transcript(
                id=transcript_id,
                filename=filename,
                file_path=file_path,
                file_type=file_type,
                status="UPLOADED",
                uploaded_at=datetime.now(timezone.utc),
                uploaded_by=uploaded_by,
            )
            saved = self.repo.save(transcript)

            self.audit.log(
                actor_id=uploaded_by,
                action_type="UPLOAD",
                action_detail={"filename": filename, "file_type": file_type,
                               "size_bytes": len(file_bytes)},
                outcome="SUCCESS",
                transcript_id=transcript_id,
                ip_address=ip_address,
            )
        except Exception:
            # DB save failed — remove the orphaned file
            logger.exception("DB insert failed for upload %s; removing file", transcript_id)
            try:
                os.remove(file_path)
            except OSError:
                logger.warning("Could not remove orphaned file %s", file_path)
            raise

        return saved

    def get_by_id(self, transcript_id: str) -> Transcript:
        t = self.repo.get_by_id(transcript_id)
        if not t:
            raise TranscriptNotFoundError()
        return t

    def list_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        status_filter: Optional[str] = None,
    ) -> tuple[list[Transcript], int]:
        return self.repo.list_paginated(skip=skip, limit=limit, status_filter=status_filter)
