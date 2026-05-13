"""Importing this package eagerly registers every ORM class with SQLAlchemy.

Many code paths only import a single model (Transcript, AuditLog, etc.) but
SQLAlchemy mapper configuration needs the entire registry populated to
resolve cross-table relationship() back-references like ``Transcript.flags``
→ ``VerificationFlag``. Without these eager imports, the first query in a
fresh process hits ``InvalidRequestError: ... failed to locate a name``.
"""
from app.models.orm import (        # noqa: F401
    accredited_program,
    audit_log,
    extracted_data,
    flagging_rule,
    staff_review,
    transcript,
    verification_flag,
)
