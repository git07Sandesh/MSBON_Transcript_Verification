from datetime import date
from typing import Optional

from pydantic import BaseModel


class ProgramOut(BaseModel):
    id: str
    institution_name: str
    program_name: str
    accreditation_body: str
    accreditation_type: str
    state: str
    is_active: bool
    accreditation_expires: Optional[date] = None

    class Config:
        from_attributes = True


class ProgramCreate(BaseModel):
    institution_name: str
    program_name: str
    accreditation_body: str
    accreditation_type: str
    state: str
    accreditation_expires: Optional[date] = None
