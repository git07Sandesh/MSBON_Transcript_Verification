import os
from datetime import datetime, timezone
from typing import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


def _get_engine():
    db_url = settings.database_url
    # Ensure data directory exists for SQLite
    if db_url.startswith("sqlite"):
        db_path = db_url.replace("sqlite:///", "")
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)

    if db_url.startswith("sqlite"):
        from sqlalchemy.pool import StaticPool
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true",
        )
    else:
        engine = create_engine(
            db_url,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_recycle=3600,
            pool_pre_ping=True,
            echo=os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true",
        )
    return engine


engine = _get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables via Alembic migrations and seed initial data."""
    from app.models.orm import (  # noqa: F401 - imports needed for metadata
        accredited_program,
        audit_log,
        extracted_data,
        flagging_rule,
        staff_review,
        transcript,
        verification_flag,
    )

    from alembic.config import Config
    from alembic import command as alembic_command
    alembic_cfg = Config("alembic.ini")
    alembic_command.upgrade(alembic_cfg, "head")

    _seed_flagging_rules()
    _seed_accredited_programs()


def _seed_flagging_rules() -> None:
    from app.models.orm.flagging_rule import FlaggingRule

    rules = [
        {"id": "GRAD-001", "name": "Missing graduation confirmation", "category": "GRADUATION", "severity": "HIGH",
         "description": "No explicit degree conferral statement found", "is_active": True, "rule_config": None},
        {"id": "GRAD-002", "name": "Graduation date absent", "category": "GRADUATION", "severity": "MEDIUM",
         "description": "Graduation date field not present", "is_active": True, "rule_config": None},
        {"id": "ACCR-001", "name": "Institution not in MS accredited list", "category": "ACCREDITATION", "severity": "HIGH",
         "description": "School not found in accredited_programs table", "is_active": True, "rule_config": None},
        {"id": "ACCR-002", "name": "Accreditation body not recognized", "category": "ACCREDITATION", "severity": "MEDIUM",
         "description": "Body is not ACEN or CCNE", "is_active": True, "rule_config": None},
        {"id": "COUR-001", "name": "Required nursing courses not present", "category": "COURSE", "severity": "HIGH",
         "description": "One or more mandatory courses missing from course list", "is_active": True, "rule_config": None},
        {"id": "COUR-002", "name": "Insufficient credit hours", "category": "COURSE", "severity": "MEDIUM",
         "description": "Total nursing credits below minimum threshold", "is_active": True,
         "rule_config": '{"min_credits_adn": 60, "min_credits_bsn": 120, "min_credits_msn": 36}'},
        {"id": "FRAU-001", "name": "Program completion time below minimum", "category": "FRAUD", "severity": "HIGH",
         "description": "Duration from enrollment to graduation is physically impossible", "is_active": True,
         "rule_config": '{"min_months_adn": 18, "min_months_bsn": 24, "min_months_msn": 18, "min_months_dnp": 24}'},
        {"id": "FRAU-002", "name": "Suspicious grade distribution", "category": "FRAUD", "severity": "MEDIUM",
         "description": "Abnormal pattern suggesting grade fabrication", "is_active": True,
         "rule_config": '{"perfect_grade_threshold": 0.95}'},
        {"id": "FRAU-003", "name": "Institution on fraud watch list", "category": "FRAUD", "severity": "HIGH",
         "description": "School name matches known fraudulent program", "is_active": True, "rule_config": None},
        {"id": "FORM-001", "name": "Required transcript fields missing", "category": "FORMAT", "severity": "LOW",
         "description": "Key fields (name, school, program) could not be extracted", "is_active": True, "rule_config": None},
        {"id": "FORM-002", "name": "Inconsistent date formatting", "category": "FORMAT", "severity": "LOW",
         "description": "Dates appear in multiple conflicting formats", "is_active": True, "rule_config": None},
        {"id": "FORM-003", "name": "Inconsistent grade formatting", "category": "FORMAT", "severity": "LOW",
         "description": "Grade notation changes mid-transcript", "is_active": True, "rule_config": None},
    ]

    with SessionLocal() as db:
        for rule_data in rules:
            existing = db.get(FlaggingRule, rule_data["id"])
            if not existing:
                rule = FlaggingRule(
                    id=rule_data["id"],
                    name=rule_data["name"],
                    category=rule_data["category"],
                    severity=rule_data["severity"],
                    description=rule_data["description"],
                    is_active=rule_data["is_active"],
                    rule_config=rule_data["rule_config"],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(rule)
        db.commit()


def _seed_accredited_programs() -> None:
    from app.models.orm.accredited_program import AccreditedProgram

    programs = [
        {"institution_name": "University of Southern Mississippi", "program_name": "Bachelor of Science in Nursing",
         "accreditation_body": "CCNE", "accreditation_type": "Baccalaureate", "state": "MS", "is_active": True},
        {"institution_name": "University of Southern Mississippi", "program_name": "Associate Degree in Nursing",
         "accreditation_body": "ACEN", "accreditation_type": "Associate", "state": "MS", "is_active": True},
        {"institution_name": "Mississippi University for Women", "program_name": "Bachelor of Science in Nursing",
         "accreditation_body": "CCNE", "accreditation_type": "Baccalaureate", "state": "MS", "is_active": True},
        {"institution_name": "Alcorn State University", "program_name": "Bachelor of Science in Nursing",
         "accreditation_body": "ACEN", "accreditation_type": "Baccalaureate", "state": "MS", "is_active": True},
        {"institution_name": "Delta State University", "program_name": "Bachelor of Science in Nursing",
         "accreditation_body": "CCNE", "accreditation_type": "Baccalaureate", "state": "MS", "is_active": True},
        {"institution_name": "William Carey University", "program_name": "Bachelor of Science in Nursing",
         "accreditation_body": "CCNE", "accreditation_type": "Baccalaureate", "state": "MS", "is_active": True},
        {"institution_name": "Copiah-Lincoln Community College", "program_name": "Associate Degree in Nursing",
         "accreditation_body": "ACEN", "accreditation_type": "Associate", "state": "MS", "is_active": True},
        {"institution_name": "Hinds Community College", "program_name": "Associate Degree in Nursing",
         "accreditation_body": "ACEN", "accreditation_type": "Associate", "state": "MS", "is_active": True},
    ]

    with SessionLocal() as db:
        count = db.execute(text("SELECT COUNT(*) FROM accredited_programs")).scalar()
        if count == 0:
            import uuid
            from datetime import datetime, timezone
            for p in programs:
                prog = AccreditedProgram(
                    id=str(uuid.uuid4()),
                    institution_name=p["institution_name"],
                    program_name=p["program_name"],
                    accreditation_body=p["accreditation_body"],
                    accreditation_type=p["accreditation_type"],
                    state=p["state"],
                    is_active=p["is_active"],
                    accreditation_expires=None,
                )
                db.add(prog)
            db.commit()
