"""initial_schema_integrity

Revision ID: 001_initial
Revises:
Create Date: 2026-03-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- transcripts ---
    op.create_table(
        "transcripts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(512), nullable=False),
        sa.Column("file_type", sa.String(10), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "UPLOADED", "EXTRACTING", "EXTRACTED", "VERIFYING",
                "FLAGGED", "CLEAR", "REVIEWED", "OVERRIDDEN",
                name="transcriptstatus",
            ),
            nullable=False,
            server_default="UPLOADED",
        ),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.Column("uploaded_by", sa.String(100), nullable=False),
    )
    op.create_index(
        "ix_transcripts_status_uploaded_at", "transcripts", ["status", "uploaded_at"]
    )

    # --- flagging_rules ---
    op.create_table(
        "flagging_rules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(10), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("rule_config", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("name", name="uq_flagging_rule_name"),
    )
    op.create_index("ix_flagging_rules_category", "flagging_rules", ["category"])

    # --- accredited_programs ---
    op.create_table(
        "accredited_programs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("institution_name", sa.String(255), nullable=False),
        sa.Column("program_name", sa.String(255), nullable=False),
        sa.Column("accreditation_body", sa.String(20), nullable=False),
        sa.Column("accreditation_type", sa.String(50), nullable=False),
        sa.Column("state", sa.String(2), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("accreditation_expires", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
    )

    # --- extracted_data ---
    op.create_table(
        "extracted_data",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "transcript_id",
            sa.String(36),
            sa.ForeignKey("transcripts.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("student_name", sa.Text(), nullable=True),
        sa.Column("institution_name", sa.String(255), nullable=True),
        sa.Column("program_name", sa.String(255), nullable=True),
        sa.Column("degree_type", sa.String(20), nullable=True),
        sa.Column("graduation_date", sa.Date(), nullable=True),
        sa.Column("graduation_confirmed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("enrollment_date", sa.Date(), nullable=True),
        sa.Column("courses_json", sa.Text(), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("extraction_confidence", sa.Float(), nullable=True),
        sa.Column("extracted_at", sa.DateTime(), nullable=False),
        sa.Column("llm_model_used", sa.String(100), nullable=False),
    )
    op.create_index("ix_extracted_data_transcript_id", "extracted_data", ["transcript_id"])

    # --- verification_flags ---
    op.create_table(
        "verification_flags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "transcript_id",
            sa.String(36),
            sa.ForeignKey("transcripts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "rule_id",
            sa.String(36),
            sa.ForeignKey("flagging_rules.id"),
            nullable=False,
        ),
        sa.Column("severity", sa.String(10), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("source_excerpt", sa.Text(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("is_fraud_indicator", sa.Boolean(), nullable=False),
        sa.Column("flagged_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("transcript_id", "rule_id", name="uq_flag_transcript_rule"),
    )
    op.create_index(
        "ix_verification_flags_transcript_id", "verification_flags", ["transcript_id"]
    )

    # --- staff_reviews ---
    op.create_table(
        "staff_reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "flag_id",
            sa.String(36),
            sa.ForeignKey("verification_flags.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column(
            "transcript_id",
            sa.String(36),
            sa.ForeignKey("transcripts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("reviewer_id", sa.String(100), nullable=False),
        sa.Column("decision", sa.String(20), nullable=False),
        sa.Column("annotation", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=False),
        sa.Column("override_reason", sa.Text(), nullable=True),
    )
    op.create_index("ix_staff_reviews_transcript_id", "staff_reviews", ["transcript_id"])
    op.create_index("ix_staff_reviews_reviewed_at", "staff_reviews", ["reviewed_at"])

    # --- audit_logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "transcript_id",
            sa.String(36),
            sa.ForeignKey("transcripts.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("actor_id", sa.String(100), nullable=False),
        sa.Column("action_type", sa.String(50), nullable=False),
        sa.Column("action_detail", sa.Text(), nullable=False),
        sa.Column("outcome", sa.String(20), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.CheckConstraint("outcome IN ('SUCCESS', 'FAILURE')", name="ck_audit_outcome"),
        sa.CheckConstraint("action_type != ''", name="ck_audit_action_type_nonempty"),
    )
    op.create_index(
        "ix_audit_logs_transcript_timestamp", "audit_logs", ["transcript_id", "timestamp"]
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("staff_reviews")
    op.drop_table("verification_flags")
    op.drop_table("extracted_data")
    op.drop_table("accredited_programs")
    op.drop_table("flagging_rules")
    op.drop_table("transcripts")
