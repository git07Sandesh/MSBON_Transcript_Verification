"""Generic base repository with common CRUD helpers."""
from typing import Generic, Optional, Type, TypeVar

from sqlalchemy.orm import Session

from app.database import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    def __init__(self, model: Type[ModelT], db: Session) -> None:
        self.model = model
        self.db = db

    def get(self, id: str) -> Optional[ModelT]:
        return self.db.get(self.model, id)

    def save(self, instance: ModelT) -> ModelT:
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def list_all(self) -> list[ModelT]:
        return self.db.query(self.model).all()
