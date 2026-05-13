from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.orm.accredited_program import AccreditedProgram
from app.repositories.base_repository import BaseRepository


class ProgramRepository(BaseRepository[AccreditedProgram]):
    def __init__(self, db: Session) -> None:
        super().__init__(AccreditedProgram, db)

    def list_active(self) -> list[AccreditedProgram]:
        return (
            self.db.query(AccreditedProgram)
            .filter(AccreditedProgram.is_active == True)
            .order_by(AccreditedProgram.institution_name)
            .all()
        )

    def find_by_name(self, institution_name: str) -> Optional[AccreditedProgram]:
        """Case-insensitive partial match using SQL-level filtering."""
        name_lower = institution_name.lower()
        return (
            self.db.query(AccreditedProgram)
            .filter(
                AccreditedProgram.is_active == True,
                func.lower(AccreditedProgram.institution_name).contains(name_lower),
            )
            .first()
        )

    def add(self, program: AccreditedProgram) -> AccreditedProgram:
        return self.save(program)
