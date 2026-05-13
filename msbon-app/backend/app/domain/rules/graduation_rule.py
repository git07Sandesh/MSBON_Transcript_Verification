"""GRAD-001: Missing graduation confirmation; GRAD-002: Graduation date absent."""
from typing import Any

from app.domain.rules.base_rule import BaseRule, FlagResult


class GraduationConfirmationRule(BaseRule):
    rule_id = "GRAD-001"
    category = "GRADUATION"
    severity = "HIGH"
    is_fraud_indicator = False

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        if not extracted.get("graduation_confirmed", False):
            return [FlagResult(
                rule_id=self.rule_id,
                severity=self.severity,
                category=self.category,
                description="No explicit degree conferral statement found",
                explanation=(
                    "Rule GRAD-001: The transcript does not contain an explicit statement "
                    "confirming that the degree was conferred or that the student graduated. "
                    "MSBON requires a clear graduation confirmation."
                ),
                is_fraud_indicator=False,
                source_excerpt=extracted.get("extraction_notes"),
            )]
        return []


class GraduationDateRule(BaseRule):
    rule_id = "GRAD-002"
    category = "GRADUATION"
    severity = "MEDIUM"
    is_fraud_indicator = False

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        if not extracted.get("graduation_date"):
            return [FlagResult(
                rule_id=self.rule_id,
                severity=self.severity,
                category=self.category,
                description="Graduation date field not present",
                explanation=(
                    "Rule GRAD-002: No graduation date could be extracted from the transcript. "
                    "MSBON requires a verifiable graduation date for licensure processing."
                ),
                is_fraud_indicator=False,
            )]
        return []
