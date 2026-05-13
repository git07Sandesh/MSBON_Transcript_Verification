"""ACCR-001: Institution not in MS accredited list; ACCR-002: Body not ACEN/CCNE."""
from typing import Any, Optional

from app.domain.rules.base_rule import BaseRule, FlagResult

RECOGNIZED_BODIES = {"ACEN", "CCNE"}


class AccreditationRule(BaseRule):
    """
    Requires accredited_programs list injected at construction time
    (list of dicts with keys: institution_name, accreditation_body, is_active).
    """

    rule_id = "ACCR-001"
    category = "ACCREDITATION"
    severity = "HIGH"
    is_fraud_indicator = False

    def __init__(self, rule_config: Optional[dict[str, Any]] = None,
                 accredited_programs: Optional[list[dict[str, Any]]] = None) -> None:
        super().__init__(rule_config)
        self.accredited_programs: list[dict[str, Any]] = accredited_programs or []

    def _fuzzy_match(self, name: str) -> Optional[dict[str, Any]]:
        """Case-insensitive substring match against institution names."""
        if not name:
            return None
        name_lower = name.lower().strip()
        for prog in self.accredited_programs:
            if not prog.get("is_active", True):
                continue
            if name_lower in prog["institution_name"].lower() or \
               prog["institution_name"].lower() in name_lower:
                return prog
        return None

    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        institution = extracted.get("institution_name")
        flags: list[FlagResult] = []

        match = self._fuzzy_match(institution) if institution else None

        if not match:
            flags.append(FlagResult(
                rule_id="ACCR-001",
                severity="HIGH",
                category="ACCREDITATION",
                description="Institution not in MS accredited list",
                explanation=(
                    f"Rule ACCR-001: The institution '{institution}' was not found in the "
                    "MSBON accredited_programs table. Staff must verify accreditation status manually."
                ),
                is_fraud_indicator=False,
                source_excerpt=institution,
            ))
        else:
            body = match.get("accreditation_body", "")
            if body not in RECOGNIZED_BODIES:
                flags.append(FlagResult(
                    rule_id="ACCR-002",
                    severity="MEDIUM",
                    category="ACCREDITATION",
                    description="Accreditation body not recognized",
                    explanation=(
                        f"Rule ACCR-002: The accreditation body '{body}' for "
                        f"'{institution}' is not ACEN or CCNE. MSBON requires ACEN or CCNE accreditation."
                    ),
                    is_fraud_indicator=False,
                    source_excerpt=institution,
                ))

        return flags
