# MSBON Fraud-Sensitive Transcript Verification System

**Team Nexus | University of Southern Mississippi | PoC v1.0**

AI-assisted nursing transcript verification for the Mississippi State Board of Nursing. Extracts structured data from PDFs/images via OCR + Google Gemini LLM, applies 12 rule-based fraud/compliance checks, and surfaces findings for human staff review with full audit logging.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Tesseract OCR (`brew install tesseract` on Mac)
- `libmagic` (`brew install libmagic` on Mac)

### Backend

```bash
cd msbon-app/backend

# Create virtual environment
python3 -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env — set GEMINI_API_KEY

# Run (tables + seed data created automatically on startup)
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000/api/v1`
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd msbon-app/frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Environment Variables (backend/.env)

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model name |
| `DATABASE_URL` | `sqlite:///./data/msbon.db` | SQLAlchemy DB URL |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |
| `MAX_FILE_SIZE_MB` | `10` | File size limit |
| `FILE_RETENTION_HOURS` | `24` | Hours before uploaded files are deleted |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `APP_VERSION` | `1.0.0-poc` | App version string |

---

## Running Tests

```bash
cd msbon-app/backend
source .venv/bin/activate
pytest
```

---

## Architecture Overview

```
msbon-app/
├── backend/               FastAPI + SQLite + Python 3.11
│   └── app/
│       ├── api/v1/        REST endpoints (transcripts, reviews, audit, programs, health)
│       ├── services/      Business logic (transcript, extraction, verification, review, audit)
│       ├── domain/rules/  12 flagging rules (GRAD, ACCR, COUR, FRAU, FORM)
│       ├── infrastructure/ OCR extractor + Gemini LLM adapter
│       ├── models/        SQLAlchemy ORM + Pydantic schemas
│       └── repositories/  Data access layer (audit is write-only)
└── frontend/              React 18 + TypeScript + Vite + Tailwind
    └── src/
        ├── pages/         Upload, TranscriptList, Verification, AuditLog, Programs
        ├── components/    FlagList, ReviewForm, AuditLogTable, FileDropzone, etc.
        └── services/      Axios API clients
```

---

## Key Design Decisions

- **No automated licensure decisions** — all AI outputs are advisory; staff retain full authority
- **Tamper-evident audit logs** — `AuditRepository` is write-only; `update()` and `delete()` raise `OperationNotPermittedError`
- **12 transparent rules** — every flag includes rule ID + source excerpt + full explanation
- **File security** — files saved as `{uuid}.{ext}`; MIME validated via `python-magic` (not file extension); originals stored outside web root
- **LLM resilience** — Gemini adapter retries 3× with exponential back-off before raising `LLM_UNAVAILABLE`

---

## Acceptance Criteria

| Criterion | Target |
|---|---|
| Flag detection accuracy | ≥ 90% against synthetic test set |
| Flag explainability | 100% — every flag has rule ID + source + explanation |
| Audit completeness | 100% — every state change produces an audit entry |
| Override traceability | 100% — every OVERRIDDEN decision stores `override_reason` |
| No automated decisions | 100% — no endpoint approves or denies licensure |

---

*MSBON PoC — not for production deployment. Synthetic/de-identified data only.*
