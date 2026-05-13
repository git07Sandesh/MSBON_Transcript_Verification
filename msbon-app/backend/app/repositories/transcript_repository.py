from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm.transcript import Transcript
from app.repositories.base_repository import BaseRepository


class TranscriptRepository(BaseRepository[Transcript]):
    def __init__(self, db: Session) -> None:
        super().__init__(Transcript, db)

    def get_by_id(self, id: str) -> Optional[Transcript]:
        return (
            self.db.query(Transcript)
            .filter(Transcript.id == id)
            .first()
        )

    def list_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        status_filter: Optional[str] = None,
    ) -> tuple[list[Transcript], int]:
        query = self.db.query(Transcript)
        if status_filter:
            query = query.filter(Transcript.status == status_filter)
        total = query.count()
        items = query.order_by(Transcript.uploaded_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def update_status(self, id: str, status: str, processed_at=None) -> Optional[Transcript]:
        transcript = self.get_by_id(id)
        if transcript:
            transcript.status = status
            if processed_at:
                transcript.processed_at = processed_at
            self.db.commit()
            self.db.refresh(transcript)
        return transcript
