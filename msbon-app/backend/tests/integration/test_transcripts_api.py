"""Integration tests for transcript upload and retrieval endpoints."""
import io
import pytest
from unittest.mock import patch, MagicMock

# conftest is in fixtures/ — add it to pytest path
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "fixtures"))
from conftest import *  # noqa: F403, F401


def _fake_pdf_bytes() -> bytes:
    """Minimal PDF-like bytes that python-magic will see as pdf."""
    return b"%PDF-1.4 fake content"


def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["database"] == "connected"


def test_upload_invalid_file_type(client):
    # Patch _detect_mime_type to avoid libmagic dependency
    with patch("app.services.transcript_service._detect_mime_type", return_value="application/octet-stream"):
        res = client.post(
            "/api/v1/transcripts/upload",
            files={"file": ("malware.exe", b"MZ executable", "application/octet-stream")},
            data={"uploaded_by": "staff_test"},
            headers={"X-Staff-ID": "staff_test"},
        )
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_FILE_TYPE"


def test_upload_file_too_large(client):
    big = b"A" * (11 * 1024 * 1024)  # 11MB
    with patch("app.services.transcript_service._detect_mime_type", return_value="application/pdf"):
        res = client.post(
            "/api/v1/transcripts/upload",
            files={"file": ("big.pdf", big, "application/pdf")},
            data={"uploaded_by": "staff_test"},
            headers={"X-Staff-ID": "staff_test"},
        )
    assert res.status_code == 413
    assert res.json()["error"]["code"] == "FILE_TOO_LARGE"


def test_upload_valid_pdf(client):
    with patch("app.services.transcript_service._detect_mime_type", return_value="application/pdf"), \
         patch("builtins.open", MagicMock(return_value=MagicMock(__enter__=MagicMock(return_value=MagicMock()), __exit__=MagicMock(return_value=False)))), \
         patch("os.makedirs"):
        res = client.post(
            "/api/v1/transcripts/upload",
            files={"file": ("transcript.pdf", _fake_pdf_bytes(), "application/pdf")},
            data={"uploaded_by": "staff_test"},
            headers={"X-Staff-ID": "staff_test"},
        )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "UPLOADED"
    assert body["filename"] == "transcript.pdf"


def test_get_transcript_not_found(client):
    res = client.get("/api/v1/transcripts/nonexistent-id")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "TRANSCRIPT_NOT_FOUND"


def test_list_transcripts_empty(client):
    res = client.get("/api/v1/transcripts")
    assert res.status_code == 200
    assert res.json()["total"] == 0
    assert res.json()["items"] == []
