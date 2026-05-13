import json
import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Query, UploadFile, status

logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.models.schemas.transcript import (
    ProcessResponse,
    TranscriptDetailResponse,
    TranscriptListResponse,
    TranscriptUploadResponse,
    ExtractedDataOut,
    FlagOut,
    ReviewOut,
)
from app.services.extraction_service import ExtractionService
from app.services.transcript_service import TranscriptService
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


@router.post("/upload", status_code=status.HTTP_201_CREATED,
             response_model=TranscriptUploadResponse)
async def upload_transcript(
    file: UploadFile = File(...),
    uploaded_by: str = Form(...),
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.UPLOAD_TRANSCRIPT)),
    db: Session = Depends(get_db),
):
    staff_id = token["sub"]
    file_bytes = await file.read()
    svc = TranscriptService(db)
    transcript = svc.upload(
        filename=file.filename or "transcript",
        file_bytes=file_bytes,
        uploaded_by=staff_id,
    )
    return TranscriptUploadResponse(
        id=transcript.id,
        filename=transcript.filename,
        status=transcript.status,
        uploaded_at=transcript.uploaded_at,
        uploaded_by=transcript.uploaded_by,
    )


@router.post("/{transcript_id}/process", status_code=status.HTTP_202_ACCEPTED,
             response_model=ProcessResponse)
def process_transcript(
    transcript_id: str,
    background_tasks: BackgroundTasks,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.UPLOAD_TRANSCRIPT)),
    db: Session = Depends(get_db),
):
    staff_id = token["sub"]
    # Verify transcript exists
    svc = TranscriptService(db)
    svc.get_by_id(transcript_id)

    def _run_pipeline():
        from app.database import SessionLocal
        try:
            with SessionLocal() as session:
                logger.info("Pipeline started", extra={"transcript_id": transcript_id})
                extraction_svc = ExtractionService(session)
                extraction_svc.process(transcript_id, actor_id=staff_id)
                verification_svc = VerificationService(session)
                verification_svc.verify(transcript_id, actor_id=staff_id)
                logger.info("Pipeline completed", extra={"transcript_id": transcript_id})
        except Exception:
            logger.exception("Pipeline failed", extra={"transcript_id": transcript_id})
            try:
                import sentry_sdk
                sentry_sdk.capture_exception()
            except ImportError:
                pass

    background_tasks.add_task(_run_pipeline)

    return ProcessResponse(
        transcript_id=transcript_id,
        status="EXTRACTING",
        message="Processing pipeline started",
    )


@router.get("/{transcript_id}", response_model=TranscriptDetailResponse)
def get_transcript(
    transcript_id: str,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    db: Session = Depends(get_db),
):
    svc = TranscriptService(db)
    t = svc.get_by_id(transcript_id)

    extracted_out = None
    if t.extracted_data:
        ed = t.extracted_data
        courses = json.loads(ed.courses_json) if ed.courses_json else []
        extracted_out = ExtractedDataOut(
            student_name=ed.student_name,
            institution_name=ed.institution_name,
            program_name=ed.program_name,
            degree_type=ed.degree_type,
            graduation_date=ed.graduation_date,
            graduation_confirmed=ed.graduation_confirmed,
            enrollment_date=ed.enrollment_date,
            courses=courses,
            extraction_confidence=ed.extraction_confidence,
            extracted_at=ed.extracted_at,
            llm_model_used=ed.llm_model_used,
        )

    flags_out = []
    for flag in t.flags:
        review_out = None
        if flag.review:
            r = flag.review
            review_out = ReviewOut(
                id=r.id,
                flag_id=r.flag_id,
                reviewer_id=r.reviewer_id,
                decision=r.decision,
                annotation=r.annotation,
                override_reason=r.override_reason,
                reviewed_at=r.reviewed_at,
            )
        flags_out.append(FlagOut(
            id=flag.id,
            rule_id=flag.rule_id,
            severity=flag.severity,
            category=flag.category,
            description=flag.description,
            source_excerpt=flag.source_excerpt,
            explanation=flag.explanation,
            is_fraud_indicator=flag.is_fraud_indicator,
            flagged_at=flag.flagged_at,
            review=review_out,
        ))

    return TranscriptDetailResponse(
        id=t.id,
        filename=t.filename,
        status=t.status,
        uploaded_at=t.uploaded_at,
        processed_at=t.processed_at,
        uploaded_by=t.uploaded_by,
        extracted_data=extracted_out,
        flags=flags_out,
    )


@router.get("", response_model=TranscriptListResponse)
def list_transcripts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None),
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    db: Session = Depends(get_db),
):
    svc = TranscriptService(db)
    items, total = svc.list_paginated(skip=skip, limit=limit, status_filter=status)
    return TranscriptListResponse(items=items, total=total, skip=skip, limit=limit)
