"""COUR-001: Required nursing courses missing; COUR-002: Insufficient credit hours."""
from typing import Any

from app.domain.rules.base_rule import BaseRule, FlagResult

# Minimum credit thresholds by degree type
MIN_CREDITS: dict[str, float] = {
    "ADN": 60.0,
    "BSN": 120.0,
    "MSN": 36.0,
    "DNP": 36.0,
    "LPN": 30.0,
}

# Required nursing course keywords (any one match per group counts)
REQUIRED_COURSE_GROUPS: list[tuple[str, list[str]]] = [
    ("Fundamentals of Nursing", ["fundamental", "foundations of nursing", "intro to nursing"]),
    ("Medical-Surgical Nursing", ["medical-surgical", "med-surg", "adult health"]),
    ("Pharmacology", ["pharmacology", "pharmacotherapeutics", "drug"]),
    ("Mental Health / Psychiatric Nursing", ["mental health", "psychiatric", "psych nurs"]),
    ("Maternal / OB Nursing", ["maternal", "obstetric", "ob nurs", "women", "perinatal"]),
    ("Pediatric Nursing", ["pediatric", "peds nurs", "child health"]),
]


class CourseCompletionRule(BaseRule):
    rule_id = "COUR-001"
    category = "COURSE"
    severity = "HIGH"
    is_fraud_indicator = False

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        courses: list[dict[str, Any]] = extracted.get("courses") or []
        degree_type: str = (extracted.get("degree_type") or "BSN").upper()
        flags: list[FlagResult] = []

        # COUR-001: check required course groups
        missing_groups: list[str] = []
        course_names_lower = [
            ((c.get("name") or "") + " " + (c.get("code") or "")).lower()
            for c in courses
        ]

        for group_name, keywords in REQUIRED_COURSE_GROUPS:
            found = any(
                any(kw in course_text for kw in keywords)
                for course_text in course_names_lower
            )
            if not found:
                missing_groups.append(group_name)

        if missing_groups:
            flags.append(FlagResult(
                rule_id="COUR-001",
                severity="HIGH",
                category="COURSE",
                description="Required nursing courses not present",
                explanation=(
                    f"Rule COUR-001: The following required nursing course areas were not found "
                    f"in the transcript: {', '.join(missing_groups)}. "
                    "MSBON requires completion of core nursing curriculum areas."
                ),
                is_fraud_indicator=False,
                source_excerpt=f"Missing areas: {', '.join(missing_groups)}",
            ))

        # COUR-002: check total credit hours
        min_credits = self.config.get(f"min_credits_{degree_type.lower()}") or \
                      MIN_CREDITS.get(degree_type, 60.0)
        total_credits = sum(
            float(c.get("credits") or 0) for c in courses
        )
        if total_credits > 0 and total_credits < min_credits:
            flags.append(FlagResult(
                rule_id="COUR-002",
                severity="MEDIUM",
                category="COURSE",
                description="Insufficient credit hours",
                explanation=(
                    f"Rule COUR-002: Total nursing credits extracted = {total_credits:.1f}. "
                    f"Minimum required for {degree_type} = {min_credits:.1f}."
                ),
                is_fraud_indicator=False,
                source_excerpt=f"Total credits: {total_credits:.1f}",
            ))

        return flags
