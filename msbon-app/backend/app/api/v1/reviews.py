from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.models.schemas.review import ReviewRequest, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ReviewResponse)
def submit_review(
    body: ReviewRequest,
    request: Request,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.SUBMIT_REVIEW)),
    db: Session = Depends(get_db),
):
    reviewer_id = token["sub"]
    ip = request.client.host if request.client else None

    svc = ReviewService(db)
    review = svc.submit_review(
        flag_id=body.flag_id,
        transcript_id=body.transcript_id,
        reviewer_id=reviewer_id,
        decision=body.decision,
        annotation=body.annotation,
        override_reason=body.override_reason,
        ip_address=ip,
    )
    return ReviewResponse(
        id=review.id,
        flag_id=review.flag_id,
        decision=review.decision,
        annotation=review.annotation,
        reviewed_at=review.reviewed_at,
    )


@router.get("/{transcript_id}", response_model=list[ReviewResponse])
def get_reviews(
    transcript_id: str,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    db: Session = Depends(get_db),
):
    svc = ReviewService(db)
    reviews = svc.get_by_transcript(transcript_id)
    return [
        ReviewResponse(
            id=r.id,
            flag_id=r.flag_id,
            decision=r.decision,
            annotation=r.annotation,
            reviewed_at=r.reviewed_at,
        )
        for r in reviews
    ]
