from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm.staff_review import StaffReview
from app.repositories.base_repository import BaseRepository


class ReviewRepository(BaseRepository[StaffReview]):
    def __init__(self, db: Session) -> None:
        super().__init__(StaffReview, db)

    def get_by_flag_id(self, flag_id: str) -> Optional[StaffReview]:
        return self.db.query(StaffReview).filter(StaffReview.flag_id == flag_id).first()

    def get_by_transcript_id(self, transcript_id: str) -> list[StaffReview]:
        return (
            self.db.query(StaffReview)
            .filter(StaffReview.transcript_id == transcript_id)
            .all()
        )
