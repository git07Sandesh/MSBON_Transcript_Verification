"""Extract raw text from PDF or image transcripts."""
import io
import logging
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


def _validate_path(file_path: str) -> Path:
    """Ensure the file_path is within the configured upload directory."""
    upload_dir = Path(settings.upload_dir).resolve()
    safe_path = Path(file_path).resolve()
    try:
        safe_path.relative_to(upload_dir)
    except ValueError:
        raise ExtractionFailedError(
            f"Path traversal detected: {file_path}"
        )
    return safe_path


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF using pdfplumber."""
    import pdfplumber

    _validate_path(file_path)
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    result = "\n".join(text_parts).strip()
    if not result:
        raise ExtractionFailedError("PDF contained no extractable text.")
    return result


def extract_text_from_image(file_path: str) -> str:
    """Extract text from an image using pytesseract OCR."""
    import pytesseract
    from PIL import Image

    _validate_path(file_path)
    image = Image.open(file_path)
    result = pytesseract.image_to_string(image).strip()
    if not result:
        raise ExtractionFailedError("OCR returned no text from image.")
    return result


def extract_text(file_path: str, file_type: str) -> str:
    """Dispatch to the correct extractor based on file_type."""
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "image":
        return extract_text_from_image(file_path)
    else:
        raise ExtractionFailedError(f"Unsupported file_type: {file_type}")


class ExtractionFailedError(Exception):
    """Raised when document text extraction produces no usable output."""
    http_status = 500
    code = "EXTRACTION_FAILED"

    def __init__(self, detail: str = "Extraction returned empty text."):
        self.detail = detail
        super().__init__(detail)
