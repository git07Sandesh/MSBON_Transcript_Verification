"""Stream the original uploaded transcript file to authenticated users.

Used by the in-browser PDF viewer (``react-pdf-highlighter-extended`` + pdf.js).
pdf.js issues HTTP Range requests for large PDFs, so this endpoint must
honor the Range header.
"""
import logging
import os
import re
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import FileResponse, Response, StreamingResponse
from sqlalchemy.orm import Session

from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.database import get_db
from app.exceptions import TranscriptNotFoundError
from app.repositories.transcript_repository import TranscriptRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


_MIME_BY_FILE_TYPE = {
    "pdf":   "application/pdf",
    "image": "image/png",  # default for image; close enough for the viewer
}

_RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")


@router.get("/{transcript_id}/file")
def get_transcript_file(
    transcript_id: str,
    request: Request,
    range_header: Optional[str] = Header(default=None, alias="Range"),
    db: Session = Depends(get_db),
    _token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
):
    """Stream the original transcript bytes. Honors HTTP Range requests."""
    repo = TranscriptRepository(db)
    transcript = repo.get_by_id(transcript_id)
    if not transcript:
        raise TranscriptNotFoundError()

    file_path = os.path.abspath(transcript.file_path)
    upload_root = os.path.abspath(os.path.dirname(transcript.file_path))
    # Path-traversal defense: the resolved path must remain under the upload
    # directory configured at upload time.
    if not file_path.startswith(upload_root):
        raise HTTPException(status_code=400, detail="Invalid file path")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")

    media_type = _MIME_BY_FILE_TYPE.get(transcript.file_type, "application/octet-stream")
    file_size = os.path.getsize(file_path)
    headers = {
        "Accept-Ranges":     "bytes",
        "Content-Disposition": f'inline; filename="{transcript.filename}"',
        "Cache-Control":     "private, max-age=300",
    }

    if range_header:
        match = _RANGE_RE.match(range_header)
        if not match:
            raise HTTPException(status_code=416, detail="Invalid Range header")
        start_str, end_str = match.groups()
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
        if start >= file_size or end >= file_size or start > end:
            return Response(status_code=416, headers={
                "Content-Range": f"bytes */{file_size}"
            })

        length = end - start + 1
        def iterfile():
            with open(file_path, "rb") as f:
                f.seek(start)
                remaining = length
                chunk = 64 * 1024
                while remaining > 0:
                    data = f.read(min(chunk, remaining))
                    if not data:
                        break
                    yield data
                    remaining -= len(data)

        headers.update({
            "Content-Range":  f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(length),
        })
        return StreamingResponse(
            iterfile(),
            status_code=206,
            media_type=media_type,
            headers=headers,
        )

    # Whole-file response
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=transcript.filename,
        headers=headers,
    )
