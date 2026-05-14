# MSBON Transcript Verification, Demo Script
**Team Nexus | CSC 424 Capstone | recorded presentation aid**

This is the keystroke-level walkthrough for the recorded final presentation. It runs end-to-end on a fresh checkout in roughly **6 minutes** of screen time and exercises every functional requirement except the OCR/Tesseract path (covered briefly in §6).

---

## 0. Prerequisites, one-time per machine

```bash
# from the repo root
cd msbon-app

# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
# Edit .env to add the SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
# / SUPABASE_JWT_SECRET / DATABASE_URL block.  See README.md for where to grab them.
uvicorn app.main:app --reload                  # http://localhost:8000

# frontend (in another terminal, from msbon-app/)
cd frontend
npm install
# Create .env.local with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                                     # http://localhost:5173
```

**Verify:**
```bash
curl http://localhost:8000/api/v1/health    # → {"status":"healthy",...}
open http://localhost:5173                  # → public site
```

The default `.env` ships with `GEMINI_API_KEY=mock-demo-key-for-poc-dev`, so extraction runs through `MockLLMAdapter` (see `backend/app/infrastructure/mock_llm_adapter.py`), **the demo works without a real Gemini key**. Paste a real key any time to switch.

### One-time auth setup

The first time you bring up the project against a new Supabase environment:

```bash
cd msbon-app/backend
source .venv/bin/activate
python -m scripts.seed_supabase_users
```

This creates the three demo accounts in Supabase Auth:

| Email                      | Password | Role     |
|----------------------------|----------|----------|
| `admin@msbon.local`        | `demo`   | admin    |
| `reviewer1@msbon.local`    | `demo`   | reviewer |
| `viewer1@msbon.local`      | `demo`   | viewer   |

The script is idempotent, re-running it just resets the role on `app_metadata` for users that already exist.

---

## 1. Open with the problem (≈ 30 s, narration only)

> "Operation Nightingale, 2023, federal investigators uncovered thousands of nursing licenses awarded against fraudulent transcripts. Mississippi State Board of Nursing reviews every transcript by hand. We built an AI-assisted first-pass tool: it extracts, flags, and audits, but every licensure decision still belongs to staff."

---

## 2. Sign in as admin (≈ 20 s)

1. Show `http://localhost:5173`.
2. Click **Sign in** in the public site nav (or hit `/app/login` directly).
3. Enter **`admin@msbon.local`** / **`demo`**.
4. Land on the **Dashboard** with KPI tiles + charts.

> "Authentication runs through Supabase Auth, real password hashing, real session tokens, JWT with the user's role baked into `app_metadata`. The backend validates that JWT against Supabase's published JWKS using ES256. Demo accounts are seeded by a script; real users would sign up through the same flow."

---

## 3. Tour the dashboard (≈ 20 s)

1. Hover the four KPI tiles, they animate counting up from zero.
2. Point at the *Decisions, last 14 days* timeline, the *Top firing rules* ranked bars, and the *Decision split* breakdown.
3. Scroll down to *Recent activity*.

> "The dashboard is the post-login default. Every number is live from the database, no canned data."

---

## 4. Browse the program catalog (≈ 20 s)

1. Click **Programs** in the nav.
2. Show the seeded list of Mississippi accredited programs (USM, Alcorn, Delta State, etc.).
3. (Optional) click *Add program* and walk through the form.

> "The Accreditation rule queries this table, if an institution isn't listed, the system flags it for staff. Adding a program is admin-only; reviewers see read-only."

---

## 5. Upload synthetic transcript A, **clean** (≈ 90 s)

1. Click **Upload**.
2. Drag `msbon-app/demo_fixtures/clean_BSN.pdf` onto the dropzone.
3. Watch *Uploading…* → *Extracting, then verifying against twelve rules…* → *Verification complete*.
4. Verification page opens.
5. Show the **Extracted Data** panel, student, institution, graduation date, courses.
6. Show the **Flags** panel, should be empty (USM, valid BSN, complete curriculum, sufficient credits).
7. Click **CONFIRMED** in the review form, optional annotation `"Standard BSN, no anomalies."`, submit.

---

## 6. Upload synthetic transcript B, **fraud** (≈ 2 minutes, the centerpiece)

1. Back to **Upload**.
2. Drag `msbon-app/demo_fixtures/fraud_BSN.pdf`.
3. Same processing flow → opens Verification.
4. **Toggle "Original document"** at the top of the Verification page, the inline PDF viewer renders with the rule-source excerpts highlighted in terracotta. Click any highlight; the matching flag card flashes.
5. Toggle back to *Extracted data* and walk through each flag:
   - **ACCR-001 (HIGH)**, *Institution not in MS accredited list.* Source excerpt: "Acme Online Nursing Institute".
   - **COUR-001 (HIGH)**, *Required nursing courses not present.* Lists missing curriculum areas.
   - **COUR-002 (MEDIUM)**, *Insufficient credit hours.* Total credits 4.0 vs 120.0 required for BSN.
   - **FRAU-001 (HIGH)**, *Program completion time below minimum*, 8-month BSN is physically impossible.
6. Click **OVERRIDE** on one flag for demo purposes.
7. Required override reason, type:
   > *"Verified ACEN accreditation directly with institution by phone. Documentation forwarded to compliance."*
8. Submit. Confirmation toast.
9. Click **Export report** in the page header. A one-page PDF memo (`MSBON_verification_*.pdf`) downloads, open it to show the flags and override reasoning rendered as an editorial-style auditor artifact.

> "Every flag carries the rule ID, severity, the verbatim source excerpt the LLM pulled out, and a plain-language explanation. The reviewer never sees a black box. And the override path forces a written justification, that's the audit trail. The export PDF is what gets attached to the licensure file."

---

## 7. Demonstrate the audit log (≈ 60 s)

1. Click **Audit** in the nav.
2. Show every action in order: `UPLOAD`, `EXTRACT`, `VERIFY`, `OVERRIDE_FLAG`. Note the `actor_id` is the **Supabase user UUID**, not a hand-typed name.
3. Filter by transcript ID (the fraud transcript), list narrows to its rows.
4. Click **Export CSV**, save the file, open in Numbers/Excel, show the columns including `correlation_id` linking every action.

---

## 8. Show keyboard shortcuts (≈ 20 s)

1. Press **`⌘K`** (or `Ctrl-K`), command palette opens. Type "fraud" → enter → jumps to the fraud transcript.
2. Press **`?`**, shortcuts overlay opens. Show the bindings: `g d/t/u/a/p` for nav, `c/o/n` to decide a flag, `v` to toggle source PDF view, `e` to export.

---

## 9. Side-by-side compare (≈ 30 s, optional but compelling)

1. Back to Transcripts list.
2. Tick the checkbox on two transcripts.
3. Click **"Compare selected"** in the floating action bar.
4. Two summaries side-by-side; field-level differences ringed in terracotta.

---

## 10. OpenAPI explorer (≈ 30 s, optional)

1. Open `http://localhost:8000/docs` in a new tab.
2. Walk through Pydantic-driven docs for `/transcripts`, `/reviews`, `/insights`.

---

## 11. Lessons learned (≈ 60 s, narration over a static slide)

Cover at least three of:

- **Real auth + real database, on free infrastructure.** Migrating from hardcoded JWT + SQLite to Supabase Auth + Postgres took the auth surface from "demo accounts in a Python dict" to a production pattern (password hashing, session lifecycle, JWKS-based ES256 verification, role in `app_metadata` per Supabase security guidance) without changing a single SQLAlchemy query.
- **Layered architecture pays off.** Swapping the LLM provider for a deterministic mock took one new class and one factory line. The rule engine, repositories, and routes never changed.
- **Append-only audit at the repository layer.** Making `update`/`delete` raise instead of relying on convention caught two service-layer bugs during the audit phase. With the Supabase swap, every audit row now ties back to a real user UUID.
- **Phased remediation.** 153 audit findings ranked into Critical/Major/Minor was the difference between *paralyzed* and *demonstrable*.
- **AI is advisory, full stop.** No endpoint approves or denies a license. Every flag explains itself; every override is recorded.

---

## 12. Recording tips

- **Cut between sections**, voice-over PowerPoint with screenshots of steps 5–9 is acceptable per the syllabus.
- **Pre-warm the backend**, the first JWT decode hits Supabase JWKS once, then caches.
- **Use a 1440×900 window** for the browser, fits comfortably in a 1080p capture.
- **Free-tier note:** Supabase pauses an idle project after 7 days of zero traffic; the first request auto-resumes it (~10 s). Sign in once before recording so the session is warm.

---

## 13. Reset between takes

To start a clean recording:

```bash
# Wipe app data in Supabase Postgres, keeping schema + seed
cd msbon-app/backend
source .venv/bin/activate
python -c "
from app.database import SessionLocal
from sqlalchemy import text
with SessionLocal() as db:
    for tbl in ['audit_logs','staff_reviews','verification_flags','extracted_data','transcripts']:
        db.execute(text(f'TRUNCATE TABLE {tbl} CASCADE'))
    db.commit()
print('Wiped transactional tables.')
"
rm -rf uploads/*.pdf uploads/*.png   # drop uploaded files
```

The synthetic transcripts in `demo_fixtures/` and the seeded rules + programs are unaffected.

---

*End of demo script. Total run time ≈ 6 minutes including narration.*
