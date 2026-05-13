"""Shared pytest fixtures."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use in-memory SQLite with StaticPool so all connections share the same DB
TEST_DB_URL = "sqlite://"
os.environ.setdefault("DATABASE_URL", TEST_DB_URL)
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("UPLOAD_DIR", "/tmp/msbon_test_uploads")

# Import all ORM models before Base.metadata operations so all tables are registered
from app.models.orm import (  # noqa: F401
    transcript, extracted_data, verification_flag,
    staff_review, audit_log, flagging_rule, accredited_program,
)
from app.database import Base, get_db
from app.main import app

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Fresh in-memory DB per test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """FastAPI test client wired to the test DB."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    # Seed flagging rules
    from app.database import _seed_flagging_rules, _seed_accredited_programs
    # Patch SessionLocal to use test engine temporarily
    import app.database as db_module
    original = db_module.SessionLocal
    db_module.SessionLocal = TestingSessionLocal
    _seed_flagging_rules()
    _seed_accredited_programs()
    db_module.SessionLocal = original

    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_extracted() -> dict:
    return {
        "student_name": "Jane Doe",
        "institution_name": "University of Southern Mississippi",
        "program_name": "Bachelor of Science in Nursing",
        "degree_type": "BSN",
        "graduation_date": "2024-05-15",
        "graduation_confirmed": True,
        "enrollment_date": "2020-08-20",
        "courses": [
            {"code": "NUR 301", "name": "Fundamentals of Nursing", "grade": "A", "credits": 3.0, "semester": "Fall", "year": "2020"},
            {"code": "NUR 320", "name": "Medical-Surgical Nursing", "grade": "B+", "credits": 4.0, "semester": "Spring", "year": "2021"},
            {"code": "NUR 330", "name": "Pharmacology", "grade": "A-", "credits": 3.0, "semester": "Fall", "year": "2021"},
            {"code": "NUR 340", "name": "Mental Health Nursing", "grade": "B", "credits": 3.0, "semester": "Spring", "year": "2022"},
            {"code": "NUR 350", "name": "Maternal Obstetric Nursing", "grade": "A", "credits": 3.0, "semester": "Fall", "year": "2022"},
            {"code": "NUR 360", "name": "Pediatric Nursing", "grade": "A-", "credits": 3.0, "semester": "Spring", "year": "2023"},
        ],
        "extraction_notes": None,
    }
