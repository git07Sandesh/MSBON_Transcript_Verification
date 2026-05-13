from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class ReviewRequest(BaseModel):
    flag_id: str
    transcript_id: str
    # reviewer_id is sourced from the verified JWT (sub claim) by the route
    # handler — never trust a client-supplied identity in the body.
    # Field kept Optional purely for backwards compatibility with older clients
    # that still send it; the value is ignored.
    reviewer_id: Optional[str] = None
    decision: str  # CONFIRMED | OVERRIDDEN | NEEDS_MORE_INFO
    annotation: Optional[str] = None
    override_reason: Optional[str] = None

    @model_validator(mode="after")
    def check_override_reason(self):
        if self.decision == "OVERRIDDEN" and not self.override_reason:
            from app.exceptions import OverrideReasonRequiredError
            raise OverrideReasonRequiredError()
        return self


class ReviewResponse(BaseModel):
    id: str
    flag_id: str
    decision: str
    annotation: Optional[str] = None
    reviewed_at: datetime

    class Config:
        from_attributes = True
