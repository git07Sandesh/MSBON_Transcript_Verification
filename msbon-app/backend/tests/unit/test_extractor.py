"""Unit tests for DocumentExtractor."""
import pytest
from unittest.mock import patch, MagicMock


def test_extract_pdf_returns_text(tmp_path):
    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_bytes(b"%PDF fake content")

    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Student: Jane Doe\nGraduated: May 2024"
    mock_pdf = MagicMock()
    mock_pdf.__enter__ = MagicMock(return_value=mock_pdf)
    mock_pdf.__exit__ = MagicMock(return_value=False)
    mock_pdf.pages = [mock_page]

    with patch("pdfplumber.open", return_value=mock_pdf):
        from app.infrastructure.document_extractor import extract_text_from_pdf
        text = extract_text_from_pdf(str(pdf_file))
    assert "Jane Doe" in text


def test_extract_pdf_raises_on_empty(tmp_path):
    pdf_file = tmp_path / "empty.pdf"
    pdf_file.write_bytes(b"%PDF empty")

    mock_page = MagicMock()
    mock_page.extract_text.return_value = ""
    mock_pdf = MagicMock()
    mock_pdf.__enter__ = MagicMock(return_value=mock_pdf)
    mock_pdf.__exit__ = MagicMock(return_value=False)
    mock_pdf.pages = [mock_page]

    with patch("pdfplumber.open", return_value=mock_pdf):
        from app.infrastructure.document_extractor import extract_text_from_pdf, ExtractionFailedError
        with pytest.raises(ExtractionFailedError):
            extract_text_from_pdf(str(pdf_file))


def test_extract_image_returns_text(tmp_path):
    img_file = tmp_path / "scan.png"
    img_file.write_bytes(b"\x89PNG fake image bytes")

    with patch("pytesseract.image_to_string", return_value="University of Southern Mississippi"):
        with patch("PIL.Image.open", return_value=MagicMock()):
            from app.infrastructure.document_extractor import extract_text_from_image
            text = extract_text_from_image(str(img_file))
    assert "Southern Mississippi" in text


def test_extract_image_raises_on_empty(tmp_path):
    img_file = tmp_path / "blank.png"
    img_file.write_bytes(b"\x89PNG fake image bytes")

    with patch("pytesseract.image_to_string", return_value="  "):
        with patch("PIL.Image.open", return_value=MagicMock()):
            from app.infrastructure.document_extractor import extract_text_from_image, ExtractionFailedError
            with pytest.raises(ExtractionFailedError):
                extract_text_from_image(str(img_file))
