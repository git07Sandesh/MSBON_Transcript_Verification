"""Orchestrates all active rules against extracted transcript data."""
import json
import logging

logger = logging.getLogger(__name__)
from typing import Any

from sqlalchemy.orm import Session

from app.domain.rules.accreditation_rule import AccreditationRule
from app.domain.rules.base_rule import FlagResult
from app.domain.rules.course_completion_rule import CourseCompletionRule
from app.domain.rules.formatting_rule import FormattingConsistencyRule
from app.domain.rules.fraud_indicator_rule import FraudIndicatorRule
from app.domain.rules.graduation_rule import GraduationConfirmationRule, GraduationDateRule


class RuleEngine:
    def run_all(self, extracted: dict[str, Any], db: Session) -> list[FlagResult]:
        """
        Load active rules from DB, instantiate matching rule classes, evaluate,
        and return all FlagResults.
        """
        from app.models.orm.flagging_rule import FlaggingRule
        from app.models.orm.accredited_program import AccreditedProgram

        active_rules = db.query(FlaggingRule).filter(FlaggingRule.is_active == True).all()
        active_ids = {r.id: r for r in active_rules}

        # Load accredited programs once for AccreditationRule
        programs = db.query(AccreditedProgram).filter(AccreditedProgram.is_active == True).all()
        programs_dicts = [
            {
                "institution_name": p.institution_name,
                "accreditation_body": p.accreditation_body,
                "is_active": p.is_active,
            }
            for p in programs
        ]

        all_flags: list[FlagResult] = []

        for rule_id, rule_orm in active_ids.items():
            config = json.loads(rule_orm.rule_config) if rule_orm.rule_config else {}
            rule_instance = self._build_rule(rule_id, config, programs_dicts)
            if rule_instance is None:
                continue
            flags = rule_instance.evaluate(extracted)
            all_flags.extend(flags)

        return all_flags

    def _build_rule(self, rule_id: str, config: dict, programs: list[dict]):
        if rule_id == "GRAD-001":
            return GraduationConfirmationRule(config)
        elif rule_id == "GRAD-002":
            return GraduationDateRule(config)
        elif rule_id in ("ACCR-001", "ACCR-002"):
            # AccreditationRule handles both ACCR-001 and ACCR-002 internally
            if rule_id == "ACCR-001":
                return AccreditationRule(config, programs)
            return None  # ACCR-002 is emitted by AccreditationRule when ACCR-001 matches
        elif rule_id in ("COUR-001", "COUR-002"):
            if rule_id == "COUR-001":
                return CourseCompletionRule(config)
            return None  # COUR-002 is emitted by CourseCompletionRule
        elif rule_id in ("FRAU-001", "FRAU-002", "FRAU-003"):
            if rule_id == "FRAU-001":
                return FraudIndicatorRule(config)
            return None  # FRAU-002/003 emitted by FraudIndicatorRule
        elif rule_id in ("FORM-001", "FORM-002", "FORM-003"):
            if rule_id == "FORM-001":
                return FormattingConsistencyRule(config)
            return None  # FORM-002/003 emitted by FormattingConsistencyRule
        return None
