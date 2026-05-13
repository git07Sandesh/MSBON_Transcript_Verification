"""Unit tests for LLMAdapter retry and parse logic."""
import json
import pytest
from unittest.mock import MagicMock, patch


def _make_adapter_with_mock(responses):
    """Build LLMAdapter with a mocked generate_content method."""
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        mock_model_instance = MagicMock()
        MockModel.return_value = mock_model_instance
        mock_model_instance.generate_content.side_effect = responses
        from app.infrastructure.llm_adapter import LLMAdapter
        adapter = LLMAdapter()
        adapter._model = mock_model_instance
        return adapter


def _ok_response(data: dict):
    r = MagicMock()
    r.text = json.dumps(data)
    return r


def _err_response():
    raise Exception("API timeout")


VALID_DATA = {
    "student_name": "Jane Doe",
    "institution_name": "USM",
    "program_name": "BSN",
    "degree_type": "BSN",
    "graduation_date": "2024-05-15",
    "graduation_confirmed": True,
    "enrollment_date": "2020-08-01",
    "courses": [],
    "extraction_notes": None,
}


def test_llm_success_on_first_attempt():
    adapter = _make_adapter_with_mock([_ok_response(VALID_DATA)])
    result = adapter.extract_structured_data("some transcript text")
    assert result["student_name"] == "Jane Doe"


def test_llm_success_on_second_attempt():
    fail = Exception("timeout")
    adapter = _make_adapter_with_mock([fail, _ok_response(VALID_DATA)])
    with patch("time.sleep"):
        result = adapter.extract_structured_data("some text")
    assert result["degree_type"] == "BSN"


def test_llm_raises_unavailable_after_3_failures():
    from app.infrastructure.llm_adapter import LLMUnavailableError
    fail = Exception("timeout")
    adapter = _make_adapter_with_mock([fail, fail, fail])
    with patch("time.sleep"), pytest.raises(LLMUnavailableError):
        adapter.extract_structured_data("some text")


def test_llm_raises_parse_error_on_bad_json():
    from app.infrastructure.llm_adapter import LLMParseError
    bad = MagicMock()
    bad.text = "this is not json"
    adapter = _make_adapter_with_mock([bad])
    with pytest.raises(LLMParseError):
        adapter.extract_structured_data("some text")


def test_llm_strips_markdown_fences():
    fenced = MagicMock()
    fenced.text = "```json\n" + json.dumps(VALID_DATA) + "\n```"
    adapter = _make_adapter_with_mock([fenced])
    result = adapter.extract_structured_data("some text")
    assert result["graduation_confirmed"] is True
