import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.models.orm.accredited_program import AccreditedProgram
from app.models.schemas.program import ProgramCreate, ProgramOut
from app.repositories.program_repository import ProgramRepository

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("", response_model=list[ProgramOut])
def list_programs(
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    db: Session = Depends(get_db),
):
    repo = ProgramRepository(db)
    return repo.list_active()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ProgramOut)
def add_program(
    body: ProgramCreate,
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.MANAGE_PROGRAMS)),
    db: Session = Depends(get_db),
):
    repo = ProgramRepository(db)
    program = AccreditedProgram(
        id=str(uuid.uuid4()),
        institution_name=body.institution_name,
        program_name=body.program_name,
        accreditation_body=body.accreditation_body,
        accreditation_type=body.accreditation_type,
        state=body.state,
        is_active=True,
        accreditation_expires=body.accreditation_expires,
    )
    return repo.add(program)
