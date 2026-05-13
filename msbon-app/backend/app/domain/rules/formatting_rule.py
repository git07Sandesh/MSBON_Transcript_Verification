"""FORM-001: Required fields missing; FORM-002: Mixed date formats; FORM-003: Mixed grade notation."""
import re
from typing import Any

from app.domain.rules.base_rule import BaseRule, FlagResult

REQUIRED_FIELDS = ["student_name", "institution_name", "program_name"]

DATE_PATTERNS = [
    re.compile(r"\d{4}-\d{2}-\d{2}"),        # ISO: 2024-05-15
    re.compile(r"\d{1,2}/\d{1,2}/\d{4}"),    # US: 05/15/2024
    re.compile(r"\d{1,2}-\d{1,2}-\d{4}"),    # dashes: 05-15-2024
    re.compile(r"[A-Za-z]+ \d{4}"),           # Month Year: May 2024
]

LETTER_GRADE = re.compile(r"^[A-F][+-]?$")
NUMERIC_GRADE = re.compile(r"^\d{1,3}(\.\d+)?$")
GPA_GRADE = re.compile(r"^[0-4](\.\d+)?$")
PASS_FAIL = re.compile(r"^(P|F|Pass|Fail|CR|NC)$", re.IGNORECASE)


class FormattingConsistencyRule(BaseRule):
    rule_id = "FORM-001"
    category = "FORMAT"
    severity = "LOW"
    is_fraud_indicator = False

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        flags: list[FlagResult] = []

        # FORM-001: required fields missing
        missing = [f for f in REQUIRED_FIELDS if not extracted.get(f)]
        if missing:
            flags.append(FlagResult(
                rule_id="FORM-001",
                severity="LOW",
                category="FORMAT",
                description="Required transcript fields missing",
                explanation=(
                    f"Rule FORM-001: The following required fields could not be extracted: "
                    f"{', '.join(missing)}. This may indicate a non-standard transcript format."
                ),
                is_fraud_indicator=False,
                source_excerpt=f"Missing fields: {', '.join(missing)}",
            ))

        # FORM-002: inconsistent date formatting across courses
        courses: list[dict[str, Any]] = extracted.get("courses") or []
        date_format_types: set[str] = set()
        for course in courses:
            year = str(course.get("year") or "")
            semester = str(course.get("semester") or "")
            combined = f"{semester} {year}".strip()
            if DATE_PATTERNS[0].search(combined):
                date_format_types.add("iso")
            elif DATE_PATTERNS[1].search(combined):
                date_format_types.add("us_slash")
            elif DATE_PATTERNS[2].search(combined):
                date_format_types.add("dash")
            elif DATE_PATTERNS[3].search(combined):
                date_format_types.add("month_year")

        if len(date_format_types) > 1:
            flags.append(FlagResult(
                rule_id="FORM-002",
                severity="LOW",
                category="FORMAT",
                description="Inconsistent date formatting",
                explanation=(
                    f"Rule FORM-002: Multiple date formats detected in course records: "
                    f"{', '.join(date_format_types)}. Consistent formatting is expected."
                ),
                is_fraud_indicator=False,
                source_excerpt=f"Detected formats: {', '.join(date_format_types)}",
            ))

        # FORM-003: inconsistent grade notation
        if len(courses) >= 3:
            grade_types: set[str] = set()
            for course in courses:
                grade = str(course.get("grade") or "").strip()
                if LETTER_GRADE.match(grade):
                    grade_types.add("letter")
                elif NUMERIC_GRADE.match(grade) and float(grade) > 4.0:
                    grade_types.add("numeric_100")
                elif GPA_GRADE.match(grade):
                    grade_types.add("gpa")
                elif PASS_FAIL.match(grade):
                    grade_types.add("pass_fail")

            if len(grade_types) > 1 and "pass_fail" not in grade_types:
                flags.append(FlagResult(
                    rule_id="FORM-003",
                    severity="LOW",
                    category="FORMAT",
                    description="Inconsistent grade formatting",
                    explanation=(
                        f"Rule FORM-003: Multiple grade notation systems detected: "
                        f"{', '.join(grade_types)}. Grade notation should be consistent throughout."
                    ),
                    is_fraud_indicator=False,
                    source_excerpt=f"Grade types detected: {', '.join(grade_types)}",
                ))

        return flags
