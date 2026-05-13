"""FRAU-001: Impossibly fast completion; FRAU-002: Suspicious grades; FRAU-003: Fraud watch list."""
from datetime import date
from typing import Any

from app.domain.rules.base_rule import BaseRule, FlagResult

# Minimum program months by degree type
MIN_MONTHS: dict[str, int] = {
    "ADN": 18,
    "BSN": 24,
    "MSN": 18,
    "DNP": 24,
    "LPN": 12,
}

# Known fraudulent institution names (Operation Nightingale and similar)
FRAUD_WATCH_LIST: list[str] = [
    "sacred heart",
    "tri-valley university",
    "brown mackie",
    "premier nursing",
    "nightingale nursing",
    "fast track nursing",
    "american nursing academy",
]

PERFECT_GRADES = {"A", "A+", "4.0", "100", "A1"}


class FraudIndicatorRule(BaseRule):
    rule_id = "FRAU-001"
    category = "FRAUD"
    severity = "HIGH"
    is_fraud_indicator = True

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        flags: list[FlagResult] = []
        degree_type: str = (extracted.get("degree_type") or "BSN").upper()

        # FRAU-001: impossibly fast completion
        grad_date_raw = extracted.get("graduation_date")
        enroll_date_raw = extracted.get("enrollment_date")
        if grad_date_raw and enroll_date_raw:
            try:
                if isinstance(grad_date_raw, str):
                    grad_date = date.fromisoformat(grad_date_raw)
                else:
                    grad_date = grad_date_raw
                if isinstance(enroll_date_raw, str):
                    enroll_date = date.fromisoformat(enroll_date_raw)
                else:
                    enroll_date = enroll_date_raw

                months_elapsed = (grad_date.year - enroll_date.year) * 12 + \
                                 (grad_date.month - enroll_date.month)
                min_months = self.config.get(f"min_months_{degree_type.lower()}") or \
                             MIN_MONTHS.get(degree_type, 18)

                if months_elapsed < min_months:
                    flags.append(FlagResult(
                        rule_id="FRAU-001",
                        severity="HIGH",
                        category="FRAUD",
                        description="Program completion time below minimum threshold",
                        explanation=(
                            f"Rule FRAU-001: {degree_type} program requires a minimum of {min_months} months. "
                            f"Detected completion in approximately {months_elapsed} months "
                            f"(Enrollment: {enroll_date}, Graduation: {grad_date})."
                        ),
                        is_fraud_indicator=True,
                        source_excerpt=f"Enrollment: {enroll_date} | Graduation: {grad_date}",
                    ))
            except (ValueError, TypeError):
                pass

        # FRAU-002: suspicious grade distribution
        courses: list[dict[str, Any]] = extracted.get("courses") or []
        if len(courses) >= 5:
            perfect_count = sum(
                1 for c in courses if str(c.get("grade", "")).strip().upper() in PERFECT_GRADES
            )
            threshold = self.config.get("perfect_grade_threshold", 0.95)
            if perfect_count / len(courses) >= threshold:
                flags.append(FlagResult(
                    rule_id="FRAU-002",
                    severity="MEDIUM",
                    category="FRAUD",
                    description="Suspicious grade distribution",
                    explanation=(
                        f"Rule FRAU-002: {perfect_count} of {len(courses)} courses "
                        f"({100 * perfect_count / len(courses):.0f}%) have perfect grades. "
                        "This pattern is statistically abnormal and may indicate grade fabrication."
                    ),
                    is_fraud_indicator=True,
                    source_excerpt=f"Perfect grades: {perfect_count}/{len(courses)}",
                ))

        # FRAU-003: institution on fraud watch list
        institution = (extracted.get("institution_name") or "").lower()
        for watch_name in FRAUD_WATCH_LIST:
            if watch_name in institution:
                flags.append(FlagResult(
                    rule_id="FRAU-003",
                    severity="HIGH",
                    category="FRAUD",
                    description="Institution on fraud watch list",
                    explanation=(
                        f"Rule FRAU-003: The institution '{extracted.get('institution_name')}' "
                        f"matches a known fraudulent program ('{watch_name}'). "
                        "Staff must escalate for investigation."
                    ),
                    is_fraud_indicator=True,
                    source_excerpt=extracted.get("institution_name"),
                ))
                break

        return flags
