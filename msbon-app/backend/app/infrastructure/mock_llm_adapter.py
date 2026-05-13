"""Deterministic mock LLM adapter for demo and test environments.

Activated when GEMINI_API_KEY starts with the literal prefix ``mock``. The
adapter never calls Google Gemini; it inspects the raw transcript text for
keywords and returns one of a handful of canned profiles. This lets the
upload -> extract -> verify -> review -> audit flow be demoed end-to-end
without provisioning a Gemini key.

Profile selection is keyword-based so the demonstrator controls which
fixture fires by naming the source file (or by inserting the keyword into
the transcript itself):

    *fraud*    -> FRAUD profile (8-month BSN, fires FRAU-001 + COUR-002 + ACCR-001)
    *missing*  -> MISSING_GRAD profile (no graduation date / confirmation)
    *unaccr*   -> UNACCREDITED profile (institution not in MS approved list)
    (default)  -> CLEAN profile (USM BSN, fires zero or one minor formatting flag)
"""
from __future__ import annotations

import hashlib
from typing import Any


def _profile_clean() -> dict[str, Any]:
    # Course names hit every required-area keyword in CourseCompletionRule
    # (fundamentals, medical-surgical/adult health, pharmacology, mental
    # health, maternal/OB, pediatric) and total credits exceed BSN minimum
    # of 120.0, so this profile generates zero COUR flags.
    return {
        "student_name": "Jordan A. Carter",
        "institution_name": "University of Southern Mississippi",
        "program_name": "Bachelor of Science in Nursing",
        "degree_type": "BSN",
        "graduation_date": "2025-05-10",
        "graduation_confirmed": True,
        "enrollment_date": "2021-08-23",
        "courses": [
            {"code": "NSG 200", "name": "Fundamentals of Nursing",
             "grade": "A", "credits": 16.0, "semester": "Fall", "year": "2021"},
            {"code": "NSG 301", "name": "Health Assessment",
             "grade": "A", "credits": 12.0, "semester": "Spring", "year": "2022"},
            {"code": "NSG 302", "name": "Pharmacology",
             "grade": "B+", "credits": 12.0, "semester": "Spring", "year": "2023"},
            {"code": "NSG 401", "name": "Adult Health / Medical-Surgical Nursing I",
             "grade": "A-", "credits": 16.0, "semester": "Fall", "year": "2023"},
            {"code": "NSG 402", "name": "Maternal Newborn / Obstetric Nursing",
             "grade": "B", "credits": 16.0, "semester": "Spring", "year": "2024"},
            {"code": "NSG 405", "name": "Pediatric Nursing",
             "grade": "A", "credits": 16.0, "semester": "Fall", "year": "2024"},
            {"code": "NSG 410", "name": "Mental Health / Psychiatric Nursing",
             "grade": "A", "credits": 16.0, "semester": "Fall", "year": "2024"},
            {"code": "NSG 420", "name": "Community Health Nursing",
             "grade": "B+", "credits": 8.0, "semester": "Spring", "year": "2025"},
            {"code": "NSG 499", "name": "Nursing Capstone",
             "grade": "A", "credits": 12.0, "semester": "Spring", "year": "2025"},
        ],
        "extraction_notes": "[mock] clean profile",
    }


def _profile_fraud() -> dict[str, Any]:
    # Same enrollment year as graduation -> 8-month duration -> FRAU-001
    return {
        "student_name": "Riley Q. Madison",
        "institution_name": "Acme Online Nursing Institute",
        "program_name": "Accelerated BSN Express",
        "degree_type": "BSN",
        "graduation_date": "2025-04-15",
        "graduation_confirmed": True,
        "enrollment_date": "2024-08-12",
        "courses": [
            {"code": "NSG 101", "name": "Intro to Nursing",
             "grade": "A", "credits": 1.0, "semester": "Fall", "year": "2024"},
            {"code": "NSG 102", "name": "Basic Patient Care",
             "grade": "A", "credits": 1.0, "semester": "Fall", "year": "2024"},
            {"code": "NSG 201", "name": "Clinical I",
             "grade": "A", "credits": 2.0, "semester": "Spring", "year": "2025"},
        ],
        "extraction_notes": "[mock] fraud profile - short duration, low credits",
    }


def _profile_missing_grad() -> dict[str, Any]:
    return {
        "student_name": "Morgan K. Shaw",
        "institution_name": "Mississippi University for Women",
        "program_name": "Bachelor of Science in Nursing",
        "degree_type": "BSN",
        "graduation_date": None,
        "graduation_confirmed": False,
        "enrollment_date": "2021-08-19",
        "courses": [
            {"code": "NSG 301", "name": "Health Assessment",
             "grade": "B", "credits": 3.0, "semester": "Fall", "year": "2022"},
            {"code": "NSG 302", "name": "Pharmacology",
             "grade": "C+", "credits": 3.0, "semester": "Spring", "year": "2023"},
            {"code": "NSG 401", "name": "Adult Health Nursing",
             "grade": "B+", "credits": 4.0, "semester": "Fall", "year": "2023"},
            {"code": "NSG 402", "name": "Maternal Newborn Nursing",
             "grade": "B", "credits": 4.0, "semester": "Spring", "year": "2024"},
            {"code": "NSG 410", "name": "Mental Health Nursing",
             "grade": "C", "credits": 3.0, "semester": "Fall", "year": "2024"},
        ],
        "extraction_notes": "[mock] missing graduation profile",
    }


def _profile_unaccredited() -> dict[str, Any]:
    return {
        "student_name": "Skylar D. Bennett",
        "institution_name": "Atlantic Pacific Nursing College",
        "program_name": "Bachelor of Science in Nursing",
        "degree_type": "BSN",
        "graduation_date": "2024-12-12",
        "graduation_confirmed": True,
        "enrollment_date": "2020-09-01",
        "courses": [
            {"code": "NUR 110", "name": "Foundations",
             "grade": "B", "credits": 4.0, "semester": "Fall", "year": "2020"},
            {"code": "NUR 220", "name": "Adult Health I",
             "grade": "B+", "credits": 4.0, "semester": "Spring", "year": "2022"},
            {"code": "NUR 320", "name": "Adult Health II",
             "grade": "B", "credits": 4.0, "semester": "Fall", "year": "2023"},
            {"code": "NUR 410", "name": "Capstone",
             "grade": "A-", "credits": 4.0, "semester": "Fall", "year": "2024"},
        ],
        "extraction_notes": "[mock] unaccredited institution profile",
    }


_PROFILE_BY_KEYWORD = (
    ("fraud", _profile_fraud),
    ("missing", _profile_missing_grad),
    ("unaccr", _profile_unaccredited),
    ("unacc", _profile_unaccredited),
)


class MockLLMAdapter:
    """Drop-in stand-in for ``LLMAdapter`` used during demo and tests."""

    @staticmethod
    def is_active(api_key: str) -> bool:
        return api_key.lower().startswith("mock")

    def extract_structured_data(self, raw_text: str) -> dict[str, Any]:
        haystack = (raw_text or "").lower()
        for keyword, profile in _PROFILE_BY_KEYWORD:
            if keyword in haystack:
                return profile()

        # Stable per-input variation if the demonstrator wants determinism
        # without a keyword: hash the text to pick the clean vs. unaccredited
        # profile so re-uploading the same file yields the same answer.
        digest = hashlib.sha1(haystack.encode("utf-8", errors="ignore")).digest()
        return _profile_unaccredited() if digest[0] % 5 == 0 else _profile_clean()
