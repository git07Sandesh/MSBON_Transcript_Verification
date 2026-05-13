"""Unit tests for all rule classes."""
import pytest
from app.domain.rules.graduation_rule import GraduationConfirmationRule, GraduationDateRule
from app.domain.rules.accreditation_rule import AccreditationRule
from app.domain.rules.course_completion_rule import CourseCompletionRule
from app.domain.rules.fraud_indicator_rule import FraudIndicatorRule
from app.domain.rules.formatting_rule import FormattingConsistencyRule

ACEN_PROGRAMS = [
    {"institution_name": "University of Southern Mississippi", "accreditation_body": "ACEN", "is_active": True}
]


# --- GraduationConfirmationRule ---

def test_grad_001_passes_when_confirmed():
    rule = GraduationConfirmationRule()
    flags = rule.evaluate({"graduation_confirmed": True})
    assert flags == []


def test_grad_001_flags_when_not_confirmed():
    rule = GraduationConfirmationRule()
    flags = rule.evaluate({"graduation_confirmed": False})
    assert len(flags) == 1
    assert flags[0].rule_id == "GRAD-001"
    assert flags[0].severity == "HIGH"


def test_grad_001_flags_missing_key():
    rule = GraduationConfirmationRule()
    flags = rule.evaluate({})
    assert len(flags) == 1


# --- GraduationDateRule ---

def test_grad_002_passes_with_date():
    rule = GraduationDateRule()
    flags = rule.evaluate({"graduation_date": "2024-05-15"})
    assert flags == []


def test_grad_002_flags_without_date():
    rule = GraduationDateRule()
    flags = rule.evaluate({"graduation_date": None})
    assert len(flags) == 1
    assert flags[0].rule_id == "GRAD-002"


# --- AccreditationRule ---

def test_accr_001_passes_known_institution():
    rule = AccreditationRule(accredited_programs=ACEN_PROGRAMS)
    flags = rule.evaluate({"institution_name": "University of Southern Mississippi"})
    assert flags == []


def test_accr_001_flags_unknown_institution():
    rule = AccreditationRule(accredited_programs=ACEN_PROGRAMS)
    flags = rule.evaluate({"institution_name": "Mystery Nursing School"})
    rule_ids = [f.rule_id for f in flags]
    assert "ACCR-001" in rule_ids


def test_accr_002_flags_unrecognized_body():
    programs = [{"institution_name": "ABC Nursing", "accreditation_body": "STATE", "is_active": True}]
    rule = AccreditationRule(accredited_programs=programs)
    flags = rule.evaluate({"institution_name": "ABC Nursing"})
    rule_ids = [f.rule_id for f in flags]
    assert "ACCR-002" in rule_ids


def test_accr_001_flags_null_institution():
    rule = AccreditationRule(accredited_programs=ACEN_PROGRAMS)
    flags = rule.evaluate({"institution_name": None})
    assert any(f.rule_id == "ACCR-001" for f in flags)


# --- CourseCompletionRule ---

FULL_COURSES = [
    {"code": "NUR 301", "name": "Fundamentals of Nursing", "grade": "A", "credits": 20.0},
    {"code": "NUR 320", "name": "Medical-Surgical Nursing", "grade": "B", "credits": 20.0},
    {"code": "NUR 330", "name": "Pharmacology", "grade": "A", "credits": 20.0},
    {"code": "NUR 340", "name": "Mental Health Nursing", "grade": "B", "credits": 20.0},
    {"code": "NUR 350", "name": "Maternal Obstetric Nursing", "grade": "A", "credits": 20.0},
    {"code": "NUR 360", "name": "Pediatric Nursing", "grade": "A", "credits": 20.0},
]


def test_cour_001_passes_all_courses_present():
    rule = CourseCompletionRule()
    flags = rule.evaluate({"degree_type": "BSN", "courses": FULL_COURSES})
    cour001 = [f for f in flags if f.rule_id == "COUR-001"]
    assert cour001 == []


def test_cour_001_flags_missing_course():
    courses = [c for c in FULL_COURSES if "mental" not in c["name"].lower()]
    rule = CourseCompletionRule()
    flags = rule.evaluate({"degree_type": "BSN", "courses": courses})
    assert any(f.rule_id == "COUR-001" for f in flags)


def test_cour_002_flags_low_credits():
    courses = [{"name": "Fundamentals of Nursing", "grade": "A", "credits": 5.0}] * 6
    rule = CourseCompletionRule()
    flags = rule.evaluate({"degree_type": "BSN", "courses": courses})
    assert any(f.rule_id == "COUR-002" for f in flags)


# --- FraudIndicatorRule ---

def test_frau_001_flags_impossibly_fast_bsn():
    rule = FraudIndicatorRule()
    flags = rule.evaluate({
        "degree_type": "BSN",
        "graduation_date": "2024-05-01",
        "enrollment_date": "2024-01-01",
        "courses": [],
    })
    assert any(f.rule_id == "FRAU-001" for f in flags)


def test_frau_001_passes_normal_timeline():
    rule = FraudIndicatorRule()
    flags = rule.evaluate({
        "degree_type": "BSN",
        "graduation_date": "2024-05-01",
        "enrollment_date": "2020-08-01",
        "courses": [],
    })
    assert all(f.rule_id != "FRAU-001" for f in flags)


def test_frau_003_flags_fraud_school():
    rule = FraudIndicatorRule()
    flags = rule.evaluate({
        "degree_type": "BSN",
        "institution_name": "Sacred Heart Nursing Academy",
        "graduation_date": None,
        "enrollment_date": None,
        "courses": [],
    })
    assert any(f.rule_id == "FRAU-003" for f in flags)


def test_frau_002_flags_perfect_grades():
    courses = [{"name": f"Course {i}", "grade": "A", "credits": 3.0} for i in range(6)]
    rule = FraudIndicatorRule()
    flags = rule.evaluate({
        "degree_type": "BSN",
        "graduation_date": None,
        "enrollment_date": None,
        "courses": courses,
        "institution_name": "Normal Nursing",
    })
    assert any(f.rule_id == "FRAU-002" for f in flags)


# --- FormattingConsistencyRule ---

def test_form_001_passes_all_fields():
    rule = FormattingConsistencyRule()
    flags = rule.evaluate({
        "student_name": "Jane",
        "institution_name": "USM",
        "program_name": "BSN",
        "courses": [],
    })
    form001 = [f for f in flags if f.rule_id == "FORM-001"]
    assert form001 == []


def test_form_001_flags_missing_student_name():
    rule = FormattingConsistencyRule()
    flags = rule.evaluate({
        "student_name": None,
        "institution_name": "USM",
        "program_name": "BSN",
        "courses": [],
    })
    assert any(f.rule_id == "FORM-001" for f in flags)
