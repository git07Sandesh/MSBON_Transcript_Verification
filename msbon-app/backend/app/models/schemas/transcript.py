from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class CourseOut(BaseModel):
    code: Optional[str] = None
    name: str
    grade: str
    credits: Optional[float] = None
    semester: Optional[str] = None
    year: Optional[str] = None


class ExtractedDataOut(BaseModel):
    student_name: Optional[str] = None
    institution_name: Optional[str] = None
    program_name: Optional[str] = None
    degree_type: Optional[str] = None
    graduation_date: Optional[date] = None
    graduation_confirmed: bool
    enrollment_date: Optional[date] = None
    courses: list[CourseOut] = []
    extraction_confidence: Optional[float] = None
    extracted_at: datetime
    llm_model_used: str

    class Config:
        from_attributes = True


class ReviewOut(BaseModel):
    id: str
    flag_id: str
    reviewer_id: str
    decision: str
    annotation: Optional[str] = None
    override_reason: Optional[str] = None
    reviewed_at: datetime

    class Config:
        from_attributes = True


class FlagOut(BaseModel):
    id: str
    rule_id: str
    severity: str
    category: str
    description: str
    source_excerpt: Optional[str] = None
    explanation: str
    is_fraud_indicator: bool
    flagged_at: datetime
    review: Optional[ReviewOut] = None

    class Config:
        from_attributes = True


class TranscriptUploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    uploaded_at: datetime
    uploaded_by: str


class TranscriptDetailResponse(BaseModel):
    id: str
    filename: str
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    uploaded_by: str
    extracted_data: Optional[ExtractedDataOut] = None
    flags: list[FlagOut] = []

    class Config:
        from_attributes = True


class TranscriptListItem(BaseModel):
    id: str
    filename: str
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    uploaded_by: str

    class Config:
        from_attributes = True


class TranscriptListResponse(BaseModel):
    items: list[TranscriptListItem]
    total: int
    skip: int
    limit: int


class ProcessResponse(BaseModel):
    transcript_id: str
    status: str
    message: str
