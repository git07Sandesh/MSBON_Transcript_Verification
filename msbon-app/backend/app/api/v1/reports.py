"""Generate a one-page editorial PDF memo of a transcript verification.

The reviewer downloads this and attaches it to the licensure file. Uses
reportlab (already pinned in requirements.txt). No external network calls.

Layout follows the editorial design system: cream paper, charcoal text,
terracotta accent, generous margins, Helvetica family (reportlab default;
Fraunces is not embedded server-side to keep the dependency footprint small).
"""
import io
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.api.v1.dependencies import verify_token
from app.auth.permissions import Permission, require_permission
from app.database import get_db
from app.exceptions import TranscriptNotFoundError
from app.repositories.transcript_repository import TranscriptRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcripts", tags=["transcripts"])

# Editorial palette (mirrors frontend tokens).
CREAM      = colors.HexColor("#F7F3EE")
CREAM_DARK = colors.HexColor("#EDE7DC")
CHARCOAL   = colors.HexColor("#1E1E1E")
CHARCOAL_M = colors.HexColor("#6B6560")
TERRACOTTA = colors.HexColor("#B84A32")

PAGE_W, PAGE_H = LETTER
MARGIN = 0.85 * inch


def _draw_label(c: canvas.Canvas, x: float, y: float, text: str) -> None:
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(CHARCOAL_M)
    c.drawString(x, y, text.upper())


def _draw_body(c: canvas.Canvas, x: float, y: float, text: str, *, size: float = 10) -> None:
    c.setFont("Helvetica", size)
    c.setFillColor(CHARCOAL)
    c.drawString(x, y, text)


def _wrap_text(c: canvas.Canvas, text: str, font: str, size: float, max_width: float) -> list[str]:
    c.setFont(font, size)
    lines: list[str] = []
    for paragraph in text.splitlines() or [""]:
        words = paragraph.split(" ")
        current = ""
        for w in words:
            trial = (current + " " + w).strip()
            if c.stringWidth(trial, font, size) <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = w
        if current:
            lines.append(current)
    return lines


@router.get("/{transcript_id}/report.pdf")
def generate_report(
    transcript_id: str,
    db: Session = Depends(get_db),
    token: dict = Depends(verify_token),
    _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
):
    repo = TranscriptRepository(db)
    transcript = repo.get_by_id(transcript_id)
    if not transcript:
        raise TranscriptNotFoundError()

    ed = transcript.extracted_data
    flags = list(transcript.flags or [])

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=LETTER)
    c.setTitle(f"MSBON Verification — {transcript.filename}")
    c.setAuthor("MSBON Verification System")

    # Cream page background
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    # Header strip
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGIN, PAGE_H - MARGIN + 12, "MSBON · VERIFICATION RECORD")
    c.setFillColor(CHARCOAL_M)
    c.setFont("Helvetica", 8.5)
    c.drawRightString(
        PAGE_W - MARGIN,
        PAGE_H - MARGIN + 12,
        datetime.now(timezone.utc).strftime("Generated %Y-%m-%d %H:%M UTC"),
    )
    c.setStrokeColor(CHARCOAL)
    c.setLineWidth(0.6)
    c.line(MARGIN, PAGE_H - MARGIN + 4, PAGE_W - MARGIN, PAGE_H - MARGIN + 4)

    # Title
    y = PAGE_H - MARGIN - 14
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 22)
    title_lines = _wrap_text(c, transcript.filename, "Helvetica-Bold", 22, PAGE_W - 2 * MARGIN)
    for line in title_lines[:2]:
        c.drawString(MARGIN, y, line)
        y -= 26

    c.setFillColor(TERRACOTTA)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, y - 6, transcript.status.upper())
    y -= 30

    # Two-column meta
    col_w = (PAGE_W - 2 * MARGIN) / 2
    meta_left = [
        ("Transcript ID", transcript.id),
        ("Uploaded by",   transcript.uploaded_by or "—"),
        ("Uploaded at",   transcript.uploaded_at.strftime("%Y-%m-%d %H:%M UTC")),
        ("Processed at",  transcript.processed_at.strftime("%Y-%m-%d %H:%M UTC")
                          if transcript.processed_at else "—"),
    ]
    meta_right = []
    if ed:
        meta_right = [
            ("Student",        ed.student_name or "—"),
            ("Institution",    ed.institution_name or "—"),
            ("Program",        ed.program_name or "—"),
            ("Graduation",     str(ed.graduation_date) if ed.graduation_date else "—"),
            ("Total credits",  f"{sum(float((c.get('credits') or 0)) for c in (json.loads(ed.courses_json) if ed.courses_json else [])):.1f}"),
        ]

    meta_y = y
    for label, value in meta_left:
        _draw_label(c, MARGIN, meta_y, label)
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN, meta_y - 12, str(value)[:60])
        meta_y -= 28

    meta_y2 = y
    for label, value in meta_right:
        _draw_label(c, MARGIN + col_w, meta_y2, label)
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN + col_w, meta_y2 - 12, str(value)[:60])
        meta_y2 -= 28

    y = min(meta_y, meta_y2) - 10

    # Flags + decisions section
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN, y, f"FLAGS · {len(flags)}")
    c.setStrokeColor(CHARCOAL_M)
    c.setLineWidth(0.4)
    c.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4)
    y -= 18

    if not flags:
        c.setFillColor(CHARCOAL_M)
        c.setFont("Helvetica-Oblique", 11)
        c.drawString(MARGIN, y, "No verification flags raised. Transcript cleared.")
        y -= 18
    else:
        for flag in flags:
            if y < MARGIN + 130:  # leave space for footer
                c.setFillColor(CHARCOAL_M)
                c.setFont("Helvetica-Oblique", 8)
                c.drawString(MARGIN, MARGIN - 8, "[truncated — additional flags in audit log]")
                break

            # Severity rail
            severity = flag.severity or "LOW"
            rail_color = TERRACOTTA if severity == "HIGH" else CHARCOAL if severity == "MEDIUM" else CHARCOAL_M
            c.setFillColor(rail_color)
            c.rect(MARGIN, y - 60, 2, 56, stroke=0, fill=1)

            c.setFillColor(CHARCOAL_M)
            c.setFont("Helvetica-Bold", 7.5)
            c.drawString(MARGIN + 10, y, f"{flag.rule_id} · {flag.category} · {severity}")

            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 11)
            desc = (flag.description or "")[:90]
            c.drawString(MARGIN + 10, y - 14, desc)

            # Explanation
            c.setFillColor(CHARCOAL_M)
            c.setFont("Helvetica", 9)
            for line in _wrap_text(c, flag.explanation or "", "Helvetica", 9, PAGE_W - 2 * MARGIN - 20)[:2]:
                y -= 0
                c.drawString(MARGIN + 10, y - 28, line)
                y -= 11

            # Decision
            review = flag.review
            if review:
                c.setFillColor(TERRACOTTA if review.decision == "OVERRIDDEN" else CHARCOAL)
                c.setFont("Helvetica-Bold", 9)
                c.drawString(MARGIN + 10, y - 30, f"DECISION: {review.decision} · {review.reviewer_id}")
                if review.override_reason:
                    c.setFillColor(CHARCOAL_M)
                    c.setFont("Helvetica-Oblique", 8.5)
                    for ln in _wrap_text(c, f"Reason: {review.override_reason}", "Helvetica-Oblique", 8.5, PAGE_W - 2 * MARGIN - 20)[:2]:
                        y -= 11
                        c.drawString(MARGIN + 10, y - 30, ln)
                y -= 24
            else:
                c.setFillColor(CHARCOAL_M)
                c.setFont("Helvetica-Oblique", 9)
                c.drawString(MARGIN + 10, y - 30, "DECISION: pending review")
                y -= 14

            y -= 28

    # Footer
    c.setFillColor(CHARCOAL_M)
    c.setFont("Helvetica", 7.5)
    c.drawString(
        MARGIN,
        MARGIN - 26,
        f"Reviewed by {token.get('sub', 'staff')} · "
        f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} · "
        "Synthetic data only — no automated licensure decisions",
    )
    c.setStrokeColor(CHARCOAL_M)
    c.line(MARGIN, MARGIN - 16, PAGE_W - MARGIN, MARGIN - 16)
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(PAGE_W - MARGIN, MARGIN - 26, "MSBON · TEAM NEXUS · CSC 424")

    c.showPage()
    c.save()
    buf.seek(0)

    safe_name = transcript.filename.replace('"', "").replace("\n", " ")[:120]
    headers = {
        "Content-Disposition": f'attachment; filename="MSBON_verification_{transcript.id[:8]}.pdf"',
        "X-Report-Source": safe_name,
        "Cache-Control": "private, no-store",
    }
    return StreamingResponse(buf, media_type="application/pdf", headers=headers)
