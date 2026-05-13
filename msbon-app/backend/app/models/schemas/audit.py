from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: str
    transcript_id: Optional[str] = None
    actor_id: str
    action_type: str
    action_detail: str
    outcome: str
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True
