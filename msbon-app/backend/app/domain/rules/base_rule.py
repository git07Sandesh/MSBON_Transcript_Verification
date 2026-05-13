"""Base class for all verification rules."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class FlagResult:
    rule_id: str
    severity: str
    category: str
    description: str
    explanation: str
    is_fraud_indicator: bool
    source_excerpt: Optional[str] = None


class BaseRule(ABC):
    """All rules implement evaluate() and return a list of FlagResult."""

    rule_id: str
    category: str
    severity: str
    is_fraud_indicator: bool = False

    def __init__(self, rule_config: Optional[dict[str, Any]] = None) -> None:
        self.config: dict[str, Any] = rule_config or {}

    @abstractmethod
    def evaluate(self, extracted: dict[str, Any]) -> list[FlagResult]:
        """
        Evaluate the extracted data dict against this rule.
        Returns a list of FlagResult (empty = no flag).
        """
        ...
