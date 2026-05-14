# PHASE 2 OUTPUT: UNIFIED IMPLEMENTATION BLUEPRINT

**Project:** MSBON Fraud-Sensitive Transcript Verification System
**Blueprint Date:** 2026-03-29
**Architect:** Principal Software Architect (Synthesized from 6-Domain Parallel Audit)
**Input:** Phase 1 Full Audit Report, 153 findings across 6 domains

---

## Table of Contents

1. [Master Finding Registry](#section-1-master-finding-registry)
2. [Cross-Domain Dependency Map](#section-2-cross-domain-dependency-map)
3. [Systemic Themes](#section-3-systemic-themes)
4. [Architectural Decisions](#section-4-architectural-decisions)
5. [Phased Implementation Plan](#section-5-phased-implementation-plan)
6. [Phase A Agent Dispatch Briefs](#section-6-phase-a-agent-dispatch-briefs)
7. [Appendix: Finding Count Carried Forward](#appendix-finding-count-carried-forward)

---

## Section 1: Master Finding Registry

| ID | Domain | Severity | Summary (≤12 words) | BREAKING? | Cross-Domain? | Status |
|----|--------|----------|----------------------|-----------|---------------|--------|
| FE-001 | Frontend | CRITICAL | Unsafe `as any` cast defeats type safety in ProgramsPage | No | No | Queued |
| FE-002 | Frontend | MAJOR | Unsafe `any` error type in UploadPage catch block | No | No | Queued |
| FE-003 | Frontend | MAJOR | Unsafe `any` error type in ReviewForm mutation callback | No | No | Queued |
| FE-004 | Frontend | MAJOR | Form state lacks TypeScript interface; field names repeated | No | Yes (FE-001) | Queued |
| FE-005 | Frontend | MAJOR | Inline mutation config mixed with form state in component | No | Yes (FE-014, FE-015) | Queued |
| FE-006 | Frontend | MAJOR | Unconditional 5-second polling regardless of data staleness | No | No | Queued |
| FE-007 | Frontend | MAJOR | Fragile refetchInterval callback breaks on null data | No | No | Queued |
| FE-008 | Frontend | MAJOR | Missing ARIA labels and keyboard nav on FileDropzone | No | No | Queued |
| FE-009 | Frontend | MAJOR | Status badge lacks semantic markup for assistive technology | No | No | Queued |
| FE-010 | Frontend | MAJOR | Pagination arrow buttons missing aria-label attributes | No | No | Queued |
| FE-011 | Frontend | MAJOR | Decision buttons use color-only differentiation (WCAG fail) | No | No | Queued |
| FE-012 | Frontend | MAJOR | Zero test coverage across entire frontend codebase | No | Yes (DO-001) | Queued |
| FE-013 | Frontend | MAJOR | No centralized error boundary or axios interceptor | No | No | Queued |
| FE-014 | Frontend | MAJOR | VerificationPage mixes data fetching, state, and UI logic | No | Yes (FE-005) | Queued |
| FE-015 | Frontend | MAJOR | API functions defined inline inside ProgramsPage component | No | Yes (FE-005) | Queued |
| FE-016 | Frontend | MINOR | Hardcoded field name array lacks TypeScript type safety | No | No | Queued |
| FE-017 | Frontend | MINOR | Inline object spread in onChange creates object every keystroke | No | No | Queued |
| FE-018 | Frontend | MINOR | UI store lacks persistence; staffId resets on every refresh | No | No | Queued |
| FE-019 | Frontend | MINOR | Verbose duplicate inline className logic in NavLink | No | No | Queued |
| FE-020 | Frontend | MINOR | Duplicate STATUS_COLORS and SEVERITY_COLORS in multiple files | No | No | Queued |
| FE-021 | Frontend | MINOR | App.css contains unused legacy styles not referenced anywhere | No | No | Queued |
| FE-022 | Frontend | MINOR | FileDropzone onClick handler not memoized with useCallback | No | No | Queued |
| FE-023 | Frontend | MINOR | Conditional filter render based on route param is unclear | No | No | Queued |
| FE-024 | Frontend | MINOR | Nullable Course fields undocumented; API contract ambiguous | No | No | Queued |
| FE-025 | Frontend | MINOR | Error discarded silently; no logging of transcript load failure | No | No | Queued |
| FE-026 | Frontend | MINOR | Hardcoded 1500ms setTimeout is magic number with no label | No | No | Queued |
| FE-027 | Frontend | MINOR | Multiple sequential setState calls in validation are fragile | No | No | Queued |
| FE-028 | Frontend | MINOR | Complex inline className construction hard to read | No | No | Queued |
| FE-029 | Frontend | MINOR | OVERRIDDEN decision conditional duplicated in render and payload | No | No | Queued |
| FE-030 | Frontend | MINOR | Vite proxy target URL hardcoded to localhost:8000 | No | No | Queued |
| FE-031 | Frontend | MINOR | Inconsistent type import patterns across service files | No | No | Queued |
| FE-032 | Frontend | MINOR | No frontend logging utility; production debugging impossible | No | No | Queued |
| FE-033 | Frontend | MINOR | flags.length accessed without memoization in TranscriptSummary | No | No | Queued |
| FE-034 | Frontend | MINOR | Navigation links missing aria-current for active page context | No | No | Queued |
| FE-035 | Frontend | MINOR | Color map lookups silently return undefined for unknown keys | No | No | Queued |
| BE-001 | Backend | CRITICAL | No startup env validation; missing API key fails silently | No | Yes (DO-005) | Queued |
| BE-002 | Backend | MAJOR | Deprecated on_event startup pattern; no lifespan context manager | No | Yes (DO-014) | Queued |
| BE-003 | Backend | MAJOR | File write and DB commit non-atomic; orphaned files on failure | No | Yes (DB-007) | Queued |
| BE-004 | Backend | MINOR | Generic repository list_all unbounded; no pagination or filtering | No | No | Queued |
| BE-005 | Backend | CRITICAL | Auth relies on unvalidated client-supplied HTTP headers entirely | Yes | Yes (SEC-001) | Queued |
| BE-006 | Backend | MAJOR | Background task returns 202 with no job ID or status endpoint | No | No | Queued |
| BE-007 | Backend | MINOR | Export format validated via regex string; Enum is safer | No | No | Queued |
| BE-008 | Backend | MINOR | status and action_type params accept unconstrained strings | No | Yes (SEC-006) | Queued |
| BE-009 | Backend | MAJOR | Retry logic catches all exceptions including fatal 401 errors | No | No | Queued |
| BE-010 | Backend | MINOR | Exception re-raises lose original traceback in some code paths | No | No | Queued |
| BE-011 | Backend | CRITICAL | No path traversal validation on file_path parameter | No | No | Queued |
| BE-012 | Backend | MAJOR | File extension not cross-validated against detected MIME type | No | Yes (SEC-013) | Queued |
| BE-013 | Backend | MINOR | decision string not validated at service layer; no enum guard | No | No | Queued |
| BE-014 | Backend | MAJOR | Admin check is only authorization; no fine-grained RBAC | No | Yes (BE-005, SEC-001) | Dependency |
| BE-015 | Backend | MINOR | reviewer_id falls back to body allowing identity impersonation | No | Yes (BE-005, SEC-001) | Dependency |
| BE-016 | Backend | MINOR | Hard LLMAdapter dependency in ExtractionService breaks testing | No | No | Queued |
| BE-017 | Backend | MINOR | _build_rule giant if-elif chain violates Open/Closed Principle | No | No | Queued |
| BE-018 | Backend | MAJOR | No structured logging; log_level config setting never consumed | No | Yes (DO-010, SEC-019) | Queued |
| BE-019 | Backend | MINOR | action_detail double-serialized via json.dumps and json.loads | No | No | Queued |
| BE-020 | Backend | CRITICAL | Real API key present in .env file on disk | No | Yes (DO-004) | Queued |
| BE-021 | Backend | MINOR | file_retention_hours config unused; uploads accumulate on disk | No | No | Queued |
| BE-022 | Backend | MAJOR | Background task session lifecycle risks race conditions | No | No | Queued |
| BE-023 | Backend | MINOR | No connection pool config; SQLite unsuitable for concurrent writes | No | Yes (DB-005, DO-015) | Queued |
| DB-001 | Database | CRITICAL | No indexes on any foreign key or commonly-queried columns | No | No | Dependency |
| DB-002 | Database | CRITICAL | Foreign keys to transcripts.id lack ondelete cascade | No | Yes (DB-003) | Dependency |
| DB-003 | Database | CRITICAL | StaffReview.transcript_id stored without foreign key constraint | No | Yes (DB-002) | Dependency |
| DB-004 | Database | CRITICAL | find_by_name loads all programs into memory; O(n) complexity | No | No | Queued |
| DB-005 | Database | CRITICAL | No connection pool config; exhausted under concurrent load | No | Yes (BE-023, DO-015) | Dependency |
| DB-006 | Database | MINOR | NOT NULL fields allow empty strings; no CHECK constraints | No | No | Dependency |
| DB-007 | Database | CRITICAL | ExtractionService makes multiple commits; partial failure leaves inconsistency | No | Yes (BE-003, DB-008) | Dependency |
| DB-008 | Database | CRITICAL | Verification audit log committed after db.commit; audit gaps possible | No | Yes (DB-007, DB-009) | Dependency |
| DB-009 | Database | CRITICAL | submit_review has three separate commit points; partial failure possible | No | Yes (DB-008) | Dependency |
| DB-010 | Database | CRITICAL | Student PII and raw text stored as plain text; HIPAA violation | Yes | Yes (SEC-010) | Dependency |
| DB-011 | Database | CRITICAL | Alembic configured but zero migration files; no version history | No | No | Queued |
| DB-012 | Database | MAJOR | FlaggingRule.name implicit unique index; category field unindexed | No | No | Dependency |
| DB-013 | Database | MAJOR | No composite unique constraint on transcript_id and rule_id | No | No | Dependency |
| DB-014 | Database | MAJOR | AccreditedProgram table missing created_at and updated_at timestamps | No | No | Dependency |
| DB-015 | Database | MAJOR | list_paginated runs two separate queries per page request | No | No | Queued |
| DB-016 | Database | MAJOR | StaffReview queries transcript_id with no index; full table scan | No | No | Dependency |
| DB-017 | Database | MAJOR | ORM relationships lack lazy loading strategy; N+1 queries at scale | No | No | Queued |
| DB-018 | Database | CRITICAL | Transcript.status unconstrained String; invalid states can persist | No | No | Dependency |
| DB-019 | Database | MINOR | String lengths inconsistent across models; no centralized constants | No | No | Dependency |
| DB-020 | Database | MINOR | AuditLog.transcript_id nullable with no semantic documentation | No | No | Dependency |
| DB-021 | Database | MINOR | echo=False hardcoded; cannot enable SQL debug logging without code change | No | No | Queued |
| DB-022 | Database | MINOR | Accredited programs list hardcoded in Python; won't scale | No | No | Queued |
| DB-023 | Database | MINOR | Seeding race condition; parallel starts cause unique constraint violations | No | No | Queued |
| DB-024 | Database | MINOR | Background task session lifecycle informational; no fix needed | No | No | Queued |
| DB-025 | Database | MINOR | Hardcoded SQLite connection string in alembic.ini | No | No | Queued |
| SEC-001 | Security | CRITICAL | No authentication on any API endpoint; all endpoints fully public | Yes | Yes (BE-005) | Queued |
| SEC-002 | Security | CRITICAL | Authorization uses client-controlled X-Staff-Role header | No | Yes (BE-005, SEC-001) | Dependency |
| SEC-003 | Security | CRITICAL | Public health endpoint leaks LLM API key configuration status | No | Yes (BE-020) | Queued |
| SEC-004 | Security | MAJOR | CORS middleware missing allow_credentials for cookie-based auth | No | No | Queued |
| SEC-005 | Security | MAJOR | CORS origins hardcoded to localhost; blocks production requests | No | No | Queued |
| SEC-006 | Security | MAJOR | status param accepts unconstrained string before DB filtering | No | Yes (BE-008) | Queued |
| SEC-007 | Security | MAJOR | action_type param accepts any string without validation | No | No | Queued |
| SEC-008 | Security | MAJOR | Audit logs store sensitive metadata as plain text without controls | No | No | Queued |
| SEC-009 | Security | MAJOR | No rate limiting on any endpoint; unlimited uploads possible | No | Yes (DO-016) | Queued |
| SEC-010 | Security | MAJOR | Student PII stored unencrypted; GDPR and HIPAA violation | Yes | Yes (DB-010) | Dependency |
| SEC-011 | Security | MAJOR | IP address optional in audit logs; insufficient for forensics | No | No | Queued |
| SEC-012 | Security | MAJOR | Frontend .env contains API base URL; accidental commit risk | No | No | Queued |
| SEC-013 | Security | MAJOR | File validation bypass possible via magic bytes prepend | No | Yes (BE-012) | Queued |
| SEC-014 | Security | MAJOR | Outdated dependencies with potential CVEs; no vuln scanning | No | No | Queued |
| SEC-015 | Security | MINOR | UUID IDs with no auth allow IDOR access to any transcript | No | Yes (BE-005, SEC-001) | Dependency |
| SEC-016 | Security | MINOR | String fields lack max_length; resource exhaustion possible | No | No | Queued |
| SEC-017 | Security | MINOR | LLM-generated source_excerpt rendered without XSS sanitization | No | No | Queued |
| SEC-018 | Security | MINOR | No security HTTP headers; missing HSTS, CSP, X-Frame-Options | No | No | Queued |
| SEC-019 | Security | MINOR | No logging config; stack traces may expose sensitive data | No | Yes (BE-018, DO-010) | Queued |
| SEC-020 | Security | MINOR | No X-RateLimit response headers on any endpoint | No | Yes (SEC-009) | Dependency |
| SEC-021 | Security | MINOR | Error responses expose exc.detail including internal implementation | No | No | Queued |
| SEC-022 | Security | MINOR | SQLite stores all data unencrypted at rest; HIPAA violation | No | No | Deferred |
| UX-001 | UI/UX | CRITICAL | Nav hardcoded Tailwind blue disconnected from CSS design tokens | No | Yes (UX-002) | Dependency |
| UX-002 | UI/UX | CRITICAL | Tailwind configured with zero theme extensions; no design system | No | No | Queued |
| UX-003 | UI/UX | MAJOR | Seven different button implementations; no reusable Button component | No | Yes (UX-002) | Dependency |
| UX-004 | UI/UX | MAJOR | Color palette duplicated across files; no single source of truth | No | Yes (UX-002) | Dependency |
| UX-005 | UI/UX | MAJOR | Padding and margins inconsistent; no coherent spacing scale | No | Yes (UX-002) | Dependency |
| UX-006 | UI/UX | MAJOR | Auto-redirect after upload has no countdown or cancel option | No | No | Queued |
| UX-007 | UI/UX | MAJOR | Loading states are bare text; no spinner or skeleton screens | No | Yes (UX-002, UX-003) | Dependency |
| UX-008 | UI/UX | MAJOR | Error states inconsistent; no retry or recovery mechanism | No | Yes (UX-002, UX-003) | Dependency |
| UX-009 | UI/UX | MAJOR | Empty states inconsistent; missing contextual guidance in tables | No | Yes (UX-002, UX-003) | Dependency |
| UX-010 | UI/UX | MAJOR | Root layout fixed at 1126px; nav non-functional on mobile | No | No | Queued |
| UX-011 | UI/UX | MAJOR | Text inputs, textareas, selects inconsistently styled across app | No | Yes (UX-002, UX-003) | Dependency |
| UX-012 | UI/UX | MAJOR | Transitions applied inconsistently; no animation standard | No | No | Queued |
| UX-013 | UI/UX | MAJOR | No focus management, skip link, or aria-live in async states | No | No | Queued |
| UX-014 | UI/UX | MAJOR | Several color combinations fail WCAG AA contrast requirements | No | No | Queued |
| UX-015 | UI/UX | MAJOR | Tables require horizontal scroll on mobile; no card fallback | No | No | Queued |
| UX-016 | UI/UX | MAJOR | Review form complex flow; no explanation of decision meanings | No | No | Queued |
| UX-017 | UI/UX | MAJOR | Processing states poorly communicated; auto-refresh is silent | No | No | Queued |
| UX-018 | UI/UX | MINOR | Button text patterns inconsistent across navigation and actions | No | No | Queued |
| UX-019 | UI/UX | MINOR | Decision buttons lack role="radio" and aria-checked attributes | No | No | Queued |
| UX-020 | UI/UX | MINOR | Gap values inconsistent across lists and stacked elements | No | No | Queued |
| UX-021 | UI/UX | MINOR | Status and severity badges styled differently across components | No | Yes (UX-003) | Dependency |
| UX-022 | UI/UX | MINOR | No success message after review submission; user cannot confirm | No | No | Queued |
| UX-023 | UI/UX | MINOR | Form inputs lack proper htmlFor and id label associations | No | No | Queued |
| UX-024 | UI/UX | MINOR | Only one responsive breakpoint; no hamburger nav for mobile | No | No | Queued |
| UX-025 | UI/UX | MINOR | Pagination controls rendered even when transcript list is empty | No | No | Queued |
| UX-026 | UI/UX | MINOR | "browse" span not keyboard-focusable; inconsistent link spacing | No | No | Queued |
| UX-027 | UI/UX | MINOR | Icon-only and ambiguous buttons missing aria-label attributes | No | No | Queued |
| UX-028 | UI/UX | MINOR | Font sizes use fixed classes; not responsive across breakpoints | No | No | Queued |
| UX-029 | UI/UX | MINOR | Audit log page uses simple back arrow; no breadcrumb hierarchy | No | No | Queued |
| UX-030 | UI/UX | MINOR | "Saving…" text only; no spinner, no post-mutation feedback | No | No | Queued |
| DO-001 | DevOps | CRITICAL | No CI/CD pipeline; tests only run manually | No | Yes (FE-012) | Queued |
| DO-002 | DevOps | CRITICAL | No deployment strategy, documentation, or automation | No | No | Queued |
| DO-003 | DevOps | CRITICAL | Application not containerized; no Dockerfiles or docker-compose | No | No | Queued |
| DO-004 | DevOps | MAJOR | Real Gemini API key present in .env file on disk | No | Yes (BE-020) | Queued |
| DO-005 | DevOps | MAJOR | App does not validate required env vars at startup | No | Yes (BE-001) | Queued |
| DO-006 | DevOps | MAJOR | Frontend missing .env.example; VITE_API_BASE_URL undiscoverable | No | No | Queued |
| DO-007 | DevOps | MAJOR | Backend pins ==; frontend uses ^ caret; inconsistent strategy | No | No | Queued |
| DO-008 | DevOps | MAJOR | No Python lock file; transitive dependencies can drift between envs | No | No | Queued |
| DO-009 | DevOps | MINOR | No Dependabot or automated dependency vulnerability scanning | No | No | Dependency |
| DO-010 | DevOps | CRITICAL | No centralized logging; log_level config setting unused | No | Yes (BE-018, SEC-019) | Queued |
| DO-011 | DevOps | CRITICAL | No error tracking; failed background tasks fail silently | No | Yes (BE-018) | Queued |
| DO-012 | DevOps | MAJOR | No application instrumentation; no metrics or SLO definitions | No | No | Dependency |
| DO-013 | DevOps | CRITICAL | SQLite single-file DB with no backup strategy or disaster recovery | No | No | Queued |
| DO-014 | DevOps | MAJOR | Deprecated on_event pattern; no graceful shutdown handling | No | Yes (BE-002) | Queued |
| DO-015 | DevOps | MAJOR | No connection pool configuration; scaling blocker for production | No | Yes (BE-023, DB-005) | Queued |
| DO-016 | DevOps | MAJOR | No rate limiting; upload and processing endpoints can be flooded | No | Yes (SEC-009) | Queued |
| DO-017 | DevOps | MINOR | No CONTRIBUTING.md, DEVELOPMENT.md, or Architecture Decision Records | No | No | Queued |

---

## Section 2: Cross-Domain Dependency Map

```
# ── AUTHENTICATION CLUSTER ──────────────────────────────────────────────────

Finding BE-005 (Backend - Unvalidated header-based auth) → BLOCKS → Finding SEC-002 (Security - Client-controlled role header)
Finding BE-005 (Backend - Unvalidated header-based auth) → BLOCKS → Finding BE-014 (Backend - No fine-grained RBAC)
Finding BE-005 (Backend - Unvalidated header-based auth) → BLOCKS → Finding BE-015 (Backend - reviewer_id identity impersonation)
Finding BE-005 (Backend - Unvalidated header-based auth) → BLOCKS → Finding SEC-015 (Security - IDOR access to any transcript)
Finding SEC-001 (Security - No authentication on any endpoint) → RELATED TO → Finding BE-005 (Backend - Unvalidated header-based auth)
Finding SEC-002 (Security - Client-controlled role header) → DEPENDS ON → Finding BE-005 (Backend - Unvalidated header-based auth)
Finding BE-014 (Backend - No fine-grained RBAC) → DEPENDS ON → Finding BE-005 (Backend - Unvalidated header-based auth)
Finding BE-015 (Backend - reviewer_id identity impersonation) → DEPENDS ON → Finding BE-005 (Backend - Unvalidated header-based auth)
Finding SEC-015 (Security - IDOR transcript access) → DEPENDS ON → Finding SEC-001 (Security - No authentication)

# ── DATABASE MIGRATION CLUSTER ───────────────────────────────────────────────

Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-001 (Database - No indexes on FK columns)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-002 (Database - FK cascade missing on child tables)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-003 (Database - StaffReview missing FK constraint)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-006 (Database - Empty string allowed in NOT NULL fields)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-010 (Database - PII stored as plain text)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-012 (Database - FlaggingRule category field unindexed)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-013 (Database - No composite unique on transcript_id+rule_id)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-014 (Database - AccreditedProgram missing timestamps)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-016 (Database - StaffReview transcript_id unindexed)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-018 (Database - Transcript.status unconstrained String)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-019 (Database - Inconsistent String lengths)
Finding DB-011 (Database - Zero Alembic migration files) → BLOCKS → Finding DB-020 (Database - AuditLog.transcript_id nullable ambiguous)
Finding DB-001 (Database - No indexes) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-002 (Database - FK cascade missing) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-003 (Database - StaffReview missing FK) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-003 (Database - StaffReview missing FK) → RELATED TO → Finding DB-002 (Database - FK cascade missing)
Finding DB-006 (Database - Empty string in NOT NULL) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-010 (Database - PII plain text) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-012 (Database - FlaggingRule index) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-013 (Database - Composite unique constraint) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-014 (Database - AccreditedProgram timestamps) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-016 (Database - StaffReview index) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-018 (Database - Transcript.status unconstrained) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-019 (Database - String length constants) → DEPENDS ON → Finding DB-011 (Database - Migration framework)
Finding DB-020 (Database - AuditLog nullable transcript_id) → DEPENDS ON → Finding DB-011 (Database - Migration framework)

# ── TRANSACTION ATOMICITY CLUSTER ────────────────────────────────────────────

Finding BE-003 (Backend - Non-atomic file write and DB commit) → RELATED TO → Finding DB-007 (Database - ExtractionService multi-commit)
Finding DB-007 (Database - ExtractionService multi-commit) → RELATED TO → Finding DB-008 (Database - Verification audit outside transaction)
Finding DB-008 (Database - Verification audit outside transaction) → RELATED TO → Finding DB-009 (Database - submit_review three commit points)
Finding DB-009 (Database - submit_review three commits) → RELATED TO → Finding DB-007 (Database - ExtractionService multi-commit)

# ── LOGGING CLUSTER ──────────────────────────────────────────────────────────

Finding BE-018 (Backend - No structured logging) → RELATED TO → Finding DO-010 (DevOps - No centralized logging infrastructure)
Finding DO-010 (DevOps - No centralized logging) → RELATED TO → Finding SEC-019 (Security - Stack traces may expose sensitive data)
Finding DO-011 (DevOps - No error tracking / Sentry) → RELATED TO → Finding BE-018 (Backend - No structured logging)
Finding DO-011 (DevOps - No error tracking) → RELATED TO → Finding DO-010 (DevOps - No centralized logging)
Finding SEC-019 (Security - Logging config missing) → RELATED TO → Finding BE-018 (Backend - No structured logging)

# ── FILE VALIDATION CLUSTER ──────────────────────────────────────────────────

Finding BE-011 (Backend - No path traversal validation) → RELATED TO → Finding BE-012 (Backend - MIME type not cross-validated)
Finding BE-012 (Backend - MIME type validation weak) → RELATED TO → Finding SEC-013 (Security - Magic bytes bypass possible)
Finding BE-003 (Backend - Non-atomic file write) → RELATED TO → Finding DB-007 (Database - ExtractionService multi-commit)
Finding SEC-013 (Security - File validation bypass) → RELATED TO → Finding BE-012 (Backend - MIME type validation weak)

# ── RATE LIMITING CLUSTER ────────────────────────────────────────────────────

Finding SEC-009 (Security - No rate limiting on any endpoint) → BLOCKS → Finding SEC-020 (Security - No X-RateLimit response headers)
Finding SEC-020 (Security - No rate limit headers) → DEPENDS ON → Finding SEC-009 (Security - Rate limiter must exist first)
Finding DO-016 (DevOps - Upload endpoints can be flooded) → RELATED TO → Finding SEC-009 (Security - No rate limiting)
Finding SEC-009 (Security - No rate limiting) → RELATED TO → Finding DO-016 (DevOps - No rate limiting on endpoints)

# ── CONNECTION POOL CLUSTER ──────────────────────────────────────────────────

Finding DB-005 (Database - No connection pool config) → RELATED TO → Finding DO-015 (DevOps - No connection pool config)
Finding DO-015 (DevOps - No connection pool config) → RELATED TO → Finding BE-023 (Backend - No connection pool; SQLite unsuitable)
Finding BE-023 (Backend - No connection pool) → RELATED TO → Finding DB-005 (Database - No connection pool)

# ── SECRETS CLUSTER ──────────────────────────────────────────────────────────

Finding BE-020 (Backend - Real API key in .env) → RELATED TO → Finding DO-004 (DevOps - Real API key in .env)
Finding DO-004 (DevOps - Real API key in .env) → RELATED TO → Finding BE-020 (Backend - Real API key in .env)
Finding SEC-003 (Security - Health endpoint leaks API key status) → RELATED TO → Finding BE-020 (Backend - Real API key in .env)
Finding BE-001 (Backend - No startup env validation) → RELATED TO → Finding DO-005 (DevOps - No startup env var validation)
Finding DO-005 (DevOps - No startup env validation) → RELATED TO → Finding BE-001 (Backend - No startup env validation)

# ── PII ENCRYPTION CLUSTER ──────────────────────────────────────────────────

Finding DB-010 (Database - PII stored as plain text) → RELATED TO → Finding SEC-010 (Security - Student PII unencrypted in SQLite)
Finding SEC-010 (Security - PII unencrypted) → RELATED TO → Finding DB-010 (Database - PII stored as plain text)
Finding SEC-022 (Security - SQLite unencrypted at rest) → RELATED TO → Finding SEC-010 (Security - PII unencrypted)
Finding SEC-022 (Security - SQLite unencrypted at rest) → RELATED TO → Finding DB-010 (Database - PII stored as plain text)

# ── DESIGN SYSTEM CLUSTER ───────────────────────────────────────────────────

Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-001 (UI/UX - Nav hardcoded blue disconnected from tokens)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-003 (UI/UX - No reusable Button component)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-004 (UI/UX - Duplicated color palette)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-005 (UI/UX - Inconsistent spacing scale)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-007 (UI/UX - No reusable LoadingSpinner)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-008 (UI/UX - No unified ErrorAlert component)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-009 (UI/UX - No reusable EmptyState component)
Finding UX-002 (UI/UX - No Tailwind theme extensions) → BLOCKS → Finding UX-011 (UI/UX - Inconsistent input styling)
Finding UX-003 (UI/UX - No reusable Button component) → BLOCKS → Finding UX-007 (UI/UX - No reusable LoadingSpinner)
Finding UX-003 (UI/UX - No reusable Button component) → BLOCKS → Finding UX-008 (UI/UX - No unified ErrorAlert)
Finding UX-003 (UI/UX - No reusable Button component) → BLOCKS → Finding UX-009 (UI/UX - No reusable EmptyState)
Finding UX-003 (UI/UX - No reusable Button component) → BLOCKS → Finding UX-021 (UI/UX - Badge component inconsistent)
Finding UX-001 (UI/UX - Nav token disconnection) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-003 (UI/UX - No Button component) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-004 (UI/UX - Duplicated color palette) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-005 (UI/UX - Inconsistent spacing) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-007 (UI/UX - No LoadingSpinner) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-007 (UI/UX - No LoadingSpinner) → DEPENDS ON → Finding UX-003 (UI/UX - No Button component)
Finding UX-008 (UI/UX - No ErrorAlert) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-008 (UI/UX - No ErrorAlert) → DEPENDS ON → Finding UX-003 (UI/UX - No Button component)
Finding UX-009 (UI/UX - No EmptyState) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-009 (UI/UX - No EmptyState) → DEPENDS ON → Finding UX-003 (UI/UX - No Button component)
Finding UX-011 (UI/UX - Inconsistent input styling) → DEPENDS ON → Finding UX-002 (UI/UX - No Tailwind theme extensions)
Finding UX-021 (UI/UX - Badge component inconsistent) → DEPENDS ON → Finding UX-003 (UI/UX - No Button component)

# ── FRONTEND ARCHITECTURE CLUSTER ───────────────────────────────────────────

Finding FE-001 (Frontend - Unsafe as any cast in ProgramsPage) → RELATED TO → Finding FE-004 (Frontend - Form state lacks TypeScript interface)
Finding FE-004 (Frontend - Form state lacks interface) → DEPENDS ON → Finding FE-001 (Frontend - Type definitions needed first)
Finding FE-005 (Frontend - Inline mutation config in component) → RELATED TO → Finding FE-014 (Frontend - VerificationPage mixed concerns)
Finding FE-015 (Frontend - API functions inline in component) → RELATED TO → Finding FE-005 (Frontend - Inline mutation config)
Finding FE-014 (Frontend - VerificationPage mixed concerns) → RELATED TO → Finding FE-005 (Frontend - Inline mutation config)
Finding FE-013 (Frontend - No centralized error handling) → RELATED TO → Finding FE-002 (Frontend - Unsafe error type in catch)
Finding FE-013 (Frontend - No centralized error handling) → RELATED TO → Finding FE-003 (Frontend - Unsafe error type in mutation)
Finding FE-020 (Frontend - Duplicate color constants) → RELATED TO → Finding UX-004 (UI/UX - Duplicated color palette)
Finding FE-035 (Frontend - Color map no fallback) → RELATED TO → Finding FE-020 (Frontend - Duplicate color constants)

# ── CI/CD CLUSTER ───────────────────────────────────────────────────────────

Finding DO-001 (DevOps - No CI/CD pipeline) → BLOCKS → Finding DO-009 (DevOps - No Dependabot configured)
Finding DO-003 (DevOps - No containerization) → BLOCKS → Finding DO-012 (DevOps - No metrics or SLO definitions)
Finding DO-009 (DevOps - No Dependabot) → DEPENDS ON → Finding DO-001 (DevOps - CI/CD must exist first)
Finding DO-012 (DevOps - No metrics instrumentation) → DEPENDS ON → Finding DO-003 (DevOps - Containers needed for metrics pipeline)
Finding FE-012 (Frontend - Zero test coverage) → RELATED TO → Finding DO-001 (DevOps - No CI/CD to run tests)
Finding DO-001 (DevOps - No CI/CD pipeline) → RELATED TO → Finding FE-012 (Frontend - Zero test coverage)
Finding DO-002 (DevOps - No deployment strategy) → RELATED TO → Finding DO-003 (DevOps - No containerization)
Finding DO-003 (DevOps - No containerization) → RELATED TO → Finding DO-002 (DevOps - No deployment strategy)
Finding SEC-014 (Security - Outdated dependencies) → RELATED TO → Finding DO-009 (DevOps - No Dependabot)

# ── FASTAPI LIFESPAN CLUSTER ─────────────────────────────────────────────────

Finding BE-002 (Backend - Deprecated on_event startup) → RELATED TO → Finding DO-014 (DevOps - Deprecated on_event; no graceful shutdown)
Finding DO-014 (DevOps - Deprecated on_event pattern) → RELATED TO → Finding BE-002 (Backend - Deprecated on_event startup)

# ── EXPORT FORMAT CLUSTER ────────────────────────────────────────────────────

Finding BE-007 (Backend - Export format via regex string) → RELATED TO → Finding SEC-007 (Security - action_type unconstrained string)
Finding BE-008 (Backend - Unconstrained status/action_type params) → RELATED TO → Finding SEC-006 (Security - status param unconstrained)
Finding SEC-006 (Security - status param injection risk) → RELATED TO → Finding BE-008 (Backend - Unconstrained status param)

# ── BACKGROUND TASK CLUSTER ──────────────────────────────────────────────────

Finding BE-006 (Backend - No job ID or status endpoint for 202) → RELATED TO → Finding BE-022 (Backend - Background task session race condition)
Finding BE-022 (Backend - Background task session race) → RELATED TO → Finding DO-011 (DevOps - Failed background tasks fail silently)
Finding DO-011 (DevOps - No error tracking for background tasks) → RELATED TO → Finding BE-006 (Backend - No job status observability)

# ── CORS AND TRANSPORT CLUSTER ───────────────────────────────────────────────

Finding SEC-004 (Security - CORS missing allow_credentials) → RELATED TO → Finding SEC-005 (Security - CORS origins hardcoded to localhost)
Finding SEC-005 (Security - CORS origins hardcoded) → RELATED TO → Finding SEC-004 (Security - CORS missing allow_credentials)
Finding SEC-018 (Security - No security HTTP headers) → RELATED TO → Finding SEC-004 (Security - CORS misconfiguration)

# ── DATABASE BACKUP AND RECOVERY CLUSTER ────────────────────────────────────

Finding DO-013 (DevOps - No SQLite backup strategy) → RELATED TO → Finding SEC-022 (Security - SQLite unencrypted at rest)
Finding DO-013 (DevOps - No backup strategy) → RELATED TO → Finding DB-011 (Database - No migration version history)
Finding DB-011 (Database - No migration history) → RELATED TO → Finding DO-013 (DevOps - No backup/rollback strategy)

# ── SEEDING AND CONCURRENCY CLUSTER ─────────────────────────────────────────

Finding DB-023 (Database - Seeding race condition on parallel start) → RELATED TO → Finding DB-022 (Database - Programs hardcoded in Python)
Finding DB-004 (Database - find_by_name O(n) memory complexity) → RELATED TO → Finding DB-001 (Database - No indexes on queried fields)

# ── ACCESSIBILITY CLUSTER ────────────────────────────────────────────────────

Finding FE-008 (Frontend - Missing ARIA on FileDropzone) → RELATED TO → Finding UX-013 (UI/UX - No focus management or aria-live)
Finding FE-009 (Frontend - Status badge not semantic) → RELATED TO → Finding UX-019 (UI/UX - Decision buttons lack radio semantics)
Finding FE-010 (Frontend - Pagination missing aria-label) → RELATED TO → Finding UX-027 (UI/UX - Icon buttons missing aria-label)
Finding FE-011 (Frontend - Color-only decision differentiation) → RELATED TO → Finding UX-014 (UI/UX - Color combos fail WCAG AA contrast)
Finding UX-023 (UI/UX - Form inputs lack htmlFor associations) → RELATED TO → Finding FE-008 (Frontend - Missing ARIA labels)
Finding UX-026 (UI/UX - browse span not keyboard-focusable) → RELATED TO → Finding FE-008 (Frontend - Missing ARIA and keyboard nav)
```

---

## Section 3: Systemic Themes

The following themes were identified by cross-referencing all 153 findings across the six domain audit reports (Frontend, Backend, Database, Security, UI/UX, DevOps). Each theme represents a problem whose root cause is architectural or process-level, not isolated to a single file or developer error, and whose resolution therefore requires a single coordinated architectural decision rather than per-finding patches.

---

### Theme 1: Missing Authentication and Authorization Layer

**Findings:** BE-005, BE-014, BE-015, SEC-001, SEC-002, SEC-015

**Root Cause Hypothesis:** The entire authentication and authorization subsystem was deferred during PoC development. Because the application was built as an internal demonstration tool with no real users, the team substituted client-supplied HTTP headers (`X-Staff-ID`, `X-Staff-Role`) as a placeholder identity mechanism that was never replaced. The absence of a real token issuer meant that no JWT validation infrastructure was ever wired into the route layer, leaving every endpoint completely unauthenticated.

**Holistic Fix:** Introduce a single `verify_token` FastAPI dependency that decodes and validates a signed JWT on every protected route. The JWT payload carries `sub` (staff ID), `role`, and `exp`. A `require_permission(Permission.X)` decorator wraps `Depends(verify_token)` for fine-grained RBAC. Every `X-Staff-ID` and `X-Staff-Role` header reference is deleted from all route handlers atomically during this implementation. No other authorization mechanism is permitted.

---

### Theme 2: Hardcoded Configuration and Secrets Sprawl

**Findings:** BE-001, BE-020, DO-004, DO-005, FE-030, FE-026, DB-022, DB-025, SEC-005, SEC-012

**Root Cause Hypothesis:** PoC development favored fast iteration over configuration hygiene. Every value that needed to differ between environments, API keys, database URLs, CORS origins, timeout durations, seed data, was hardcoded directly into source files, config classes with insecure defaults, `.env` files containing real credentials, and Python seeding blocks. The absence of a startup validation contract meant these problems accumulated silently and invisibly.

**Holistic Fix:** Centralize all configuration in a single Pydantic `Settings` class with `Field(...)` (required, no default) for every secret and environment-specific value. A `field_validator` runs at process startup and raises `ValueError` immediately for any missing or placeholder value. A committed `.env.example` documents every required variable with safe placeholder values. Real secrets are injected at runtime via a secrets manager (GCP Secret Manager, AWS Secrets Manager, or CI/CD environment injection) and never stored on disk in any form. All hardcoded magic numbers in application code are replaced with named constants referencing `settings.*`.

---

### Theme 3: Absent Transaction Atomicity Across Multi-Step Database Operations

**Findings:** BE-003, DB-007, DB-008, DB-009

**Root Cause Hypothesis:** Service layer methods were written procedurally, one database operation at a time, without a transaction coordination pattern. Because each step (`update_status`, `save extracted_data`, `audit.log`, `update_status` again) was authored as a sequential independent call, each carries its own implicit commit boundary. No developer established a convention requiring multi-step mutations to share a single transaction scope, so partial failures leave the database in intermediate inconsistent states, for example, a transcript flagged as EXTRACTING with no extracted data record, or a review saved without the transcript status being advanced.

**Holistic Fix:** Adopt the Unit-of-Work pattern. Every service method that touches more than one table wraps all its repository calls inside `db.begin_nested()`. The outermost commit fires only after all subordinate operations succeed. On any exception, `db.rollback()` reverts the entire logical unit. Audit log writes that must survive a failed transaction are moved to an after-commit hook or a separate compensating write rather than being silently skipped.

---

### Theme 4: No Observability, Logging, Metrics, or Error Tracking

**Findings:** BE-018, DO-010, DO-011, DO-012, FE-032, SEC-019

**Root Cause Hypothesis:** Observability was treated as a post-MVP concern and never scheduled. The `log_level` configuration setting was defined but never wired to any logging framework. No one established a logging convention, so individual developers either used `print()` or omitted logging entirely. Background tasks fail silently with no exception capture, no alerting, and no audit trail. The frontend has no structured logging utility at all.

**Holistic Fix:** Create a `logging_config.py` module using `python-json-logger` that emits structured JSON to stdout. Every log entry includes `timestamp`, `level`, `service`, `correlation_id` (injected by request middleware), and `message`. `sentry_sdk.init()` is called in `main.py` startup and captures all unhandled exceptions and background task failures. Prometheus metrics (`prometheus-client`) are exposed on `/metrics` with counters and histograms for request duration, transcripts processed, LLM calls, and flags generated. The frontend gains a `src/utils/logger.ts` utility wrapping `console.*` that is silenced below `error` level in production builds. `console.log()` is prohibited outside the logger utility.

---

### Theme 5: Inconsistent Error Handling Across All Layers

**Findings:** FE-002, FE-003, FE-013, BE-009, BE-010, UX-008

**Root Cause Hypothesis:** No error contract was defined between the database layer, service layer, API layer, and frontend. Each layer invented its own error shape independently: Python services raise bare `Exception("message")`, route handlers return bare `HTTPException` with raw detail strings, Axios catch blocks use `catch (err: any)` with fragile optional chaining, and UI components render ad-hoc red divs with no retry path. Because the shapes are all different, no layer can reliably parse errors from layers below it.

**Holistic Fix:** Define and enforce a single error envelope end-to-end: `{ "success": false, "error": { "code": "SNAKE_CASE_ERROR_CODE", "message": "Human-readable description", "details": {} } }`. Backend services raise typed domain exceptions (`TranscriptNotFoundError`, `ExtractionFailedError`, `ReviewSubmissionError`, `UnauthorizedError`, `ForbiddenError`) defined in a central `exceptions.py`. A FastAPI global exception handler converts all domain exceptions to the envelope. Frontend Axios response interceptors receive the envelope and pass `error.code` and `error.message` to React Query's `onError` callbacks. A reusable `ErrorAlert` component renders `error.message` with an optional retry button. TypeScript never uses `catch (err: any)`, `axios.isAxiosError()` type guards are used exclusively.

---

### Theme 6: No Design System, Hardcoded Colors, Inconsistent Spacing, Duplicate Components

**Findings:** UX-001, UX-002, UX-003, UX-004, UX-005, FE-019, FE-020, FE-021

**Root Cause Hypothesis:** Tailwind CSS was adopted in ad-hoc mode from the beginning of the project. CSS custom properties defining a complete design token system (`--accent`, `--accent-bg`, spacing scales, typography scales) were authored in `index.css` but never wired into `tailwind.config.js`. As a result, every developer independently chose arbitrary Tailwind color classes (`bg-blue-600`, `text-gray-500`, `border-red-100`) rather than semantic tokens, leading to at least 7 different button implementations, duplicate color map objects defined in multiple files, and spacing values that vary from component to component with no coherent rationale.

**Holistic Fix:** Extend `tailwind.config.js` with a complete `theme.extend` block that maps every CSS custom property to a semantic Tailwind class name (e.g., `colors.accent: 'var(--accent)'`, `colors.accent-bg: 'var(--accent-bg)'`). Create a `src/components/ui/` library containing primitive components (`Button`, `Input`, `Select`, `Textarea`, `Badge`, `LoadingSpinner`, `ErrorAlert`, `EmptyState`) that own all styling decisions internally. Every page and feature component imports from `ui/` and never defines its own button or input styles. The `App.css` file containing legacy/unused styles is deleted.

---

### Theme 7: Missing Input Validation and Type Safety at Every Boundary

**Findings:** FE-001, FE-002, FE-003, BE-007, BE-008, BE-013, SEC-006, SEC-007, SEC-016, DB-018

**Root Cause Hypothesis:** The type system was never enforced end-to-end from the database schema through the API layer to the frontend. The database stores `Transcript.status` as an unconstrained `String(20)`, allowing any value to be persisted. The API accepts `status` and `action_type` as unconstrained `Optional[str]` query parameters. The service layer receives `decision: str` with no validation. The frontend uses `as any` casts to suppress TypeScript errors rather than defining correct types. No single source of truth for enumerated values (transcript statuses, review decisions, audit action types) was established that all layers could reference.

**Holistic Fix:** Define all enumerated values once in canonical locations: `SQLEnum(TranscriptStatus)` constraint at the database column level, `TranscriptStatus(str, Enum)` in a shared `enums.py` used by Pydantic validators at the API layer, and TypeScript `enum` or `as const` objects in `src/types/index.ts` that mirror the Python definitions. Pydantic automatically rejects invalid enum values with HTTP 422. `as any` casts are forbidden; TypeScript interfaces for all API request and response shapes are maintained in `types/index.ts` as the authoritative frontend type contract.

---

### Theme 8: Accessibility Deficit Across the Entire Frontend

**Findings:** FE-008, FE-009, FE-010, FE-011, UX-013, UX-014, UX-023, UX-026, UX-027

**Root Cause Hypothesis:** Accessibility requirements were not included in the original acceptance criteria for any feature. As a result, no developer added ARIA attributes, keyboard navigation, focus management, or semantic HTML markup during initial development. Interactive elements implemented as `<div>` or `<span>` instead of `<button>` cannot be reached by keyboard. Color-only differentiation of decision states is invisible to users with color blindness. Screen readers receive no semantic context from status badges, pagination controls, or form inputs.

**Holistic Fix:** Conduct a full accessibility audit pass as part of the Phase 3 implementation cycle. All `<div>`- and `<span>`-based interactive elements are replaced with semantic HTML elements or given `role`, `tabIndex`, and `onKeyDown` handlers. All form inputs receive matching `<label htmlFor="...">` associations. Status badges and decision buttons receive `role`, `aria-label`, and `aria-checked` attributes as appropriate. Color-only differentiation is supplemented with icons or text patterns. WCAG AA contrast ratios are verified for all foreground/background combinations. The `jest-axe` accessibility assertion library is added to the test suite and run against all `ui/` primitive components.

---

### Theme 9: No Automated Testing or CI/CD

**Findings:** FE-012, DO-001, DO-002, DO-003, DO-007, DO-008

**Root Cause Hypothesis:** Testing and deployment infrastructure was never set up. The PoC was built and run manually in a single developer environment. Because there was no CI pipeline to enforce standards, no test runner to provide a regression safety net, and no containerization to ensure environmental consistency, the codebase accumulated all the other systemic problems described in this section with no automated mechanism to detect regressions or block non-compliant code from being merged.

**Holistic Fix:** Create a GitHub Actions CI pipeline with five mandatory gates that block all PR merges on failure: lint (flake8 + ESLint + `tsc --noEmit`), test (`pytest --cov-fail-under=80` + `vitest --coverage`), build (Docker image build for both services), security (`safety check` + `npm audit --audit-level=high`), and migrate (`alembic upgrade head` against a test database). Backend is containerized with a multi-stage `Dockerfile` (python:3.11-slim). Frontend is containerized with a multi-stage `Dockerfile` (Node builder + nginx). A `docker-compose.yml` wires both services together. All Python dependencies are locked via pip-tools (`requirements.lock`); all frontend dependencies are installed in CI using `npm ci --frozen-lockfile`.

---

### Theme 10: PII and Sensitive Data Exposed at Rest

**Findings:** DB-010, SEC-010, SEC-008, SEC-022, BE-020, DO-004

**Root Cause Hypothesis:** The PoC was built without healthcare credential regulatory requirements (HIPAA, GDPR) in scope. Student PII, including names and the full text of transcripts, which may contain social security numbers, dates of birth, addresses, and other sensitive identifiers, is stored as plaintext in an unencrypted SQLite file. A real Google API key is stored in a `.env` file on disk. Audit logs capture raw metadata about processed content. No threat model was written that would have flagged these storage decisions as non-compliant before the system was built.

**Holistic Fix:** Implement field-level encryption for all PII columns in `ExtractedData` (`student_name`, `raw_text`) using `sqlalchemy-utils EncryptedType` backed by a Fernet key stored in the secrets manager, never in source or config files. Rotate the exposed Gemini API key immediately and move all secrets to runtime injection. Sanitize audit log entries to log events (action type, outcome, actor) rather than data content (text lengths, filenames, model names). For production, migrate from SQLite to PostgreSQL with `sslmode=require` to provide encryption in transit and at rest at the database engine level. All of these changes are implemented as Alembic migrations and validated in the CI `migrate` gate.

---

## Section 4: Architectural Decisions

The following ten decisions are binding constraints on all Phase 3 implementation work. Every agent, backend, frontend, database, security, UI/UX, DevOps, must read and comply with every decision before writing any code. Where a decision conflicts with existing code, the decision takes precedence and the existing code must be updated.

---

### Decision 1: Frontend State Management

**Decision:** React Query (TanStack Query) is the exclusive state management solution for all server-derived state (data fetched from the API). Zustand is the exclusive solution for UI-only client state (modal open/closed, sidebar collapsed, active filters not yet submitted). Redux is not used anywhere in the application. `useContext` is not used to distribute server state.

**Rationale:** The audit confirms React Query is already the primary data-fetching library (FE-006, FE-007 both reference `refetchInterval` in `useQuery` configuration) and the Zustand store already exists (FE-018 references `uiStore.ts`). Introducing Redux would require a disruptive full rewrite of all data-fetching logic for no measurable architectural benefit. The existing React Query + Zustand split correctly separates server synchronization concerns from local UI state concerns.

**Implications:** All FE agents must extract every `useQuery` and `useMutation` call from component bodies into dedicated custom hooks in `src/hooks/` (e.g., `useTranscriptList`, `useTranscriptDetail`, `usePrograms`, `useAddProgram`, `useSubmitReview`, `useAuditLog`). Polling logic for in-progress transcripts (FE-006, FE-007) must live entirely inside these hooks, not in component render functions. Components are responsible only for rendering data returned by hooks and dispatching user actions back through hook-exposed mutation functions.

**Constraints:** No `fetch()` or `axios` calls in component bodies. No prop-drilling of server-derived data more than one component level. No `useState` for data that originates from the API. No new state management libraries may be added.

---

### Decision 2: Component and Styling Architecture

**Decision:** Tailwind CSS is the exclusive styling mechanism. CSS custom properties defined in `index.css` serve as the design token layer. `tailwind.config.js` is extended to map all custom properties to semantic Tailwind class names (e.g., `colors.accent: 'var(--accent)'`). No CSS Modules. No styled-components. No Emotion. A `src/components/ui/` directory contains the canonical set of primitive UI components: `Button`, `Input`, `Select`, `Textarea`, `Badge`, `LoadingSpinner`, `ErrorAlert`, and `EmptyState`. All page and feature components import from `ui/` for these primitives.

**Rationale:** UX-001 and UX-002 confirm the CSS custom property token system and Tailwind are completely disconnected, with `tailwind.config.js` showing an empty `extend: {}`. UX-003 identifies at least 7 different button implementations. UX-004 and FE-020 show duplicate color map constants defined independently in multiple files. Centralizing all primitive component styling decisions in `ui/` eliminates all of these duplications in a single pass.

**Implications:** UX agents must create the complete `src/components/ui/` library before any page-level component work begins, because all other agents depend on these primitives. All existing inline button, input, and badge styles throughout the codebase must be replaced with imports from `ui/`. The `App.css` file (FE-021) is deleted entirely. Duplicate `STATUS_COLORS` and `SEVERITY_COLORS` objects are consolidated into `src/utils/colorMaps.ts` (FE-020) and referenced from the `Badge` component.

**Constraints:** No new `.css` files may be created except additions to `index.css`. No arbitrary Tailwind values using bracket notation (e.g., `w-[346px]`, `text-[13px]`). No inline `style={{}}` props on any element. No `@tailwind` directives outside `index.css`.

---

### Decision 3: Backend Layer Architecture

**Decision:** A strict four-layer architecture is enforced in the backend with no cross-layer imports permitted: (1) API Layer (`routers/`, `schemas/`) owns route definitions, request/response schemas, and FastAPI dependency injection, it imports only from the Service Layer; (2) Service Layer (`services/`) owns all business logic and orchestrates operations, it imports only from the Repository Layer and Infrastructure Layer; (3) Repository Layer (`repositories/`) owns all database query and persistence logic, it imports only SQLAlchemy models and the database session; (4) Infrastructure Layer (`infrastructure/`) owns all external service adapters (LLM, file system, email), it imports only from configuration. Each layer imports only the layer directly below it.

**Rationale:** BE-005, BE-014, and BE-015 show authentication and identity resolution logic placed directly in route handler bodies instead of dependency middleware. BE-006 and BE-017 show missing service abstractions. DB-007, DB-008, and DB-009 show service layer code making direct multi-step database commits without a repository mediation layer enforcing transaction discipline.

**Implications:** All authentication checks must be implemented as FastAPI `Depends()` middleware functions in the API Layer, never inside a route handler body. All SQLAlchemy ORM query construction must live in Repository classes. All calls to `LLMAdapter`, file system operations, and external services must go through Infrastructure Layer adapters. Service classes must not import FastAPI `Request` objects. Repository classes must not contain if/else business logic.

**Constraints:** Route handlers must not import SQLAlchemy model classes directly. Service classes must not import `fastapi.Request` or `fastapi.Response`. Repository classes must not import service classes. Infrastructure adapters must not import repository classes. Circular imports between any two layers are a build-time error.

---

### Decision 4: API Contract Standards

**Decision:** Every API response, success or failure, uses a unified JSON envelope. Success: `{ "success": true, "data": { ... } }`. Failure: `{ "success": false, "error": { "code": "SNAKE_CASE_ERROR_CODE", "message": "Human-readable description safe for display", "details": {} } }`. All routes are versioned under `/api/v1/`. HTTP status codes are assigned by meaning: 200 for success, 201 for resource creation, 202 for accepted async work, 401 for authentication failure, 403 for authorization failure, 404 for resource not found, 422 for Pydantic validation errors (automatic), 500 for unhandled server exceptions only. Error detail strings from internal exception messages are never included in production responses.

**Rationale:** SEC-021 identifies that `exc.detail` from HTTPException is returned verbatim, leaking internal implementation details to API consumers. FE-002 and FE-003 show frontend code using fragile optional chaining (`err?.response?.data?.error?.message`) that breaks when the shape is inconsistent. UX-008 shows four different error display implementations because no contract defines what shape errors will take.

**Implications:** Backend agents must wrap all existing response schemas in the success envelope using a Pydantic generic wrapper class (`SuccessResponse[T]`). Existing bare dict returns must be eliminated. Frontend agents must update all Axios response handling to unwrap `response.data.data` for success and `response.data.error` for failures. The `ErrorAlert` UI component consumes `error.message` from the standardized shape. In production (`settings.environment == "production"`), the global exception handler strips `details` from 500 responses.

**Constraints:** No endpoint may return a bare string, bare dict, or bare list as a top-level response body. No exception `.detail` or Python traceback text may appear in any response sent to a production client. No 200 response may be used to communicate a failure condition.

---

### Decision 5: Database Access Pattern

**Decision:** SQLAlchemy ORM with the repository pattern is the exclusive database access mechanism. All database queries are methods on Repository classes that inherit from `BaseRepository`. No raw SQL strings (`text(...)`) are permitted for business queries. No ORM query construction (`db.query(...)`, `db.execute(select(...))`) is permitted outside repository methods. All multi-step write operations use `db.begin_nested()` savepoints to guarantee atomicity. Alembic manages all schema changes; `Base.metadata.create_all()` is removed from all non-test code paths.

**Rationale:** DB-007, DB-008, and DB-009 collectively demonstrate that the three most critical write paths in the application (extraction, verification, review submission) each span multiple separate `db.commit()` calls with no shared transaction boundary, leaving the database in inconsistent states on partial failure. DB-011 shows that `migrations/versions/` is empty despite Alembic being configured, all schema state is managed by `create_all()`, providing no version history and no rollback capability. DB-004 shows an O(n) query built in application code that must be pushed to the SQL layer.

**Implications:** DB agents must run `alembic revision --autogenerate -m "initial schema"` to capture the current schema into version control and must provide `downgrade()` implementations for every revision. All new queries introduced during Phase 3 must be added as named methods on the appropriate Repository class. Service agents wrapping multi-step mutations must call `db.begin_nested()` before the first repository call and `db.commit()` only after all calls succeed. The `init_db()` function must call `alembic upgrade head` rather than `create_all()`.

**Constraints:** `Base.metadata.create_all()` is prohibited in any code path that executes in non-test environments. `session.execute(text("..."))` is prohibited for any business query. ORM `db.query()` or `select()` calls outside of a Repository class method are a code review blocking issue. No migration file may be committed without a `downgrade()` function.

---

### Decision 6: Authentication and Session Architecture

**Decision:** JWT-based stateless authentication using `python-jose` is the authentication mechanism. Tokens are issued by a `/api/v1/auth/login` endpoint (stub returning a signed token in Phase 3). Every protected route includes `Depends(verify_token)` in its function signature. The JWT payload carries exactly: `{ "sub": "<staff_id>", "role": "<staff_role>", "exp": <unix_timestamp> }`. Permitted roles are `admin`, `reviewer`, and `viewer`. Role-based access control is implemented as a `require_permission(Permission.X)` callable that wraps `Depends(verify_token)`. Client-supplied identity headers (`X-Staff-ID`, `X-Staff-Role`) are deleted from all route handlers and are never used for authorization decisions.

**Rationale:** BE-005, SEC-001, SEC-002, BE-014, BE-015, and SEC-015 all trace to a single root cause: the complete absence of a real authentication mechanism. SEC-002 demonstrates that the current header-based scheme is trivially bypassed, any HTTP client can set `X-Staff-Role: admin` to gain administrative access. BE-015 shows that `reviewer_id` is taken from a client-supplied body field as a fallback, enabling reviewer identity spoofing. SEC-015 notes that IDOR on transcript URLs is only possible because no authentication exists to enforce ownership.

**Implications:** Backend agents must add `verify_token` as a dependency to every route currently missing it and must delete all `X-Staff-ID` / `X-Staff-Role` header reads. Frontend agents must store the JWT (in an httpOnly cookie for security, or localStorage as a fallback) and include it as an `Authorization: Bearer <token>` header on every API request via the Axios request interceptor. The Axios response interceptor must handle 401 responses by clearing the stored token and redirecting to the login page. JWT secret must be read from `settings.jwt_secret`.

**Constraints:** `request.headers.get("X-Staff-Role")` and `request.headers.get("X-Staff-ID")` are prohibited in all authorization code paths. JWT tokens must never be stored in `sessionStorage`. The JWT secret value must never appear in source code, it must always be read from `settings.jwt_secret`, which is itself sourced from an environment variable with no default value. Token expiry must be enforced server-side via the `exp` claim; expired tokens must be rejected with HTTP 401.

---

### Decision 7: Error Handling Strategy, Full Stack

**Decision:** Errors flow unidirectionally through the following chain: database exception → Repository raises a typed domain exception → Service catches and re-raises with `raise DomainError(...) from exc` to preserve the traceback chain → FastAPI global exception handler on the API Layer converts the domain exception to the standardized JSON envelope → Axios response interceptor on the frontend receives the envelope → React Query `onError` callback updates component state → `ErrorAlert` UI component renders `error.message` to the user. The canonical domain exceptions, defined in `exceptions.py`, are: `TranscriptNotFoundError`, `ExtractionFailedError`, `VerificationFailedError`, `ReviewSubmissionError`, `UnauthorizedError`, and `ForbiddenError`. All exceptions include a machine-readable `code` string and a human-readable `message` string.

**Rationale:** FE-002, FE-003, and FE-013 show the frontend using `catch (err: any)` with fragile optional chaining that breaks on any shape change and provides no type safety. BE-009 shows the backend retry logic catching all exceptions with a bare `except Exception` clause, retrying unrecoverable auth failures. BE-010 shows exception re-raises that drop the original traceback. UX-008 identifies four different inconsistent error display implementations with no retry mechanism. The root cause across all findings is the absence of a defined error contract between layers.

**Implications:** Backend agents must replace every bare `raise HTTPException(...)` call in service and repository code with an appropriate typed domain exception from `exceptions.py`. The global exception handler in `main.py` is the only place HTTPExceptions are constructed from domain exceptions. Frontend agents must implement the Axios response interceptor that normalizes all error responses to the envelope shape before they reach React Query. UX agents must build the `ErrorAlert` component accepting `error: { code: string; message: string }` and `onRetry?: () => void` props.

**Constraints:** `raise Exception("message")` is prohibited in service and repository code, always raise a typed domain exception. `catch (err: any)` is prohibited in TypeScript, use `axios.isAxiosError(err)` type guards or `err instanceof DomainError` checks. Domain exceptions must never be caught and swallowed silently, they must always propagate to the global handler or be re-raised. `console.error(err)` without structured logging is prohibited in production code paths.

---

### Decision 8: Logging and Observability Standards

**Decision:** The backend uses `python-json-logger` writing structured JSON to stdout. Every log entry must include: `timestamp` (ISO 8601), `level`, `service` (module name via `__name__`), `correlation_id` (a UUID injected by request middleware into the request context), and `message`. Sentry SDK (`sentry-sdk`) is initialized in `main.py` using `settings.sentry_dsn` and captures all unhandled exceptions and all background task failures. Prometheus metrics are exposed on a `/metrics` endpoint using `prometheus-client` with the following required metrics: `request_duration_seconds` (histogram, labeled by method and route), `transcripts_processed_total` (counter), `llm_calls_total` (counter, labeled by outcome), `flags_generated_total` (counter). The frontend uses a `src/utils/logger.ts` structured logger that writes to `console.*` in development and is silenced below `error` level in production builds. `console.log()` is prohibited outside the logger utility in any file.

**Rationale:** BE-018 confirms that `log_level: str = "INFO"` is defined in `config.py` but the `logging` module is never imported or configured anywhere in `main.py` or any service. DO-010 and DO-011 confirm there is no centralized logging infrastructure and no error monitoring, background task failures in `_run_pipeline()` fail silently with zero visibility. DO-012 confirms there are no performance metrics. FE-032 confirms the frontend has no logging utility. SEC-019 identifies that default Python logging in production could expose sensitive stack traces.

**Implications:** All service classes must obtain a logger via `logger = logging.getLogger(__name__)`, `print()` is prohibited in all service, repository, and infrastructure code. All background task exception handlers must call `sentry_sdk.capture_exception()` before re-raising or swallowing. DevOps agents must configure the `prometheus-client` metrics endpoint and write the `metrics.py` module. The correlation ID middleware must be registered before all route handlers in `main.py`.

**Constraints:** Log entries must never include raw PII, student names, transcript text, SSNs, email addresses, or any field that could identify an individual student. Free-text fields written to logs must be truncated to 200 characters maximum. `print()` is prohibited in all backend production code paths, violations are caught by the `flake8` lint gate. Frontend `console.log()` calls outside `logger.ts` are caught by the ESLint `no-console` rule configured in the lint gate.

---

### Decision 9: Testing Strategy

**Decision:** The following test categories are in scope for Phase 3. Unit tests cover all service layer business logic (pytest with `unittest.mock` for repository dependencies) and all frontend custom hooks (Vitest with React Testing Library). Repository query methods are tested with pytest against an in-memory SQLite database. All `ui/` primitive components are tested for accessibility using `jest-axe` assertions. Integration tests cover all API routes using pytest with `httpx.AsyncClient` and a real SQLite test database, each route must have at minimum one happy-path test and one error-path test. The minimum acceptable line coverage is 80% for both backend (enforced by `pytest --cov-fail-under=80`) and frontend (enforced by `vitest --coverage`). End-to-end (E2E / Playwright / Cypress) testing is explicitly out of scope for Phase 3 and is deferred to the backlog.

**Rationale:** FE-012 confirms zero test files exist anywhere in the frontend codebase. DO-001 confirms no CI pipeline exists to run any tests. Without a test suite, every systemic fix applied during Phase 3 carries regression risk with no automated verification. The 80% coverage threshold is chosen to enforce meaningful test coverage without mandating 100% coverage of trivial boilerplate code.

**Implications:** Every new function and every new component shipped during Phase 3 must include corresponding tests before the implementing agent's work is considered complete. Backend agents must not mock SQLAlchemy sessions in service layer tests, they must use real in-memory database fixtures so that query correctness is validated. Frontend agents must not use `shallow` rendering, tests must render components fully with React Testing Library to validate accessible DOM output.

**Constraints:** No mocking of the SQLAlchemy `Session` object in service tests, use a real in-memory SQLite session. E2E testing infrastructure (Playwright, Cypress, Selenium) must not be installed or configured during Phase 3, any such addition will be reverted. Test files must be co-located with the source file they test (`MyComponent.test.tsx` next to `MyComponent.tsx`, `test_my_service.py` next to `my_service.py`). No test may call external APIs, write to a non-test database, or perform filesystem writes outside a temporary directory fixture.

---

### Decision 10: CI/CD Pipeline Gates

**Decision:** A GitHub Actions pipeline defined in `.github/workflows/ci.yml` enforces five mandatory gates. All five gates must pass for any pull request to be mergeable to `main`. The gates are: (1) `lint`, `flake8` on the backend, `eslint --max-warnings 0` and `tsc --noEmit` on the frontend; (2) `test`, `pytest --cov-fail-under=80` on the backend, `vitest run --coverage` on the frontend; (3) `build`, `docker build` for both the backend and frontend images; (4) `security`, `safety check` on Python dependencies, `npm audit --audit-level=high` on frontend dependencies; (5) `migrate`, `alembic upgrade head` executed against a fresh SQLite test database to validate all migration files are syntactically valid and execute without error. Merging to `main` triggers an automatic staging deployment via `docker-compose up`. Production deployment requires a manual approval gate in the GitHub Actions workflow before execution.

**Rationale:** DO-001 confirms no CI/CD infrastructure of any kind exists. DO-007 and DO-008 show inconsistent dependency locking between frontend (`^` caret ranges in `package.json`) and backend (pinned `==` in `requirements.txt`), creating reproducibility risk. DB-011 shows that Alembic is configured but has never been used, running migrations in CI ensures every migration is validated before it reaches a real database. All other systemic themes identified in Section 3 ultimately require CI enforcement to prevent regression.

**Implications:** DevOps agents must author `.github/workflows/ci.yml` as the first deliverable of Phase 3, before any other agent begins work, so that subsequent contributions are immediately gated. All agents must ensure their code contributions pass the `lint` and `test` gates locally before opening a pull request. The `migrate` gate implicitly requires that every schema change during Phase 3 is accompanied by an Alembic migration file in the same commit.

**Constraints:** `npm install` must never be used in CI, always `npm ci --frozen-lockfile` to ensure the lockfile is respected. No pull request may be merged with any failing gate, the branch protection rule must be configured to enforce this at the repository level. `alembic upgrade head` must be run before any application deployment in any environment, the deployment script must enforce this ordering. No agent may introduce a skip (`# noqa`, `// eslint-disable`, `--no-verify`) to a lint rule without an accompanying comment explaining the exception and approval from a second reviewer.

---

## Section 5: Phased Implementation Plan

> **Scope:** All 153 findings from the Phase 1 Audit Report are assigned to exactly one phase below.
> No phase begins until every item in the preceding phase is complete and verified.
> Dependency constraints are enforced: no task may be started if a finding it depends on belongs to the same or an earlier phase and is not yet resolved.

---

## Phase A, Foundation (CRITICAL Findings + Prerequisites)

> Nothing else starts until Phase A is complete.
> This phase contains ALL 27 CRITICAL findings plus MAJOR findings that are structural prerequisites for everything else.

---

#### A-01: JWT Authentication Foundation
- **Finding IDs:** SEC-001, BE-005
- **Owning Agent:** Security
- **Complexity:** XL
- **Blocked By:** None
- **Definition of Done:**
  - All API routes under `/api/v1/` require an `Authorization: Bearer <token>` header; requests missing or supplying an invalid token receive HTTP 401 with the standard error envelope.
  - A `verify_token(token: HTTPAuthorizationCredentials)` FastAPI dependency decodes the JWT using `settings.jwt_secret` and returns the decoded payload dict; it raises `HTTPException(401)` on any decode failure.
  - A stub `POST /api/v1/auth/login` endpoint accepts `{staff_id, password}` and returns `{token, expires_at}`.
  - No route reads `X-Staff-Role` or `X-Staff-ID` headers for identity or authorization.

---

#### A-02: RBAC and Permission System
- **Finding IDs:** SEC-002, BE-014, BE-015
- **Owning Agent:** Security
- **Complexity:** L
- **Blocked By:** A-01
- **Definition of Done:**
  - `Permission` enum defined with values: `MANAGE_PROGRAMS`, `SUBMIT_REVIEW`, `VIEW_TRANSCRIPTS`, `EXPORT_AUDIT`.
  - `ROLE_PERMISSIONS` dict maps `admin`, `reviewer`, and `viewer` roles to their respective permission sets.
  - `require_permission(Permission.X)` dependency applied to all relevant routes; routes return HTTP 403 when caller lacks the required permission.
  - `reviewer_id` in `ReviewService` is extracted exclusively from the JWT payload; `body.reviewer_id` is ignored.

---

#### A-03: Secrets Management and API Key Rotation
- **Finding IDs:** BE-020, DO-004, SEC-003
- **Owning Agent:** Security
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - The real Gemini API key is rotated in Google Cloud Console immediately after this task begins.
  - `backend/.env` contains only placeholder values (e.g., `GEMINI_API_KEY=your_key_here`); the real key is injected via environment only.
  - `backend/.env.example` is created listing every required variable with a one-line description of each.
  - The `GET /api/v1/health` endpoint no longer exposes whether `llm_api_key` is present or absent; that field is removed from the public response body.
  - `README.md` documents the API-key rotation procedure.

---

#### A-04: Path Traversal Prevention
- **Finding IDs:** BE-011
- **Owning Agent:** Security
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `document_extractor.py` resolves the incoming `file_path` to an absolute path and calls `.relative_to(upload_dir.resolve())`; any path outside `upload_dir` raises `ExtractionFailedError` with code `PATH_TRAVERSAL_DETECTED`.
  - A unit test verifies that a traversal attempt (e.g., `../../etc/passwd`) is rejected with `ExtractionFailedError`.
  - No other code path in the extractor opens a file without first performing this check.

---

#### A-05: Migration Framework Setup
- **Finding IDs:** DB-011
- **Owning Agent:** Database
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - `migrations/versions/` contains at least one Alembic migration file capturing the initial schema.
  - `database.py` `init_db()` calls `alembic upgrade head` instead of `Base.metadata.create_all()`.
  - `alembic downgrade -1` executes cleanly against a test database without error.
  - `alembic.ini` reads `DATABASE_URL` from the environment variable (not a hardcoded connection string).

---

#### A-06: Database Schema Integrity
- **Finding IDs:** DB-001, DB-002, DB-003, DB-006, DB-012, DB-013, DB-014, DB-016, DB-018
- **Owning Agent:** Database
- **Complexity:** L
- **Blocked By:** A-05
- **Definition of Done:**
  - All ORM models define `__table_args__` containing explicit `Index()` declarations for every foreign key and commonly-queried field (per DB-001, DB-012, DB-016 specifications).
  - `StaffReview.transcript_id` is defined as `ForeignKey("transcripts.id", ondelete="CASCADE")` (DB-003); all other child-table FKs to `transcripts.id` include `ondelete="CASCADE"` (DB-002); `flagging_rules.id` FK uses `ondelete="RESTRICT"`.
  - `Transcript.status` column uses `SQLEnum(TranscriptStatus)` (DB-018).
  - `AuditLog` critical fields (`actor_id`, `action_type`, `outcome`, `action_detail`) each have a `CHECK` constraint preventing empty strings (DB-006).
  - `VerificationFlag` has `UniqueConstraint('transcript_id', 'rule_id', name='uq_vflag_transcript_rule')` (DB-013).
  - `AccreditedProgram` has `created_at` and `updated_at` `DateTime` columns (DB-014).
  - All changes are captured in a working Alembic migration file with a functional `downgrade()`.

---

#### A-07: Transaction Atomicity
- **Finding IDs:** DB-007, DB-008, DB-009, BE-003
- **Owning Agent:** Database
- **Complexity:** L
- **Blocked By:** A-05
- **Definition of Done:**
  - `ExtractionService.process()` wraps all three DB mutations (status update, extracted-data save, audit log) in a single `db.begin_nested()` block; on any exception the block is rolled back and status reverted.
  - `VerificationService` audit log is created inside the transaction before `db.commit()` (DB-008).
  - `ReviewService.submit_review()` wraps review creation and transcript status update in one atomic `db.begin_nested()` (DB-009).
  - `transcript_service.py` calls `os.remove(file_path)` inside the `except` handler if the DB commit fails after the file is written (BE-003).
  - Unit tests verify that a simulated mid-pipeline failure leaves no orphaned records in any child table.

---

#### A-08: PII Field Encryption
- **Finding IDs:** DB-010, SEC-010
- **Owning Agent:** Database
- **Complexity:** L
- **Blocked By:** A-05
- **Definition of Done:**
  - `ExtractedData.student_name` and `ExtractedData.raw_text` use `sqlalchemy-utils` `EncryptedType` with `AES256` and the `ENCRYPTION_KEY` environment variable.
  - `Settings` defines `ENCRYPTION_KEY` as a required field with `min_length=32` validation; application fails to start if it is absent or too short.
  - An Alembic migration alters both column types.
  - A documented migration path (script or README section) covers encrypting any pre-existing plaintext rows.

---

#### A-09: Database Query Performance
- **Finding IDs:** DB-004, DB-005, BE-023, DO-015
- **Owning Agent:** Database
- **Complexity:** M
- **Blocked By:** A-05
- **Definition of Done:**
  - `ProgramRepository.find_by_name()` uses a SQL `WHERE` clause with `func.lower().contains()`, no Python-side iteration over a full table scan.
  - `database.py` configures `NullPool` for SQLite and `QueuePool(pool_size=10, max_overflow=20, pool_recycle=3600, pool_pre_ping=True)` for PostgreSQL, selected at runtime by inspecting `DATABASE_URL`.
  - `Settings` exposes `database_pool_size: int` and `database_max_overflow: int` fields consumed by the engine factory.

---

#### A-10: Backend Startup Validation
- **Finding IDs:** BE-001, DO-005
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `Settings.gemini_api_key` has a `field_validator` that rejects an empty string or any value shorter than 10 characters.
  - Application raises `ValueError` at startup (before accepting any requests) when any required environment variable is missing; the error message names the missing variable.
  - The health-check endpoint confirms the key is present and non-empty without revealing its value.

---

#### A-11: Structured Logging Infrastructure
- **Finding IDs:** BE-018, DO-010, SEC-019
- **Owning Agent:** Backend
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - `logging_config.py` configures `python-json-logger` with a `RotatingFileHandler`; every log record includes `timestamp`, `level`, `service`, `correlation_id`, and `message` fields.
  - HTTP middleware generates a UUID `correlation_id` per request, attaches it to `request.state`, and echoes it in the response headers as `X-Correlation-ID`.
  - `settings.log_level` is consumed by the logging configuration.
  - A `SensitiveDataFilter` redacts `api_key`, `token`, and `password` fields from all log records.
  - No `print()` statements or bare `console.log()` calls remain in backend source files.

---

#### A-12: Error Monitoring with Sentry
- **Finding IDs:** DO-011
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `sentry-sdk` is installed and listed in dependencies.
  - `sentry_sdk.init()` is called in `main.py` using `settings.sentry_dsn`; if `sentry_dsn` is empty the call is skipped gracefully.
  - `_run_pipeline()` background task is wrapped in `try/except` calling `sentry_sdk.capture_exception(e)` on failure.
  - A global unhandled exception handler in `main.py` captures all HTTP 500 errors and sends them to Sentry.
  - Verification test: deliberately raising an exception inside the background task produces a Sentry event.

---

#### A-13: Docker Containerization
- **Finding IDs:** DO-003
- **Owning Agent:** DevOps
- **Complexity:** L
- **Blocked By:** None
- **Definition of Done:**
  - `backend/Dockerfile` uses a `python:3.11-slim` multi-stage build (build stage installs deps; runtime stage copies only the app).
  - `frontend/Dockerfile` uses a `node:20-alpine` builder stage producing a static build, served by an `nginx:alpine` runtime stage on port 80.
  - `docker-compose.yml` wires frontend (port 3000) and backend (port 8000) with dev volume mounts.
  - `.dockerignore` excludes `node_modules`, `.venv`, `__pycache__`, `.env`, and `data/`.
  - `docker-compose up --build` starts both services successfully with no errors.

---

#### A-14: CI/CD Pipeline
- **Finding IDs:** DO-001
- **Owning Agent:** DevOps
- **Complexity:** L
- **Blocked By:** A-13
- **Definition of Done:**
  - `.github/workflows/ci.yml` triggers on every PR and `main` branch push.
  - Pipeline gates (all must pass for merge): (1) `flake8` + ESLint + `tsc --noEmit`; (2) `pytest --cov-fail-under=80`; (3) `vitest --coverage`; (4) Docker build succeeds for both services; (5) `safety check` + `npm audit --audit-level=high`; (6) `alembic upgrade head` against a test database.
  - PRs are blocked from merging if any gate fails.

---

#### A-15: Database Backup Strategy
- **Finding IDs:** DO-013
- **Owning Agent:** DevOps
- **Complexity:** M
- **Blocked By:** A-05
- **Definition of Done:**
  - An APScheduler job runs every 6 hours copying `msbon.db` to `data/backups/msbon_YYYYMMDD_HHMMSS.db`.
  - A maximum of 7 backup files are retained; the oldest is deleted when the limit is exceeded.
  - Backup success and failure events are emitted through the structured logging infrastructure (A-11).
  - `README.md` documents the restore procedure.
  - Note: PostgreSQL PITR is marked **Deferred** pending the infrastructure decision in Phase D.

---

#### A-16: Frontend Critical Type Safety
- **Finding IDs:** FE-001
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - A `ProgramForm` interface is defined in `src/types/index.ts` with all 6 fields correctly typed.
  - `ProgramsPage.tsx` uses `ProgramForm` as the type for its form state variable.
  - The `as any` cast on the `addProgram()` call is removed.
  - `tsc --noEmit` reports 0 errors in `ProgramsPage.tsx`.

---

#### A-17: Design Token System
- **Finding IDs:** UX-001, UX-002
- **Owning Agent:** UI/UX
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - `tailwind.config.js` `theme.extend` maps every CSS custom property from `index.css` (`--accent`, `--accent-bg`, `--surface`, etc.) to semantic Tailwind class names (`accent`, `accent-bg`, `surface`, etc.).
  - `App.tsx` navigation uses semantic token classes exclusively; no raw `blue-600` references remain in nav code.
  - `index.css` defines `@apply` utilities for common patterns (e.g., `.btn-primary`, `.surface-card`).
  - `docs/DESIGN_TOKENS.md` documents every token, its CSS variable source, its Tailwind alias, and an example usage.

---

## Phase B, Architecture (MAJOR Structural Refactoring)

> All Phase A items must be verified complete before Phase B begins.
> Items within Phase B may be executed in any order that respects the dependency graph shown.

---

### Backend Architecture

---

#### B-BE-01: FastAPI Lifespan Migration
- **Finding IDs:** BE-002, DO-014
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** A-10
- **Definition of Done:**
  - `@app.on_event("startup")` and `@app.on_event("shutdown")` are replaced with a single `@asynccontextmanager async def lifespan(app: FastAPI)` function passed as `lifespan=lifespan` to `FastAPI(...)`.
  - Shutdown handling flushes logs and drains any in-flight background tasks.
  - Application starts cleanly with no deprecation warnings from FastAPI.

---

#### B-BE-02: Background Job Tracking
- **Finding IDs:** BE-006
- **Owning Agent:** Backend
- **Complexity:** M
- **Blocked By:** A-05, A-07
- **Definition of Done:**
  - A `ProcessingJob` ORM table exists with columns: `id` (UUID PK), `transcript_id` (FK), `status` (enum: QUEUED / RUNNING / COMPLETE / FAILED), `error_message` (nullable Text), `created_at`, `updated_at`.
  - `POST /api/v1/transcripts/{id}/process` returns HTTP 202 with `{"job_id": "<uuid>"}` instead of an empty body.
  - `GET /api/v1/jobs/{job_id}/status` returns the current job status and `error_message` if failed.
  - `_run_pipeline()` updates `ProcessingJob.status` and `error_message` on both success and failure.

---

#### B-BE-03: LLM Retry Logic Improvement
- **Finding IDs:** BE-009
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `llm_adapter.py` distinguishes transient errors (HTTP 503, 429, timeout) from permanent errors (HTTP 401, parse failures).
  - Permanent errors cause an immediate failure with no retries.
  - Transient errors are retried with exponential backoff (2 s / 4 s / 8 s); maximum 3 retries.
  - Unit tests cover both the fast-fail path (401) and the retry-then-succeed path (503 → success).

---

#### B-BE-04: Rule Registry Refactor
- **Finding IDs:** BE-017
- **Owning Agent:** Backend
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - A `RuleRegistry` class is implemented with a `@RuleRegistry.register("RULE-ID")` class decorator.
  - Each rule class is decorated individually; the 18-branch `if-elif` chain in `_build_rule()` is replaced by a single `RuleRegistry.lookup(rule_orm.id)` call.
  - Adding a new rule requires only creating a new class with the decorator, no modifications to `rule_engine.py` core logic.
  - Existing rules and their behavior are covered by passing tests.

---

#### B-BE-05: Background Task Session Isolation
- **Finding IDs:** BE-022
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** A-07
- **Definition of Done:**
  - `_run_pipeline()` accepts only primitive IDs (e.g., `transcript_id: str`), no ORM objects or request-scope sessions.
  - A fresh `SessionLocal()` is opened as a context manager inside the task body.
  - No shared mutable state from the request scope is accessible within the background task.

---

#### B-BE-06: File MIME Double-Extension Validation
- **Finding IDs:** BE-012, SEC-013
- **Owning Agent:** Backend
- **Complexity:** M
- **Blocked By:** A-04
- **Definition of Done:**
  - `transcript_service.py` validates uploaded files using magic-byte MIME detection AND a secondary `pdfplumber` open-and-page-count check.
  - The file extension must match the detected MIME type; a mismatch raises a 422 error.
  - Files where `pdfplumber` fails to open (malformed or non-PDF content with PDF magic bytes) are rejected.
  - A maximum extracted-text size cap is enforced (configurable via `Settings`).

---

#### B-BE-07: Export Format and Status Enums
- **Finding IDs:** BE-007, BE-008
- **Owning Agent:** Backend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - `ExportFormat(str, Enum)` with values `JSON = "json"` and `CSV = "csv"` is defined and used in the `GET /api/v1/audit/export` route signature.
  - `TranscriptStatus` enum is used for the `status` query parameter in transcript list routes.
  - Non-enum values submitted by clients are automatically rejected with HTTP 422.

---

### Security Architecture

---

#### B-SEC-01: CORS Configuration
- **Finding IDs:** SEC-004, SEC-005
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** A-01
- **Definition of Done:**
  - `CORSMiddleware` is configured with `allow_credentials=True`.
  - `allow_origins` is populated exclusively from the `CORS_ORIGINS` environment variable; the application fails to start if this variable is absent or empty.
  - `allow_headers` is restricted to the headers actually required by the API.

---

#### B-SEC-02: API Input Enum Validation
- **Finding IDs:** SEC-006, SEC-007, BE-013
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** B-BE-07
- **Definition of Done:**
  - `TranscriptStatus` enum is used for the `status` query parameter on all transcript-listing routes.
  - `AuditActionType` enum is used for the `action_type` query parameter on audit routes.
  - `ReviewDecision` enum is used as the parameter type in `review_service.py` at the service layer.
  - Submitting an unlisted value returns HTTP 422 automatically via FastAPI/Pydantic.

---

#### B-SEC-03: Audit Log PII Redaction
- **Finding IDs:** SEC-008, SEC-011
- **Owning Agent:** Security
- **Complexity:** S
- **Blocked By:** A-11, A-07
- **Definition of Done:**
  - Filenames in audit log `action_detail` are stored as SHA-256 hashes, not plaintext.
  - `user_agent` (from `User-Agent` header) is always logged; if absent, the value `"UNKNOWN"` is stored.
  - `ip_address` in audit entries is always a string; if `request.client` is `None`, the value `"UNKNOWN"` is stored.
  - The audit service logs security-relevant events (upload, process, review, export) but does not log raw content fields.

---

#### B-SEC-04: Rate Limiting
- **Finding IDs:** SEC-009, DO-016, SEC-020
- **Owning Agent:** Security
- **Complexity:** S
- **Blocked By:** A-01
- **Definition of Done:**
  - `slowapi` is installed and configured as middleware.
  - Upload endpoint: `@limiter.limit("10/hour")`; processing endpoint: `@limiter.limit("30/minute")`; read endpoints: `@limiter.limit("100/hour")`.
  - All API responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.
  - Exceeding any limit returns HTTP 429 with the standard error envelope.

---

#### B-SEC-05: Security HTTP Headers
- **Finding IDs:** SEC-018
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - A response middleware in `main.py` adds the following headers to every response: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy: default-src 'self'`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - A test verifies that a sample response contains all five headers with the correct values.

---

#### B-SEC-06: Dependency Vulnerability Scanning
- **Finding IDs:** SEC-014, DO-009
- **Owning Agent:** Security
- **Complexity:** S
- **Blocked By:** A-14
- **Definition of Done:**
  - `safety check` is added as a CI gate in `.github/workflows/ci.yml`; the pipeline fails if any known CVE is found in Python dependencies.
  - `npm audit --audit-level=high` is added as a CI gate; the pipeline fails on high-severity npm vulnerabilities.
  - `.github/dependabot.yml` is created with weekly update schedules for both `pip` and `npm` ecosystems.

---

#### B-SEC-07: Error Detail Environment-Gating
- **Finding IDs:** SEC-021
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** A-10
- **Definition of Done:**
  - `Settings` includes an `environment: str` field (e.g., `"development"` or `"production"`).
  - In production, exception handlers return only `{"message": "..."}`, `exc.detail` is omitted.
  - In development, `exc.detail` is included in the response body.
  - A unit test verifies the production branch omits internal details.

---

#### B-SEC-08: Input Field Length Constraints
- **Finding IDs:** SEC-016
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - All string fields in Pydantic request schemas have `Field(max_length=N)` constraints: ID fields `max_length=36`; text/annotation fields `max_length=5000`; decision fields `max_length=50`.
  - Submitting a value that exceeds `max_length` returns HTTP 422.

---

### Database Architecture

---

#### B-DB-01: ORM Relationship Lazy Loading
- **Finding IDs:** DB-017
- **Owning Agent:** Database
- **Complexity:** S
- **Blocked By:** A-06
- **Definition of Done:**
  - `Transcript.extracted_data` relationship uses `lazy="joined"` (one-to-one; eager load).
  - `Transcript.flags` and `Transcript.audit_logs` relationships use `lazy="selectin"` (one-to-many; avoids N+1).
  - Alternatively, repository queries use explicit `joinedload()` / `selectinload()` options, either approach is acceptable as long as the transcript-list endpoint does not execute more than 2 queries for any page size.

---

#### B-DB-02: Pagination Count Optimization
- **Finding IDs:** DB-015
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** A-06
- **Definition of Done:**
  - `TranscriptRepository.list_paginated()` executes the count query only when `skip == 0`; on subsequent pages it omits the count and returns `None` for total.
  - API response schema reflects the nullable total field.
  - A unit test verifies that two calls with `skip=0` and `skip=10` issue 2 and 1 database queries respectively.

---

#### B-DB-03: AuditLog JSON Column
- **Finding IDs:** BE-019
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** A-05, A-07
- **Definition of Done:**
  - `AuditLog.action_detail` column type is changed to SQLAlchemy `JSON`.
  - All `json.dumps()` and `json.loads()` calls wrapping `action_detail` in `audit_service.py` are removed.
  - An Alembic migration alters the column type with a working `downgrade()`.

---

#### B-DB-04: Database String Length Constants
- **Finding IDs:** DB-019
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** A-06
- **Definition of Done:**
  - A module (e.g., `app/models/constants.py`) defines named constants: `INSTITUTION_NAME_LENGTH = 255`, `VERIFICATION_DESC_LENGTH = 500`, `STAFF_ID_LENGTH = 36`, etc.
  - All ORM column definitions reference these constants rather than inline integer literals.
  - An Alembic migration is created (even if the DDL is a no-op, to document intent).

---

#### B-DB-05: Seed Data Externalization
- **Finding IDs:** DB-022, DB-023
- **Owning Agent:** Database
- **Complexity:** S
- **Blocked By:** A-05, A-06
- **Definition of Done:**
  - Accredited programs are loaded from `data/accredited_programs.csv` at application startup via an upsert using `insert(...).on_conflict_do_nothing()`.
  - Flagging rules also use `on_conflict_do_nothing()` upserts; no check-then-insert pattern remains.
  - The hardcoded Python list in `database.py` is removed.
  - Two simultaneous startup instances do not cause unique-constraint violations.

---

#### B-DB-06: Schema Documentation Fixes
- **Finding IDs:** DB-020, DB-021, DB-024, DB-025
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** A-05
- **Definition of Done:**
  - `AuditLog.transcript_id` nullability has an inline code comment explaining when `NULL` is valid (DB-020).
  - `database.py` reads `SQLALCHEMY_ECHO` from the environment: `echo = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"` (DB-021).
  - `migrations/env.py` sets the Alembic URL from `DATABASE_URL` environment variable (DB-025).
  - A clarifying comment is added to `transcripts.py` background task session block: `# Context manager ensures session cleanup even on exception` (DB-024).

---

### Frontend Architecture

---

#### B-FE-01: Error Type Safety
- **Finding IDs:** FE-002, FE-003
- **Owning Agent:** Frontend
- **Complexity:** S
- **Blocked By:** A-16
- **Definition of Done:**
  - All `catch` blocks across the codebase use `axios.isAxiosError(err)` type guards before accessing `err.response`.
  - No `catch (err: any)` declarations remain anywhere in the frontend source.
  - `tsc --noEmit` reports 0 errors related to catch-clause typing.

---

#### B-FE-02: Form State and Custom Hook Extraction
- **Finding IDs:** FE-004, FE-005
- **Owning Agent:** Frontend
- **Complexity:** M
- **Blocked By:** A-16
- **Definition of Done:**
  - `ProgramForm` interface (from A-16) is the canonical type for all program form state.
  - A `useAddProgram()` custom hook is extracted to `src/hooks/useAddProgram.ts`, encapsulating the `useMutation` configuration and form-reset logic.
  - `ProgramsPage.tsx` imports `useAddProgram` and its component body no longer contains inline mutation config.

---

#### B-FE-03: Conditional Polling Logic
- **Finding IDs:** FE-006, FE-007
- **Owning Agent:** Frontend
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `TranscriptListPage.tsx` polling uses `refetchInterval: (data) => ...`, returns `5000` only when at least one item has a processing status; returns `false` otherwise.
  - `VerificationPage.tsx` uses a named `getRefetchInterval(data)` function with an explicit `data?.status` null guard before checking terminal states.
  - Neither page polls when the tab is hidden (use `refetchIntervalInBackground: false`).

---

#### B-FE-04: Accessibility, ARIA and Keyboard
- **Finding IDs:** FE-008, FE-009, FE-010, FE-011
- **Owning Agent:** Frontend
- **Complexity:** M
- **Blocked By:** None
- **Definition of Done:**
  - `FileDropzone` div has `role="button"`, `tabIndex={0}`, `aria-label`, and an `onKeyDown` handler activating the file input on Enter/Space.
  - Pagination prev/next buttons have descriptive `aria-label` attributes (e.g., `"Go to previous page"`).
  - Status badge `<span>` elements in `AuditLogTable` have `role="status"` and `aria-label`.
  - `DecisionButtons` implements `role="radiogroup"` on the wrapper and `role="radio"` + `aria-checked` on each option, or uses native radio inputs with custom CSS.

---

#### B-FE-05: Test Infrastructure
- **Finding IDs:** FE-012
- **Owning Agent:** Frontend
- **Complexity:** L
- **Blocked By:** None
- **Definition of Done:**
  - Vitest and React Testing Library are installed; `"test": "vitest"` and `"test:coverage": "vitest --coverage"` scripts exist in `package.json`.
  - At least 5 component tests and 3 custom hook tests are written and passing.
  - `vitest --coverage` reports ≥ 60% line coverage (target 80% is completed in Phase C via C-TEST-01).
  - The CI pipeline (A-14) runs `vitest --coverage` and fails if the threshold is not met.

---

#### B-FE-06: Axios Interceptors and Error Boundary
- **Finding IDs:** FE-013
- **Owning Agent:** Frontend
- **Complexity:** M
- **Blocked By:** B-FE-01
- **Definition of Done:**
  - A single Axios response interceptor handles HTTP 401 (triggers logout / token refresh) and HTTP 500 (triggers a global error notification) for all service clients.
  - An `ErrorBoundary` React component wraps all page-level routes in `App.tsx`.
  - `ErrorBoundary` renders a user-friendly fallback UI with a "Reload" action; it does not expose stack traces in production.

---

#### B-FE-07: Component Architecture Refactoring
- **Finding IDs:** FE-014, FE-015, FE-023, FE-029
- **Owning Agent:** Frontend
- **Complexity:** M
- **Blocked By:** B-FE-02
- **Definition of Done:**
  - `src/hooks/useTranscriptDetail.ts` encapsulates all data-fetching and refetch logic for `VerificationPage`; the page component contains only rendering logic.
  - API functions (`fetchPrograms`, `addProgram`) are moved to `src/services/programClient.ts`.
  - `AuditLogFilters` is rendered with an explicit `disabled={!!id}` prop (not a conditional `{!id && <AuditLogFilters />}` gate).
  - Decision-specific rendering in `ReviewForm` is extracted to a subcomponent or helper, eliminating the duplicated `decision === "OVERRIDDEN"` conditional.

---

#### B-FE-08: Color and Style Utilities
- **Finding IDs:** FE-019, FE-020, FE-021
- **Owning Agent:** Frontend
- **Complexity:** S
- **Blocked By:** A-17
- **Definition of Done:**
  - `src/utils/colorMaps.ts` is the single source of truth for all `STATUS_COLORS` and `SEVERITY_COLORS` maps; duplicate definitions are removed from all component files.
  - `getStatusColor(status: string): string` is exported with a `?? "bg-gray-100 text-gray-700"` fallback.
  - `App.css` is deleted; no component imports it.
  - `getNavLinkClass(isActive: boolean)` helper is extracted from `App.tsx`.

---

### UI/UX Architecture

---

#### B-UX-01: UI Primitive Component Library
- **Finding IDs:** UX-003, UX-011, UX-021
- **Owning Agent:** UI/UX
- **Complexity:** L
- **Blocked By:** A-17
- **Definition of Done:**
  - `src/components/ui/Button.tsx` accepts `variant` (`primary`, `secondary`, `danger`, `ghost`), `size` (`sm`, `md`, `lg`), and `isLoading` props; renders a spinner when `isLoading` is true.
  - `src/components/ui/Input.tsx`, `Select.tsx`, and `Textarea.tsx` have consistent padding, border, focus ring, and disabled states.
  - `src/components/ui/Badge.tsx` accepts `variant` and `size` props; all badge instances across the app use this component.
  - All pre-existing inline button, input, and badge implementations are replaced with these primitives.

---

#### B-UX-02: Color and Spacing Standardization
- **Finding IDs:** UX-004, UX-005, UX-020
- **Owning Agent:** UI/UX
- **Complexity:** M
- **Blocked By:** A-17
- **Definition of Done:**
  - `src/utils/colors.ts` exports named color aliases used across all pages.
  - `tailwind.config.js` defines a spacing scale used by the design system.
  - All pages use `py-10 px-4` for page-level padding.
  - Form fields use `gap-4`; page sections use `gap-6`; inline items use `gap-2`.

---

#### B-UX-03: Feedback State Components
- **Finding IDs:** UX-007, UX-008, UX-009
- **Owning Agent:** UI/UX
- **Complexity:** M
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - `LoadingSpinner` component accepts a context `message` prop and renders with a CSS animation; bare `"Loading…"` text strings are replaced across all four pages.
  - `ErrorAlert` component accepts `error`, `onRetry`, and `onDismiss` props; all async error states use this component.
  - `EmptyState` component accepts `icon`, `title`, `description`, and `action` props; all list and table views render it when the data array is empty.

---

#### B-UX-04: Mobile Responsiveness
- **Finding IDs:** UX-010, UX-015, UX-024
- **Owning Agent:** UI/UX
- **Complexity:** L
- **Blocked By:** B-UX-01, B-UX-02
- **Definition of Done:**
  - Root layout `#root` uses `max-w-screen-xl` with horizontal centering; the fixed `width: 1126px` rule is removed from `index.css`.
  - Navigation collapses to a hamburger menu at ≤ 768px with `aria-expanded` on the toggle button.
  - A `ResponsiveList` component renders `<table>` on desktop and a card stack on mobile (≤ 768px); all three main list views use it.
  - Program form grid uses `grid-cols-1 md:grid-cols-2`.

---

#### B-UX-05: Upload Flow UX
- **Finding IDs:** UX-006
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - The bare `setTimeout` auto-redirect is replaced with either: (a) a visible countdown timer with a "Skip" link, or (b) a persistent success toast with an explicit "View Results" CTA button.
  - The redirect is not triggered without user visibility of the success state for at least 1 second.
  - The solution is keyboard-accessible.

---

#### B-UX-06: Processing State Component
- **Finding IDs:** UX-017
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** B-UX-03
- **Definition of Done:**
  - A `ProcessingState` component displays the current pipeline step (EXTRACTING, VERIFYING) with a progress indicator and a one-line explanation of what that step does.
  - A "Last updated X seconds ago, refreshing…" indicator is visible whenever background polling is active.
  - The component is applied to both `VerificationPage` and `TranscriptListPage` processing rows.

---

#### B-UX-07: Accessibility, Focus Management
- **Finding IDs:** UX-013, UX-014, UX-019
- **Owning Agent:** UI/UX
- **Complexity:** M
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - A visually hidden "Skip to main content" link is the first focusable element on every page.
  - Active `NavLink` elements carry `aria-current="page"`.
  - Async state changes (loading → data, loading → error) use `aria-live="polite"` regions.
  - `DecisionButtons` carries correct radio semantics (`role="radiogroup"` + `role="radio"` + `aria-checked`).
  - All body-copy text uses at least `text-gray-700` (no `text-gray-400` or `text-gray-500` for informational text).

---

#### B-UX-08: Transition Standardization
- **Finding IDs:** UX-012
- **Owning Agent:** UI/UX
- **Complexity:** XS
- **Blocked By:** A-17
- **Definition of Done:**
  - `tailwind.config.js` defines a `transition-standard` utility mapped to `transition-all duration-200 ease-in-out`.
  - All hover states use `duration-200`; state transitions (loading, open/close) use `duration-300`.
  - Inconsistent `transition-all duration-500` and bare `transition-colors` usages are replaced.

---

#### B-UX-09: Review Form UX
- **Finding IDs:** UX-016
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - Instruction text appears above the decision buttons explaining what each decision means.
  - Button labels are: "Confirm Flag", "Override Flag", "Request More Info".
  - A confirmation summary is shown before final submission (e.g., "You are confirming flag X. Continue?").
  - A success message ("Review submitted successfully") is displayed for ≥ 3 seconds after successful submission, then the form is cleared (covering UX-022).

---

#### B-UX-10: Form Accessibility Fixes
- **Finding IDs:** UX-023, UX-026, UX-027
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - Every form label has a matching `htmlFor` pointing to the associated input's `id`.
  - The "browse" `<span>` in `FileDropzone` is replaced with `<button type="button">`.
  - All icon-only and ambiguous buttons have descriptive `aria-label` attributes.
  - Expand/collapse toggles (e.g., `FlagItem` "Details" button) have `aria-expanded`.

---

#### B-UX-11: Breadcrumb and Navigation Improvements
- **Finding IDs:** UX-029, UX-025, UX-018
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** B-UX-07
- **Definition of Done:**
  - Transcript-specific audit log page uses a semantic `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the final crumb (UX-029).
  - Pagination controls are hidden when the items array is empty (UX-025).
  - Button text conventions are standardized: navigation links use "← Back to [page]"; action buttons use verb-noun ("Export JSON"); toggles use "Show Details" / "Hide Details" (UX-018).

---

### DevOps Architecture

---

#### B-DO-01: Deployment Documentation
- **Finding IDs:** DO-002
- **Owning Agent:** DevOps
- **Complexity:** M
- **Blocked By:** A-13, A-14
- **Definition of Done:**
  - `DEPLOYMENT.md` documents: staging and production deployment steps; environment variable management; database migration procedure (`alembic upgrade head`); rollback procedure (`alembic downgrade -1` + previous image tag).
  - A `docker-compose.prod.yml` or equivalent production configuration is provided.

---

#### B-DO-02: Frontend Environment Documentation
- **Finding IDs:** DO-006
- **Owning Agent:** DevOps
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - `frontend/.env.example` exists with `VITE_API_BASE_URL=http://localhost:8000/api/v1` and a descriptive comment.
  - `frontend/README.md` (or the root README) references this file and documents how to set the variable for different environments.

---

#### B-DO-03: Dependency Lock Files
- **Finding IDs:** DO-007, DO-008
- **Owning Agent:** DevOps
- **Complexity:** M
- **Blocked By:** A-14
- **Definition of Done:**
  - Backend is managed with Poetry; `poetry.lock` is committed to the repository.
  - CI uses `poetry install --frozen` (not `pip install -r requirements.txt`).
  - Frontend CI uses `npm ci --frozen-lockfile` (not `npm install`).
  - `package-lock.json` is committed and up to date.

---

#### B-DO-04: Performance Monitoring
- **Finding IDs:** DO-012
- **Owning Agent:** DevOps
- **Complexity:** M
- **Blocked By:** A-11, A-12
- **Definition of Done:**
  - `prometheus-client` is installed; `app/metrics.py` defines: `request_duration_seconds` (Histogram), `http_error_count` (Counter), `transcripts_processed_total` (Counter), `flags_generated_total` (Counter).
  - A `/metrics` endpoint is mounted and returns Prometheus-format text.
  - SLO targets are documented in `DEPLOYMENT.md`: P95 latency < 200 ms, error rate < 0.1%.

---

#### B-DO-05: Developer Experience Documentation
- **Finding IDs:** DO-017
- **Owning Agent:** DevOps
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `CONTRIBUTING.md` documents: local setup steps, how to run tests, linting commands, and code standards.
  - `docs/ADR/ADR-001-SQLite-for-PoC.md` documents the SQLite choice: context, decision, consequences, and migration path to PostgreSQL.

---

## Phase C, Quality and Polish (MINOR Findings)

> All Phase B items must be stable before Phase C begins.
> Items within Phase C may be worked in parallel within each agent stream.

---

### Frontend Minor (C-FE-01 through C-FE-15)

---

#### C-FE-01: Form Field Names Type Safety
- **Finding IDs:** FE-016
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-02
- **Definition of Done:**
  - The hardcoded `(["institution_name", ...] as const).map(...)` array in `ProgramsPage.tsx` is replaced with `Object.keys(defaultForm)` or a named constant derived from the `ProgramForm` type.
  - No string literals that duplicate field names appear independently of the `ProgramForm` interface.

---

#### C-FE-02: onChange Handler Memoization
- **Finding IDs:** FE-017
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-02
- **Definition of Done:**
  - The inline `onChange` handler in `ProgramsPage.tsx` is replaced with `useCallback` using a functional `setForm(prev => ...)` update pattern.
  - No new object is created on every keystroke unless field values change.

---

#### C-FE-03: UI Store Persistence
- **Finding IDs:** FE-018
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - Zustand `persist` middleware is applied to `uiStore.ts` with `name: "msbon-ui-store"`.
  - `staffId` survives a page refresh.
  - The store rehydrates from `localStorage` on mount.

---

#### C-FE-04: NavLink Class Extraction
- **Finding IDs:** FE-019
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-08
- **Definition of Done:**
  - A named `getNavLinkClass(isActive: boolean): string` helper exists in `App.tsx` or a shared utility file.
  - The inline conditional class string in the `NavLink` callback is removed.

---

#### C-FE-05: Centralized Color Maps
- **Finding IDs:** FE-020
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-08
- **Definition of Done:**
  - `src/utils/colorMaps.ts` is the only file defining `STATUS_COLORS` and `SEVERITY_COLORS`.
  - All components import from `colorMaps.ts`; no duplicate definitions remain.

---

#### C-FE-06: App.css Deletion
- **Finding IDs:** FE-021
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-08
- **Definition of Done:**
  - `App.css` is deleted from the repository.
  - No component has an `import "./App.css"` statement.
  - Build output is not affected (bundle size decreases or stays equal).

---

#### C-FE-07: onClick Handler Memoization in FileDropzone
- **Finding IDs:** FE-022
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-04
- **Definition of Done:**
  - `FileDropzone` `onClick` handler is wrapped in `useCallback` with `[disabled]` as the dependency array.
  - The handler guards against `disabled` state before calling `inputRef.current?.click()`.

---

#### C-FE-08: Nullable Field Documentation
- **Finding IDs:** FE-024
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - Each nullable field in the `Course` interface (`code`, `credits`, `semester`, `year`) has a JSDoc comment explaining when and why it may be `null`.

---

#### C-FE-09: Error Logging in List Pages
- **Finding IDs:** FE-025
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-06
- **Definition of Done:**
  - `TranscriptListPage.tsx` error handling calls `logger.error('Failed to load transcripts:', error)` and displays `error.message` when available, rather than a static generic string.

---

#### C-FE-10: Upload Redirect Delay Named Constant
- **Finding IDs:** FE-026
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-UX-05
- **Definition of Done:**
  - The magic number `1500` in `UploadPage.tsx` is replaced with a named constant `UPLOAD_COMPLETE_REDIRECT_DELAY_MS = 1500` defined at the top of the file.

---

#### C-FE-11: ReviewForm Validation Consolidation
- **Finding IDs:** FE-027
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-07
- **Definition of Done:**
  - All validation logic in `ReviewForm.tsx` is computed before any `setState` call.
  - No sequential `setError(null)` followed immediately by `setError(...)` pattern remains.

---

#### C-FE-12: clsx for Complex Class Construction
- **Finding IDs:** FE-028
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - `clsx` is installed as a dependency.
  - `DecisionButtons.tsx` uses `clsx(...)` for its className construction; the long template-literal conditional is removed.

---

#### C-FE-13: Vite Proxy Environment Variable
- **Finding IDs:** FE-030
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-DO-02
- **Definition of Done:**
  - `vite.config.ts` proxy target reads `process.env.VITE_API_TARGET ?? 'http://localhost:8000'` instead of a hardcoded string.
  - `frontend/.env.example` documents `VITE_API_TARGET`.

---

#### C-FE-14: Consistent Type Import Convention
- **Finding IDs:** FE-031
- **Owning Agent:** Frontend
- **Complexity:** XS
- **Blocked By:** B-FE-07
- **Definition of Done:**
  - All service files (`reviewClient.ts`, `auditClient.ts`, etc.) use `import type { ... }` for type-only imports.
  - Shared request/response types are centralized in `src/types/index.ts`.

---

#### C-FE-15: Frontend Logging Utility
- **Finding IDs:** FE-032
- **Owning Agent:** Frontend
- **Complexity:** S
- **Blocked By:** None
- **Definition of Done:**
  - `src/utils/logger.ts` is created with `info(msg, meta?)`, `warn(msg, meta?)`, and `error(msg, meta?)` helpers.
  - In production builds, `logger.info` is a no-op; `logger.error` and `logger.warn` remain active.
  - All `console.error` and `console.warn` calls in component files are replaced with `logger.*` equivalents.

---

> **Note:** FE-033 (TranscriptSummary flag count memoization) and FE-034 (aria-current on navigation links) are covered by B-FE-03 and B-UX-07 respectively. FE-035 (color map fallback) is covered by B-FE-08. These are not listed separately to avoid duplicate task entries.

---

### Backend Minor (C-BE-01 through C-BE-06)

---

#### C-BE-01: Repository Pagination Methods
- **Finding IDs:** BE-004
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** B-DB-02
- **Definition of Done:**
  - `BaseRepository` defines `list_paginated(skip: int, limit: int) -> tuple[list[ModelT], int]` and `bulk_save(instances: list[ModelT]) -> None` methods.
  - All callers that previously used `list_all()` for paginated views are updated.

---

#### C-BE-02: Exception Chain Preservation
- **Finding IDs:** BE-010
- **Owning Agent:** Backend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - All custom exception raises in `extraction_service.py` and other service files use `raise CustomError(...) from exc` syntax.
  - No `raise CustomError(str(exc))` pattern (which drops the original traceback) remains.

---

#### C-BE-03: ReviewDecision Enum at Service Layer
- **Finding IDs:** BE-013
- **Owning Agent:** Backend
- **Complexity:** XS
- **Blocked By:** B-SEC-02
- **Definition of Done:**
  - `review_service.py` `submit_review()` accepts `decision: ReviewDecision` (enum) instead of `decision: str`.
  - The enum is imported from the shared enums module.

---

#### C-BE-04: Mandatory LLM Adapter Injection
- **Finding IDs:** BE-016
- **Owning Agent:** Backend
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - `ExtractionService.__init__` signature is `(self, db: Session, llm_adapter: LLMAdapter) -> None`; the `or LLMAdapter()` fallback is removed.
  - All call sites pass an explicit `LLMAdapter` instance.

---

#### C-BE-05: File Retention Cleanup Service
- **Finding IDs:** BE-021
- **Owning Agent:** Backend
- **Complexity:** S
- **Blocked By:** A-11, B-BE-01
- **Definition of Done:**
  - A `CleanupService` deletes files from the upload directory that are older than `settings.file_retention_hours`.
  - APScheduler runs this service on startup and then every hour.
  - Cleanup events (number of files deleted, any errors) are logged via the structured logging infrastructure.

---

#### C-BE-06: AuditLog JSON Column (Minor follow-on)
- **Finding IDs:** BE-019
- **Owning Agent:** Backend
- **Complexity:** XS
- **Blocked By:** B-DB-03
- **Definition of Done:**
  - This task is satisfied by the completion of B-DB-03. Verify: no `json.dumps` or `json.loads` calls for `action_detail` exist anywhere in the backend codebase after B-DB-03 is complete.

---

### Database Minor (C-DB-01 through C-DB-04)

---

#### C-DB-01: String Length Constants (follow-on verification)
- **Finding IDs:** DB-019
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** B-DB-04
- **Definition of Done:**
  - This task is satisfied by B-DB-04. Confirm: no inline integer literals (`String(255)`, `String(500)`, etc.) remain in any ORM model file; all reference named constants.

---

#### C-DB-02: AuditLog Nullability Documentation (follow-on verification)
- **Finding IDs:** DB-020
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** B-DB-06
- **Definition of Done:**
  - Satisfied by B-DB-06. Confirm: `audit_log.py` has a comment on `transcript_id` explaining valid NULL semantics, and the decision is documented in `docs/ADR/` or inline.

---

#### C-DB-03: SQLAlchemy Echo from Environment (follow-on verification)
- **Finding IDs:** DB-021
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** B-DB-06
- **Definition of Done:**
  - Satisfied by B-DB-06. Confirm: `database.py` reads `SQLALCHEMY_ECHO` from the environment; `echo=False` is no longer hardcoded.

---

#### C-DB-04: Alembic URL from Environment (follow-on verification)
- **Finding IDs:** DB-025
- **Owning Agent:** Database
- **Complexity:** XS
- **Blocked By:** B-DB-06
- **Definition of Done:**
  - Satisfied by B-DB-06. Confirm: `migrations/env.py` sets `sqlalchemy.url` from `DATABASE_URL` environment variable; no hardcoded SQLite path remains in `alembic.ini`.

---

### Security Minor (C-SEC-01 through C-SEC-05)

---

#### C-SEC-01: IDOR Ownership Check
- **Finding IDs:** SEC-015
- **Owning Agent:** Security
- **Complexity:** S
- **Blocked By:** A-01, A-02
- **Definition of Done:**
  - All transcript endpoint handlers add `filter(Transcript.uploaded_by == current_user["staff_id"])` (or equivalent ownership check) when fetching a transcript by ID.
  - Requests for transcripts owned by a different user return HTTP 403, not HTTP 404 (to prevent enumeration-via-timing; use constant-time comparison).
  - Admin role bypasses ownership check (can view all transcripts).

---

#### C-SEC-02: Frontend .env Commit Prevention
- **Finding IDs:** SEC-012
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** B-DO-02
- **Definition of Done:**
  - `README.md` (or `CONTRIBUTING.md`) explicitly warns that `frontend/.env` must never be committed.
  - A pre-commit hook (or `.github/workflows/ci.yml` check) scans for `.env` files being added to the staging area and fails the commit.

---

#### C-SEC-03: LLM Output Sanitization
- **Finding IDs:** SEC-017
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** None
- **Definition of Done:**
  - Backend adds `bleach.clean(llm_output_field)` to sanitize LLM-generated `source_excerpt` and similar text fields before persisting them.
  - Frontend maintains zero `dangerouslySetInnerHTML` usage (enforced by ESLint `react/no-danger` rule added to `.eslintrc`).

---

#### C-SEC-04: Responsive Typography Security Note
- **Finding IDs:** SEC-018
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** B-SEC-05
- **Definition of Done:**
  - Satisfied by B-SEC-05. Confirm: all five security headers are present in API responses when checked via `curl -I` or an integration test.

---

#### C-SEC-05: Security Logging Filter Verification
- **Finding IDs:** SEC-019
- **Owning Agent:** Security
- **Complexity:** XS
- **Blocked By:** A-11
- **Definition of Done:**
  - Satisfied by A-11. Confirm: a unit test verifies that a log record containing an `api_key` field has the value replaced with `"[REDACTED]"` by `SensitiveDataFilter`.

---

### UI/UX Minor (C-UX-01 through C-UX-05)

---

#### C-UX-01: Responsive Font Scale
- **Finding IDs:** UX-028
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** A-17
- **Definition of Done:**
  - `tailwind.config.js` defines responsive font-size overrides using `clamp()` or per-breakpoint values for heading levels (h1 through h3).
  - Body copy uses at least `text-base` (16 px) at all breakpoints; `text-xs` is reserved for labels and captions only.

---

#### C-UX-02: Badge Component (follow-on verification)
- **Finding IDs:** UX-021
- **Owning Agent:** UI/UX
- **Complexity:** XS
- **Blocked By:** B-UX-01
- **Definition of Done:**
  - Satisfied by B-UX-01. Confirm: `src/components/ui/Badge.tsx` exists with `variant` and `size` props, and all badge instances (`TranscriptSummary`, `AuditLogTable`, `FlagItem`, `TranscriptListPage`) use it.

---

#### C-UX-03: Review Success Message (follow-on verification)
- **Finding IDs:** UX-022
- **Owning Agent:** UI/UX
- **Complexity:** XS
- **Blocked By:** B-UX-09
- **Definition of Done:**
  - Satisfied by B-UX-09. Confirm: after `ReviewForm` submission, a success message is visible for ≥ 3 seconds before the form clears.

---

#### C-UX-04: Pagination Hidden When Empty (follow-on verification)
- **Finding IDs:** UX-025
- **Owning Agent:** UI/UX
- **Complexity:** XS
- **Blocked By:** B-UX-11
- **Definition of Done:**
  - Satisfied by B-UX-11. Confirm: `TranscriptListPage.tsx` pagination controls are conditionally rendered only when `items.length > 0`.

---

#### C-UX-05: Programs Page Save Feedback
- **Finding IDs:** UX-030
- **Owning Agent:** UI/UX
- **Complexity:** S
- **Blocked By:** B-UX-01, B-UX-03
- **Definition of Done:**
  - The "Saving…" state in `ProgramsPage.tsx` displays a loading spinner inside the button (using the `Button` primitive's `isLoading` prop).
  - All form inputs are disabled while the mutation is in-flight.
  - A success or error message (using `ErrorAlert` or a success variant) is shown for 3 seconds after the mutation settles.

---

### Testing Completion

---

#### C-TEST-01: Coverage to 80%, Backend and Frontend
- **Finding IDs:** FE-012 (coverage increase to 80%), BE pytest coverage completion
- **Owning Agent:** Frontend + Backend
- **Complexity:** L
- **Blocked By:** B-FE-05
- **Definition of Done:**
  - `pytest --cov-fail-under=80` passes against the full backend test suite.
  - `vitest --coverage` reports ≥ 80% line coverage for the frontend.
  - Both thresholds are enforced as CI gates in `.github/workflows/ci.yml`.
  - Coverage reports are uploaded as CI artifacts for review.

---

## Phase D, Deferred (Human Review Required)

> The following items require infrastructure decisions or stakeholder approvals that cannot be resolved by engineering alone. They are explicitly excluded from Phases A–C.

---

#### D-01: Production Database Migration (SQLite → PostgreSQL)
- **Finding IDs:** SEC-022
- **Owning Agent:** DevOps + Database
- **Complexity:** XL
- **Blocked By:** Phase B completion + Stakeholder decision
- **Rationale for Deferral:** Migration requires selection of a cloud database hosting provider (AWS RDS, Google Cloud SQL, Azure Database, or self-hosted PostgreSQL), infrastructure provisioning, data migration tooling, and HIPAA Business Associate Agreement (BAA) confirmation from the chosen vendor. These are infrastructure and budget decisions that require human stakeholder approval on cost, vendor lock-in, SLA requirements, and compliance obligations. The engineering-side code changes (connection string, pool settings) are already addressed by DB-005 / DO-015 (completed in Phase A) and will automatically benefit from PostgreSQL when the infrastructure decision is made.
- **Risk if Not Acted On:** SQLite is inappropriate for production concurrent writes and does not support row-level encryption at rest. Data stored in SQLite is at risk from disk-level access (partially mitigated by DB-010 field-level encryption completed in Phase A).
- **Recommended Review Process:** Convene an infrastructure review panel including: (1) Budget holder / CTO, (2) DevOps lead, (3) HIPAA compliance officer or legal counsel. Decision criteria: expected concurrent users, uptime SLA requirements, HIPAA BAA availability from the chosen cloud vendor, estimated monthly cost. Target: decision within 30 days of Phase B completion.
- **Migration Path (once provider is selected):**
  1. Provision PostgreSQL instance with `sslmode=require`.
  2. Set `DATABASE_URL=postgresql+psycopg2://...` in environment.
  3. Run `alembic upgrade head` against the new PostgreSQL instance.
  4. Migrate any existing SQLite data using `pgloader` or a one-time ETL script.
  5. Validate all Alembic migrations and integration tests against PostgreSQL.
  6. No application code changes are required, the codebase is already database-agnostic by this point.

---

*End of Section 5: Phased Implementation Plan*
*Total findings assigned: 153 of 153 (27 Critical → Phase A; 68 Major → Phase B; 58 Minor → Phase C; 1 infrastructure-gated → Phase D)*

---

## Section 6: Phase A Agent Dispatch Briefs

> **Document:** Phase 2 Unified Implementation Blueprint, Section 6
> **Project:** MSBON Fraud-Sensitive Transcript Verification System
> **Phase A Agents:** 6
> **Date Issued:** 2026-03-29
> **Authority:** Principal Software Architect
>
> All six briefs below are self-contained. An independent engineer must be able to execute each brief without asking any clarifying questions. Every Step-by-Step Instructions section is written to the level of specificity that two engineers executing independently would produce nearly identical outputs.

---

### Agent: Security/Auth Agent
**Phase:** A
**Finding IDs Addressed:** SEC-001, BE-005, SEC-002, BE-014, BE-015, SEC-003, BE-020, DO-004, BE-011

**Task Summary:** Implement JWT authentication and RBAC from scratch, replacing the current header-based security theater across all four protected route files. Rotate the exposed Gemini API key, replace it with a placeholder in `.env`, and create a `.env.example` with all required variables documented. Add path traversal protection to the file extractor to prevent reading arbitrary files via crafted paths.

**Context:**

Per **Decision 6 (Auth)** in the Phase 2 architecture document: JWT tokens are issued using `python-jose`. The `verify_token` dependency (using FastAPI `Depends()`) must be applied to every protected route. Token payload shape is `{"sub": staff_id, "role": staff_role, "exp": timestamp}`. Valid roles are `admin`, `reviewer`, and `viewer`. The `X-Staff-ID` and `X-Staff-Role` headers must be removed from all authorization logic, these are not trusted inputs.

Per **Decision 3 (Layers)**: Auth middleware and token verification live exclusively in `api/v1/dependencies.py`. Route handlers call service methods only; they do not contain business logic. Role checks must never appear inside service or repository layers, only at the route layer via dependency injection.

Per **Decision 4 (API Contract)**: An unauthenticated request returns HTTP 401 with the standard error envelope: `{"success": false, "error": {"code": "UNAUTHORIZED", "message": "...", "details": null}}`. An authenticated but insufficiently-permissioned request returns HTTP 403 with `"code": "FORBIDDEN"`.

**Step-by-Step Instructions:**

1. Install the required packages by adding the following to `backend/requirements.txt` and running `pip install` (or noting them for Docker build):
   ```
   python-jose[cryptography]
   passlib[bcrypt]
   ```

2. Open `backend/app/config.py`. Add the following fields to the `Settings` class:
   ```python
   jwt_secret: str = Field(..., min_length=32)
   jwt_algorithm: str = "HS256"
   jwt_expire_minutes: int = 480
   environment: str = "development"
   ```
   The `jwt_secret` field has no default, it is required. If this variable is absent from the environment at startup the application must refuse to start (Pydantic will enforce this because of `Field(...)`).

3. Create the file `backend/app/api/v1/dependencies.py` with the following content exactly:
   ```python
   from fastapi import Depends, HTTPException
   from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
   from jose import jwt, JWTError, ExpiredSignatureError
   from app.config import settings

   security = HTTPBearer()

   async def verify_token(
       credentials: HTTPAuthorizationCredentials = Depends(security),
   ) -> dict:
       token = credentials.credentials
       try:
           payload = jwt.decode(
               token,
               settings.jwt_secret,
               algorithms=[settings.jwt_algorithm],
           )
           return payload
       except ExpiredSignatureError:
           raise HTTPException(
               status_code=401,
               detail={"success": False, "error": {"code": "UNAUTHORIZED",
                        "message": "Token expired", "details": None}},
           )
       except JWTError:
           raise HTTPException(
               status_code=401,
               detail={"success": False, "error": {"code": "UNAUTHORIZED",
                        "message": "Invalid token", "details": None}},
           )
   ```

4. Create the file `backend/app/auth/permissions.py`. You must also create `backend/app/auth/__init__.py` (empty) if the `auth` package does not already exist.
   ```python
   from enum import Enum
   from typing import Callable
   from fastapi import Depends, HTTPException
   from app.api.v1.dependencies import verify_token


   class Permission(str, Enum):
       MANAGE_PROGRAMS = "manage_programs"
       SUBMIT_REVIEW = "submit_review"
       VIEW_TRANSCRIPTS = "view_transcripts"
       EXPORT_AUDIT = "export_audit"
       UPLOAD_TRANSCRIPT = "upload_transcript"


   ROLE_PERMISSIONS: dict[str, set[Permission]] = {
       "admin": {
           Permission.MANAGE_PROGRAMS,
           Permission.SUBMIT_REVIEW,
           Permission.VIEW_TRANSCRIPTS,
           Permission.EXPORT_AUDIT,
           Permission.UPLOAD_TRANSCRIPT,
       },
       "reviewer": {
           Permission.SUBMIT_REVIEW,
           Permission.VIEW_TRANSCRIPTS,
       },
       "viewer": {
           Permission.VIEW_TRANSCRIPTS,
       },
   }


   def require_permission(permission: Permission) -> Callable:
       async def _check(token: dict = Depends(verify_token)) -> None:
           role = token.get("role", "")
           allowed = ROLE_PERMISSIONS.get(role, set())
           if permission not in allowed:
               raise HTTPException(
                   status_code=403,
                   detail={"success": False, "error": {"code": "FORBIDDEN",
                            "message": "Insufficient permissions", "details": None}},
               )
       return _check
   ```

5. Create `backend/app/api/v1/auth.py` with a login stub endpoint:
   ```python
   from datetime import datetime, timedelta
   from fastapi import APIRouter
   from pydantic import BaseModel
   from jose import jwt
   from app.config import settings

   router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


   class LoginRequest(BaseModel):
       staff_id: str
       password: str


   class LoginResponse(BaseModel):
       access_token: str
       token_type: str = "bearer"
       expires_at: datetime


   # STUB: This hardcoded credential check must be replaced with a real
   # user database lookup in Phase B (finding BE-005 Phase B work item).
   _DEMO_USERS = {
       "admin": {"password": "demo", "role": "admin"},
   }


   @router.post("/login", response_model=LoginResponse)
   async def login(body: LoginRequest) -> LoginResponse:
       user = _DEMO_USERS.get(body.staff_id)
       if not user or user["password"] != body.password:
           from fastapi import HTTPException
           raise HTTPException(
               status_code=401,
               detail={"success": False, "error": {"code": "UNAUTHORIZED",
                        "message": "Invalid credentials", "details": None}},
           )
       expires_at = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
       token = jwt.encode(
           {"sub": body.staff_id, "role": user["role"], "exp": expires_at},
           settings.jwt_secret,
           algorithm=settings.jwt_algorithm,
       )
       return LoginResponse(access_token=token, expires_at=expires_at)
   ```

6. Open `backend/app/api/v1/transcripts.py`. For every route function in this file:
   - Add `token: dict = Depends(verify_token)` as a parameter (import `Depends` from fastapi and `verify_token` from `app.api.v1.dependencies`).
   - Do not change any service calls or business logic.
   - Example signature after change:
     ```python
     @router.post("/transcripts/")
     async def upload_transcript(
         file: UploadFile,
         staff_id: str = Form(...),
         token: dict = Depends(verify_token),
         db: Session = Depends(get_db),
     ):
         ...
     ```

7. Open `backend/app/api/v1/reviews.py`. For every route function:
   - Add `token: dict = Depends(verify_token)` as a parameter.
   - Add `_: None = Depends(require_permission(Permission.SUBMIT_REVIEW))` as a parameter (import `require_permission` and `Permission` from `app.auth.permissions`).
   - Remove the line `reviewer_id = x_staff_id or body.reviewer_id` (and the `x_staff_id: Optional[str] = Header(default=None)` parameter if present).
   - Replace with `reviewer_id = token["sub"]`.
   - Remove `x_staff_role` and `x_staff_id` header parameters from all function signatures.

8. Open `backend/app/api/v1/programs.py`. For every route function:
   - Remove the `x_staff_role: str = Header(...)` and `x_staff_id: Optional[str] = Header(default=None)` parameters.
   - Remove any `if x_staff_role != "admin"` conditional check.
   - Add `_: None = Depends(require_permission(Permission.MANAGE_PROGRAMS))` as a parameter.
   - The permission dependency already enforces the admin check via `ROLE_PERMISSIONS`; no additional role comparison code is needed in the route body.

9. Open `backend/app/api/v1/audit.py`. For every route function:
   - Add `_: None = Depends(require_permission(Permission.EXPORT_AUDIT))` as a parameter.
   - Add `token: dict = Depends(verify_token)` if the route needs the caller's identity for any logging.

10. Open `backend/app/api/v1/health.py`. Locate the public `GET /api/v1/health` endpoint. Remove the `"llm_api"` key from its response dict entirely, it must not appear in the public health response at all. Then create a new endpoint:
    ```python
    @router.get("/health/detailed")
    async def detailed_health(
        _: None = Depends(require_permission(Permission.VIEW_TRANSCRIPTS)),
    ):
        return {
            "status": "ok",
            "llm_api": "reachable" if settings.gemini_api_key else "not_configured",
        }
    ```

11. Fix `backend/.env`:
    - Open the file. Replace the actual `GEMINI_API_KEY` value with the placeholder string `your_gemini_api_key_here`. The line must read: `GEMINI_API_KEY=your_gemini_api_key_here`
    - Add the following lines if they are not already present:
      ```
      JWT_SECRET=
      ENCRYPTION_KEY=
      ```
      Leave the values empty with a comment instructing the developer to generate a 32+ character random string.
    - The real API key must be rotated in Google Cloud Console immediately (this is a human action, but document that it is required in a comment at the top of `.env`).

12. Create `backend/.env.example` with the following content:
    ```
    # MSBON Backend, Required Environment Variables
    # Copy this file to .env and fill in all values before running.
    # NEVER commit .env to version control.

    # Google Gemini LLM integration (required, min 10 chars)
    GEMINI_API_KEY=your_gemini_api_key_here

    # JWT authentication secret (required, min 32 chars)
    # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
    JWT_SECRET=

    # Field-level PII encryption key (required, min 32 chars)
    # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
    ENCRYPTION_KEY=

    # Database
    DATABASE_URL=sqlite:///./data/msbon.db

    # CORS, comma-separated list of allowed origins
    CORS_ORIGINS=http://localhost:5173

    # Logging level: DEBUG, INFO, WARNING, ERROR
    LOG_LEVEL=INFO

    # Sentry DSN for error tracking (optional, leave empty to disable)
    SENTRY_DSN=

    # Runtime environment: development, staging, production
    ENVIRONMENT=development
    ```

13. Open `backend/app/infrastructure/document_extractor.py`. At the top of the method that accepts and opens `file_path`, add the following path traversal guard as the very first lines of that method body, before any file open call:
    ```python
    from pathlib import Path
    from app.config import settings

    upload_dir = Path(settings.upload_dir).resolve()
    safe_path = Path(file_path).resolve()
    try:
        safe_path.relative_to(upload_dir)
    except ValueError:
        raise ExtractionFailedError(
            f"Path traversal detected: {file_path}"
        )
    ```
    If `settings.upload_dir` does not already exist in the `Settings` class, add `upload_dir: str = "data/uploads"` to `config.py` and `UPLOAD_DIR=data/uploads` to `.env.example`.

14. Register the auth router in `backend/app/main.py`. Add `from app.api.v1.auth import router as auth_router` with the other router imports, and add `app.include_router(auth_router)` alongside the other `include_router` calls.

**Patterns to Follow:**

```python
# Correct dependency injection pattern for a protected route:
@router.post("/transcripts/")
async def upload_transcript(
    file: UploadFile,
    token: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    staff_id = token["sub"]
    # pass staff_id to service, never trust a request body field for identity

# Correct permission check with separate verify_token + require_permission:
@router.post("/reviews/{transcript_id}")
async def submit_review(
    transcript_id: str,
    body: ReviewRequest,
    _: None = Depends(require_permission(Permission.SUBMIT_REVIEW)),
    token: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    reviewer_id = token["sub"]  # identity ALWAYS from JWT, never from body

# NEVER:
if x_staff_role != "admin":
    raise HTTPException(403, ...)
# NEVER:
reviewer_id = x_staff_id or body.reviewer_id
```

**Files in Scope:**
- `backend/app/config.py`
- `backend/app/api/v1/dependencies.py` (CREATE)
- `backend/app/auth/__init__.py` (CREATE if absent)
- `backend/app/auth/permissions.py` (CREATE)
- `backend/app/api/v1/auth.py` (CREATE)
- `backend/app/api/v1/transcripts.py`
- `backend/app/api/v1/reviews.py`
- `backend/app/api/v1/programs.py`
- `backend/app/api/v1/audit.py`
- `backend/app/api/v1/health.py`
- `backend/app/infrastructure/document_extractor.py`
- `backend/app/main.py`
- `backend/.env`
- `backend/.env.example` (CREATE)
- `backend/requirements.txt`

**Files Out of Scope:**
- Any frontend files (`frontend/`)
- Any ORM model files (`backend/app/models/`)
- Any repository files (`backend/app/repositories/`)
- Any service files (`backend/app/services/`)
- Any migration files (`backend/migrations/`)
- `backend/app/database.py`

**Definition of Done:**
- `curl -X POST http://localhost:8000/api/v1/transcripts/` without an `Authorization` header returns HTTP 401 with response body `{"success": false, "error": {"code": "UNAUTHORIZED", "message": "...", "details": null}}`
- `curl -X POST http://localhost:8000/api/v1/auth/login -d '{"staff_id":"admin","password":"demo"}'` returns HTTP 200 with a valid JWT in the `access_token` field
- Decoding that JWT confirms payload contains `sub`, `role`, and `exp` fields
- Using that JWT as a reviewer-role token (by manually crafting a reviewer JWT with the same secret) to `POST /api/v1/programs/` returns HTTP 403
- `backend/.env` contains no real API key values, only the string `your_gemini_api_key_here` for `GEMINI_API_KEY`
- Calling `document_extractor.py`'s extraction method with file path `../../etc/passwd` raises `ExtractionFailedError` with a message containing "Path traversal detected"
- `grep -r "x_staff_role\|x_staff_id" backend/app/api/` returns no results

**Completion Report Template:**
```
## Security Agent Phase A, Completion Report

### JWT Authentication
- [ ] verify_token dependency created at backend/app/api/v1/dependencies.py
- [ ] Login stub endpoint active at POST /api/v1/auth/login
- [ ] All 4 route files (transcripts, reviews, programs, audit) require valid JWT

### RBAC
- [ ] Permission enum defined with 5 permissions in auth/permissions.py
- [ ] ROLE_PERMISSIONS mapping defined for admin/reviewer/viewer
- [ ] require_permission dependency applied: programs (MANAGE_PROGRAMS), reviews (SUBMIT_REVIEW), audit (EXPORT_AUDIT)
- [ ] reviewer_id sourced exclusively from JWT payload (token["sub"]) in reviews.py

### Secrets
- [ ] backend/.env contains only placeholders (no real key values)
- [ ] backend/.env.example created with all required variables and generation instructions
- [ ] Public health endpoint no longer includes llm_api status
- [ ] Detailed health endpoint exists behind VIEW_TRANSCRIPTS permission

### Path Traversal
- [ ] document_extractor.py resolves file_path and validates it against upload_dir
- [ ] ExtractionFailedError raised for paths outside upload_dir

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

### Agent: Database Foundation Agent
**Phase:** A
**Finding IDs Addressed:** DB-011, DB-001, DB-002, DB-003, DB-006, DB-012, DB-013, DB-014, DB-016, DB-018, DB-007, DB-008, DB-009, BE-003, DB-004, DB-005, DB-010, SEC-010

**Task Summary:** Establish the Alembic migration framework by replacing the `create_all()` call with a proper `alembic upgrade head` invocation, then generate a single comprehensive migration that addresses all schema integrity defects, missing foreign keys, absent cascade rules, unconstrained status enum, missing indexes, and PII fields stored in plaintext. Fix all multi-step write operations in service files to use atomic nested transactions so that partial failures cannot leave the database in an inconsistent state.

**Context:**

Per **Decision 5 (Database)**: All schema changes must go through Alembic migrations. `Base.metadata.create_all()` must not appear in any non-test code path. All queries must live in repository classes. All multi-step write sequences must use `db.begin_nested()` so that they succeed or fail atomically.

Per **Decision 8 (Logging)**: All database errors must be logged using `logger.error()` with the `correlation_id` included in the `extra` dict. `print()` must not be used in production code paths.

**Step-by-Step Instructions:**

1. **Establish Alembic** (DB-011, DB-025):
   - If `alembic.ini` is not present at the backend root, run `alembic init migrations` from the `backend/` directory. If it already exists, open it.
   - In `alembic.ini`, change the `sqlalchemy.url` line to: `sqlalchemy.url = %(DATABASE_URL)s`
   - Open `backend/migrations/env.py`. At the top of the file, add `import os`. In the `run_migrations_online()` function, before the engine is created, add:
     ```python
     config.set_main_option(
         "sqlalchemy.url",
         os.getenv("DATABASE_URL", "sqlite:///./data/msbon.db"),
     )
     ```
   - Open `backend/app/database.py`. Locate the `init_db()` function. Replace `Base.metadata.create_all(bind=engine)` with:
     ```python
     from alembic.config import Config
     from alembic import command as alembic_command
     alembic_cfg = Config("alembic.ini")
     alembic_command.upgrade(alembic_cfg, "head")
     ```

2. **Update ORM models**, make all model changes before generating the migration, so the autogenerate captures everything in one revision.

   **`backend/app/models/transcript.py`** (DB-018, DB-001):
   - Import `SQLAlchemy_Enum` via `from sqlalchemy import Enum as SQLAlchemy_Enum`.
   - Confirm that `TranscriptStatus` is already defined as a Python `enum.Enum` (or `str, Enum`) in the same file or a shared enums module. If not, define it:
     ```python
     import enum
     class TranscriptStatus(str, enum.Enum):
         UPLOADED = "UPLOADED"
         EXTRACTING = "EXTRACTING"
         EXTRACTED = "EXTRACTED"
         VERIFYING = "VERIFYING"
         FLAGGED = "FLAGGED"
         CLEAR = "CLEAR"
         REVIEWED = "REVIEWED"
         OVERRIDDEN = "OVERRIDDEN"
     ```
   - Change the `status` column definition from `mapped_column(String(20), ...)` to:
     ```python
     status: Mapped[TranscriptStatus] = mapped_column(
         SQLAlchemy_Enum(TranscriptStatus),
         nullable=False,
         default=TranscriptStatus.UPLOADED,
     )
     ```
   - Add `__table_args__` to the `Transcript` model:
     ```python
     __table_args__ = (
         Index("idx_transcript_status", "status"),
         Index("idx_transcript_uploaded_at", "uploaded_at"),
     )
     ```

   **`backend/app/models/audit_log.py`** (DB-002, DB-006):
   - Change the `transcript_id` foreign key:
     ```python
     transcript_id: Mapped[Optional[str]] = mapped_column(
         ForeignKey("transcripts.id", ondelete="SET NULL"),
         nullable=True,
     )
     ```
   - Add `__table_args__`:
     ```python
     __table_args__ = (
         Index("idx_audit_transcript_timestamp", "transcript_id", "timestamp"),
         CheckConstraint("LENGTH(actor_id) > 0", name="ck_audit_actor_not_empty"),
         CheckConstraint("LENGTH(action_type) > 0", name="ck_audit_action_type_not_empty"),
     )
     ```

   **`backend/app/models/verification_flag.py`** (DB-002, DB-013):
   - Update the FK: `transcript_id: Mapped[str] = mapped_column(ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False)`
   - Add `__table_args__`:
     ```python
     __table_args__ = (
         UniqueConstraint("transcript_id", "rule_id", name="uq_vflag_transcript_rule"),
         Index("idx_vflag_transcript_flagged", "transcript_id", "flagged_at"),
     )
     ```

   **`backend/app/models/staff_review.py`** (DB-003, DB-016):
   - Replace the plain `String(36)` column with a proper FK:
     ```python
     transcript_id: Mapped[str] = mapped_column(
         ForeignKey("transcripts.id", ondelete="CASCADE"),
         nullable=False,
     )
     ```
   - Add `__table_args__`:
     ```python
     __table_args__ = (
         Index("idx_staff_review_transcript_id", "transcript_id"),
         Index("idx_staff_review_reviewed_at", "reviewed_at"),
     )
     ```

   **`backend/app/models/extracted_data.py`** (DB-002, DB-010, SEC-010):
   - Update the FK: `transcript_id: Mapped[str] = mapped_column(ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False)`
   - Install `sqlalchemy-utils`, add `sqlalchemy-utils` to `backend/requirements.txt`.
   - Change `student_name` and `raw_text` to use `EncryptedType`:
     ```python
     from sqlalchemy_utils import EncryptedType
     from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
     from app.config import settings

     student_name: Mapped[Optional[str]] = mapped_column(
         EncryptedType(String, settings.encryption_key, AesEngine, "pkcs5"),
         nullable=True,
     )
     raw_text: Mapped[Optional[str]] = mapped_column(
         EncryptedType(Text, settings.encryption_key, AesEngine, "pkcs5"),
         nullable=True,
     )
     ```
   - Add `__table_args__`:
     ```python
     __table_args__ = (
         Index("idx_extracted_data_transcript", "transcript_id"),
     )
     ```

   **`backend/app/models/flagging_rule.py`** (DB-012):
   - Add `__table_args__`:
     ```python
     __table_args__ = (
         UniqueConstraint("name", name="uq_flagging_rule_name"),
         Index("idx_flagging_rule_category", "category"),
     )
     ```

   **`backend/app/models/accredited_program.py`** (DB-014):
   - Add two new columns:
     ```python
     from datetime import datetime
     from sqlalchemy import DateTime

     created_at: Mapped[datetime] = mapped_column(
         DateTime, nullable=False, default=datetime.utcnow
     )
     updated_at: Mapped[datetime] = mapped_column(
         DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
     )
     ```

3. **Add `encryption_key` to Settings** (backend/app/config.py):
   - Add: `encryption_key: str = Field(..., min_length=32)`, required, no default.
   - Confirm `ENCRYPTION_KEY=` is present in `backend/.env.example` (it should be from the Security agent's work, or add it here if that agent has not run yet).

4. **Generate the Alembic migration**, after all model changes above are saved:
   - From the `backend/` directory run: `alembic revision --autogenerate -m "initial_schema_integrity"`
   - Open the generated file in `backend/migrations/versions/`.
   - Review the `upgrade()` function. Verify it includes: SQLEnum for TranscriptStatus, FK additions on staff_review and extracted_data, cascade rules on audit_log, verification_flag, extracted_data, all Index and UniqueConstraint and CheckConstraint additions, EncryptedType column changes, and created_at/updated_at on accredited_program.
   - Write a complete `downgrade()` function that reverses every change in `upgrade()`. For dropped constraints, use `op.drop_constraint()`. For column type changes, reverse them. For added columns, use `op.drop_column()`.
   - Run `alembic upgrade head` to verify the migration applies cleanly on a fresh database.
   - Then run `alembic downgrade -1` followed by `alembic upgrade head` to verify the round-trip.

5. **Configure connection pool** (DB-005, BE-023, DO-015) in `backend/app/database.py`:
   - Add to `Settings` (in `config.py`):
     ```python
     database_pool_size: int = 10
     database_max_overflow: int = 20
     ```
   - In `database.py`, change the `create_engine` call to branch on the database URL type:
     ```python
     db_url = settings.database_url
     if db_url.startswith("sqlite"):
         from sqlalchemy.pool import NullPool
         engine = create_engine(
             db_url,
             connect_args={"check_same_thread": False},
             poolclass=NullPool,
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
     ```

6. **Fix O(n) program search** (DB-004) in `backend/app/repositories/program_repository.py`:
   - Locate the `find_by_name()` method. Replace its entire body with a SQL-filtered query:
     ```python
     def find_by_name(self, name: str) -> Optional[AccreditedProgram]:
         from sqlalchemy import func
         name_lower = name.lower()
         return (
             self.db.query(AccreditedProgram)
             .filter(
                 AccreditedProgram.is_active == True,  # noqa: E712
                 func.lower(AccreditedProgram.institution_name).contains(name_lower),
             )
             .first()
         )
     ```

7. **Fix transaction atomicity in extraction_service.py** (DB-007). Open `backend/app/services/extraction_service.py`. Locate the `process()` method. Wrap all DB modification calls in a single nested transaction:
   ```python
   import logging
   logger = logging.getLogger(__name__)

   # Inside process():
   try:
       with self.db.begin_nested():
           self._update_status(transcript_id, TranscriptStatus.EXTRACTING)
           extracted = self._extract_data(file_path)
           self._save_extracted_data(transcript_id, extracted)
           self._log_extraction_success(transcript_id, extracted)
       self.db.commit()
   except Exception as exc:
       self.db.rollback()
       logger.error(
           "Extraction failed",
           extra={"transcript_id": transcript_id, "error": str(exc)[:200]},
       )
       self._update_status(transcript_id, TranscriptStatus.FAILED)
       self.db.commit()
       raise ExtractionFailedError(str(exc)) from exc
   ```
   Note: If `_log_extraction_success` calls `self.audit.log()` internally, it must remain inside the `begin_nested()` block.

8. **Fix transaction atomicity in verification_service.py** (DB-008). Open `backend/app/services/verification_service.py`. Locate the commit call and the audit log call. Move the `self.audit.log()` call to inside the `db.begin_nested()` block, before `self.db.commit()`. The pattern must be:
   ```python
   with self.db.begin_nested():
       # ... save verification flags ...
       self.audit.log(...)   # moved INSIDE the transaction
   self.db.commit()          # single commit after all writes
   ```

9. **Fix transaction atomicity in review_service.py** (DB-009). Open `backend/app/services/review_service.py`. Wrap the review save and transcript status update atomically:
   ```python
   try:
       with self.db.begin_nested():
           repo.save(review)
           transcript_repo.update_status(transcript_id, new_status)
       self.db.commit()
       # Audit log after successful commit in its own nested transaction:
       with self.db.begin_nested():
           self.audit.log(...)
       self.db.commit()
   except Exception as exc:
       self.db.rollback()
       logger.error(
           "Review submission failed",
           extra={"transcript_id": transcript_id, "error": str(exc)[:200]},
       )
       raise
   ```

10. **Fix file + DB atomicity in transcript_service.py** (BE-003). Open `backend/app/services/transcript_service.py`. Locate where the uploaded file is written to disk and the transcript is saved to the database. Wrap both in a try/except so that a DB failure causes file cleanup:
    ```python
    import os
    try:
        write_file(file_path, content)
        with db.begin_nested():
            repo.save(transcript)
        db.commit()
    except Exception as exc:
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error(
            "Transcript save failed, cleaning up file",
            extra={"file_path": file_path, "error": str(exc)[:200]},
        )
        raise
    ```

**Patterns to Follow:**

```python
# All multi-step DB writes must follow this nested transaction pattern:
try:
    with db.begin_nested():
        # step 1, will be rolled back if step 2 fails
        # step 2
        # step 3
    db.commit()  # one commit after all steps succeed
except Exception as exc:
    db.rollback()
    logger.error("Operation failed", exc_info=True, extra={"correlation_id": ...})
    raise DomainError("Descriptive message") from exc

# Audit log always INSIDE the transaction:
with db.begin_nested():
    save_primary_record()
    audit.log(...)  # inside, not after commit
db.commit()
```

**Files in Scope:**
- `backend/app/models/transcript.py`
- `backend/app/models/audit_log.py`
- `backend/app/models/verification_flag.py`
- `backend/app/models/staff_review.py`
- `backend/app/models/extracted_data.py`
- `backend/app/models/flagging_rule.py`
- `backend/app/models/accredited_program.py`
- `backend/app/repositories/program_repository.py`
- `backend/app/services/extraction_service.py`
- `backend/app/services/verification_service.py`
- `backend/app/services/review_service.py`
- `backend/app/services/transcript_service.py`
- `backend/app/database.py`
- `backend/app/config.py`
- `backend/migrations/env.py`
- `backend/migrations/versions/` (new migration file, CREATE)
- `backend/alembic.ini`
- `backend/requirements.txt` (add `sqlalchemy-utils`)

**Files Out of Scope:**
- Any frontend files (`frontend/`)
- Any route/API files (`backend/app/api/`)
- `backend/app/main.py`
- `backend/app/infrastructure/document_extractor.py`

**Definition of Done:**
- `alembic upgrade head` completes with zero errors on a fresh SQLite database
- `alembic downgrade -1` followed by `alembic upgrade head` completes with zero errors
- The `staff_reviews` table has a proper FK constraint to `transcripts.id` (verifiable via SQLite `PRAGMA foreign_key_list(staff_reviews)`)
- The `transcripts.status` column rejects invalid values at the DB level (attempting to insert `status="INVALID"` raises an integrity error)
- Inspecting the raw SQLite file with a hex viewer or `sqlite3` confirms `student_name` is stored as ciphertext, not as the original string
- Triggering a deliberate failure mid-way through `ExtractionService.process()` leaves zero rows in `extracted_data` for that transcript (no orphaned partial records)
- Running `EXPLAIN QUERY PLAN SELECT * FROM transcripts WHERE status = 'FLAGGED'` returns a plan that references an index (not a full table scan)

**Completion Report Template:**
```
## Database Agent Phase A, Completion Report

### Migration Framework
- [ ] alembic.ini reads DATABASE_URL from environment variable
- [ ] migrations/env.py calls config.set_main_option with os.getenv
- [ ] migrations/versions/ contains the initial_schema_integrity migration file
- [ ] create_all() replaced with alembic upgrade head in init_db()

### Schema Integrity (one line per model updated)
- [ ] transcript.py, SQLAlchemy_Enum for status, two indexes added
- [ ] audit_log.py, FK ondelete=SET NULL, compound index, two CHECK constraints
- [ ] verification_flag.py, FK ondelete=CASCADE, UniqueConstraint, index
- [ ] staff_review.py, ForeignKey added (was missing entirely), two indexes
- [ ] extracted_data.py, FK ondelete=CASCADE, EncryptedType for student_name and raw_text, index
- [ ] flagging_rule.py, UniqueConstraint, category index
- [ ] accredited_program.py, created_at and updated_at columns added

### Transaction Atomicity (one line per service fixed)
- [ ] extraction_service.py, all three DB steps wrapped in db.begin_nested()
- [ ] verification_service.py, audit.log() moved inside transaction before commit
- [ ] review_service.py, repo.save() and update_status() wrapped atomically
- [ ] transcript_service.py, file removed on DB failure via try/except

### Performance
- [ ] ProgramRepository.find_by_name() uses SQL func.lower().contains() filter
- [ ] Connection pool configured (NullPool for SQLite, QueuePool for PostgreSQL)

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

### Agent: Backend Foundation Agent
**Phase:** A
**Finding IDs Addressed:** BE-001, DO-005, BE-018, DO-010, SEC-019, DO-011

**Task Summary:** Add startup validation so the application fails fast and loudly when critical configuration variables are missing or invalid, rather than silently misbehaving later. Implement structured JSON logging with rotating file output and per-request correlation IDs so that every log line is traceable to a specific request. Integrate Sentry for error monitoring so that unhandled exceptions, including silent failures in background pipeline tasks, are captured and reported.

**Context:**

Per **Decision 8 (Logging)**: The logging library must be `python-json-logger`. Output goes to a `RotatingFileHandler` as well as stdout. Every log record must include `correlation_id`. A `SensitiveDataFilter` must redact any log record field named `api_key`, `token`, `password`, or `authorization`. The `settings.log_level` value must be consumed. `print()` must not appear in any production code path.

Per **Decision 7 (Error Handling)**: A global unhandled exception handler must log to Sentry before returning the standard error envelope to the client. Background task exceptions must be caught, logged, and sent to Sentry, they must not fail silently.

Per **Decision 3 (Layers)**: Logging configuration belongs in the infrastructure layer. HTTP middleware belongs in `main.py` or a dedicated `middleware/` package.

**Step-by-Step Instructions:**

1. Add to `backend/requirements.txt`:
   ```
   python-json-logger
   sentry-sdk[fastapi]
   ```

2. Open `backend/app/config.py`. Add the following fields to `Settings` if they are not already present:
   - `log_level: str = "INFO"`, if it already exists, confirm it has no `Field(...)` annotation that would make it required (it should be optional with a default).
   - `sentry_dsn: str = ""`, optional, empty string disables Sentry.
   - `environment: str = "development"`, if the Security agent has not already added this, add it here.
   Add a `field_validator` for `gemini_api_key` to reject empty or placeholder values at startup:
   ```python
   from pydantic import field_validator

   @field_validator("gemini_api_key")
   @classmethod
   def validate_gemini_key(cls, v: str) -> str:
       if not v or len(v) < 10:
           raise ValueError(
               "GEMINI_API_KEY must be set and be at least 10 characters. "
               "Set GEMINI_API_KEY in your .env file."
           )
       return v
   ```

3. Create `backend/app/logging_config.py` with the following exact content:
   ```python
   import logging
   import logging.handlers
   import os
   from pythonjsonlogger import jsonlogger


   class SensitiveDataFilter(logging.Filter):
       REDACT_KEYS = {"api_key", "token", "password", "authorization", "gemini_api_key"}

       def filter(self, record: logging.LogRecord) -> bool:
           if hasattr(record, "msg") and isinstance(record.msg, dict):
               for key in self.REDACT_KEYS:
                   if key in record.msg:
                       record.msg[key] = "[REDACTED]"
           # Also redact from extra attributes attached to the record
           for key in self.REDACT_KEYS:
               if hasattr(record, key):
                   setattr(record, key, "[REDACTED]")
           return True


   def configure_logging(log_level: str = "INFO") -> None:
       os.makedirs("logs", exist_ok=True)
       formatter = jsonlogger.JsonFormatter(
           fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
           datefmt="%Y-%m-%dT%H:%M:%S",
       )
       sensitive_filter = SensitiveDataFilter()

       file_handler = logging.handlers.RotatingFileHandler(
           "logs/app.log",
           maxBytes=10_000_000,
           backupCount=5,
           encoding="utf-8",
       )
       file_handler.setFormatter(formatter)
       file_handler.addFilter(sensitive_filter)

       console_handler = logging.StreamHandler()
       console_handler.setFormatter(formatter)
       console_handler.addFilter(sensitive_filter)

       root_logger = logging.getLogger()
       root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
       # Avoid duplicate handlers if configure_logging is called more than once
       if not root_logger.handlers:
           root_logger.addHandler(file_handler)
           root_logger.addHandler(console_handler)
   ```

4. Create `backend/app/middleware/` directory. Create `backend/app/middleware/__init__.py` (empty). Create `backend/app/middleware/correlation.py`:
   ```python
   import uuid
   from starlette.middleware.base import BaseHTTPMiddleware
   from starlette.requests import Request
   from starlette.responses import Response


   class CorrelationIDMiddleware(BaseHTTPMiddleware):
       async def dispatch(self, request: Request, call_next) -> Response:
           correlation_id = str(uuid.uuid4())
           request.state.correlation_id = correlation_id
           response = await call_next(request)
           response.headers["X-Correlation-ID"] = correlation_id
           return response
   ```

5. Create `backend/app/middleware/request_logging.py`:
   ```python
   import logging
   import time
   from starlette.middleware.base import BaseHTTPMiddleware
   from starlette.requests import Request
   from starlette.responses import Response

   logger = logging.getLogger(__name__)


   class RequestLoggingMiddleware(BaseHTTPMiddleware):
       async def dispatch(self, request: Request, call_next) -> Response:
           start = time.monotonic()
           response = await call_next(request)
           duration_ms = round((time.monotonic() - start) * 1000, 2)
           logger.info(
               "HTTP Request",
               extra={
                   "method": request.method,
                   "path": request.url.path,
                   "status_code": response.status_code,
                   "duration_ms": duration_ms,
                   "correlation_id": getattr(request.state, "correlation_id", "unknown"),
               },
           )
           return response
   ```

6. Open `backend/app/main.py`. Apply the following changes in this order:

   a. Near the top of the file, before the `FastAPI(...)` constructor call, add:
      ```python
      from app.logging_config import configure_logging
      from app.config import settings
      configure_logging(settings.log_level)
      ```

   b. After the `app = FastAPI(...)` line, register both middleware classes (CorrelationID must be registered before RequestLogging so the correlation_id is set before the request log fires):
      ```python
      from app.middleware.correlation import CorrelationIDMiddleware
      from app.middleware.request_logging import RequestLoggingMiddleware
      app.add_middleware(CorrelationIDMiddleware)
      app.add_middleware(RequestLoggingMiddleware)
      ```

   c. Add Sentry initialization immediately after logging setup:
      ```python
      if settings.sentry_dsn:
          import sentry_sdk
          from sentry_sdk.integrations.fastapi import FastApiIntegration
          sentry_sdk.init(
              dsn=settings.sentry_dsn,
              environment=settings.environment,
              integrations=[FastApiIntegration()],
          )
      ```

   d. Locate the `_run_pipeline()` background task function. Wrap its entire body in a try/except:
      ```python
      import logging
      _pipeline_logger = logging.getLogger("app.pipeline")

      async def _run_pipeline(transcript_id: str) -> None:
          try:
              # ... existing pipeline code unchanged ...
              pass
          except Exception as exc:
              _pipeline_logger.error(
                  "Background pipeline failed",
                  extra={
                      "transcript_id": transcript_id,
                      "error": str(exc)[:200],
                  },
              )
              if settings.sentry_dsn:
                  import sentry_sdk
                  sentry_sdk.capture_exception(exc)
      ```

7. Create the logs directory. Create the file `backend/logs/.gitkeep` (empty file). In the project-root `.gitignore` (or `backend/.gitignore` if one exists), add:
   ```
   logs/*.log
   ```

8. Search for every `print()` call in `backend/app/`. For each one:
   - Determine whether it is logging information (`print("Starting...")`), an error (`print(f"Error: {e}")`), or debug output.
   - Replace `print(...)` with `logger.info(...)` or `logger.error(...)` as appropriate.
   - If the file does not already have `import logging` and `logger = logging.getLogger(__name__)` at the top, add those lines.

9. In every service file that does not already have a module-level logger, add at the top (after all imports):
   ```python
   import logging
   logger = logging.getLogger(__name__)
   ```
   This applies to: `extraction_service.py`, `verification_service.py`, `review_service.py`, `transcript_service.py`, `audit_service.py`.

**Patterns to Follow:**

```python
# Every log call at the service layer must include contextual extra fields:
logger.info("Extraction started", extra={
    "transcript_id": transcript_id,
    "correlation_id": correlation_id,  # pass from request state when available
})

# Never log PII content, log metadata only:
logger.info("Extraction complete", extra={
    "transcript_id": transcript_id,
    "text_length": len(raw_text),    # length only, not content
    "student_name": "[REDACTED]",    # never log actual student name
})

# Never log raw API keys or tokens:
logger.info("LLM call result", extra={
    "model": "gemini-pro",
    "response_length": len(response_text),
    # Never: "api_key": settings.gemini_api_key
})
```

**Files in Scope:**
- `backend/app/config.py`
- `backend/app/main.py`
- `backend/app/logging_config.py` (CREATE)
- `backend/app/middleware/__init__.py` (CREATE)
- `backend/app/middleware/correlation.py` (CREATE)
- `backend/app/middleware/request_logging.py` (CREATE)
- `backend/app/services/extraction_service.py`
- `backend/app/services/verification_service.py`
- `backend/app/services/review_service.py`
- `backend/app/services/transcript_service.py`
- `backend/app/services/audit_service.py`
- `backend/logs/.gitkeep` (CREATE)
- `.gitignore` (add logs/*.log entry)
- `backend/requirements.txt`

**Files Out of Scope:**
- Any frontend files (`frontend/`)
- Any ORM model files (`backend/app/models/`)
- Any repository files (`backend/app/repositories/`)
- Any route/API files other than `backend/app/main.py`

**Definition of Done:**
- Starting the application with `GEMINI_API_KEY=""` in the environment causes the process to exit at startup with a `ValueError` message that contains the text `GEMINI_API_KEY`
- Every HTTP response (including 4xx and 5xx) includes an `X-Correlation-ID` header with a UUID value
- After sending any request to the running server, `backend/logs/app.log` exists and each line in it is valid JSON containing at minimum the fields: `asctime`, `levelname`, `name`, `message`
- Request log lines include `method`, `path`, `status_code`, `duration_ms`, and `correlation_id` fields
- Running `grep -r "print(" backend/app/` returns zero results
- Sentry initialization code is present in `main.py` (even if `SENTRY_DSN` is empty, the conditional block must exist)
- Triggering a deliberate exception inside `_run_pipeline()` causes a log line with `levelname: ERROR` to appear in `logs/app.log` containing the `transcript_id`

**Completion Report Template:**
```
## Backend Foundation Agent Phase A, Completion Report

### Startup Validation
- [ ] gemini_api_key field_validator added to Settings
- [ ] Empty or short GEMINI_API_KEY raises ValueError at startup naming the variable
- [ ] sentry_dsn and environment fields added to Settings

### Structured Logging
- [ ] logging_config.py created with JsonFormatter and RotatingFileHandler
- [ ] SensitiveDataFilter redacts api_key/token/password/authorization fields
- [ ] settings.log_level consumed in configure_logging() call in main.py
- [ ] CorrelationIDMiddleware adds X-Correlation-ID to all responses
- [ ] RequestLoggingMiddleware logs method/path/status_code/duration_ms/correlation_id
- [ ] logs/.gitkeep created, logs/*.log added to .gitignore

### Error Monitoring
- [ ] Sentry SDK initialized in main.py (conditional on SENTRY_DSN being non-empty)
- [ ] Background task _run_pipeline() wrapped in try/except
- [ ] Pipeline failures logged with logger.error() and sent to Sentry

### Code Quality
- [ ] All print() calls in backend/app/ replaced with logger.*() calls
- [ ] All service files have logger = logging.getLogger(__name__) at module level

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

### Agent: DevOps Agent
**Phase:** A
**Finding IDs Addressed:** DO-003, DO-001, DO-013

**Task Summary:** Containerize both the backend and frontend services using multi-stage Dockerfiles, wire them together with a docker-compose configuration, and establish a five-gate GitHub Actions CI pipeline that runs on every pull request targeting main, gating merges on lint, test coverage, Docker build, security scan, and migration health. Add an automated SQLite backup service that runs on a 6-hour interval.

**Context:**

Per **Decision 10 (CI/CD)**: Five gates are mandatory: lint, test (backend at 80% coverage minimum, frontend with vitest coverage), Docker build, security scan (`safety check` + `npm audit`), and Alembic migration check (`upgrade head` → `downgrade -1` → `upgrade head`). Frontend CI must use `npm ci --frozen-lockfile`, not `npm install`. No PR may merge with a failing gate.

Per **Decision 9 (Testing)**: Backend coverage enforced with `pytest --cov-fail-under=80`. Frontend coverage enforced with `vitest --coverage`.

**Step-by-Step Instructions:**

1. Create `backend/Dockerfile` with the following multi-stage content:
   ```dockerfile
   # Stage 1: Install Python dependencies in isolation
   FROM python:3.11-slim AS deps
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # Stage 2: Production image
   FROM python:3.11-slim AS production
   WORKDIR /app
   # Copy installed packages from deps stage
   COPY --from=deps /usr/local/lib/python3.11/site-packages \
        /usr/local/lib/python3.11/site-packages
   COPY --from=deps /usr/local/bin /usr/local/bin
   # Copy application code
   COPY . .
   # Create required runtime directories
   RUN mkdir -p data logs
   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. Create `backend/.dockerignore`:
   ```
   .venv/
   __pycache__/
   *.pyc
   *.pyo
   .env
   data/
   logs/
   .git/
   tests/
   *.db
   ```

3. Create `frontend/Dockerfile` with the following multi-stage content:
   ```dockerfile
   # Stage 1: Build the React application
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --frozen-lockfile
   COPY . .
   ARG VITE_API_BASE_URL
   ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
   RUN npm run build

   # Stage 2: Serve static files via nginx
   FROM nginx:alpine AS production
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

4. Create `frontend/.dockerignore`:
   ```
   node_modules/
   dist/
   .env
   .env.local
   .git/
   coverage/
   ```

5. Create `frontend/nginx.conf`:
   ```nginx
   server {
       listen 80;
       server_name _;
       root /usr/share/nginx/html;
       index index.html;

       # Serve SPA, all unknown paths fall back to index.html
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API calls to the backend service
       location /api/ {
           proxy_pass http://backend:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

6. Create `docker-compose.yml` at the project root (the directory that contains both `backend/` and `frontend/`):
   ```yaml
   version: '3.9'

   services:
     backend:
       build:
         context: ./backend
         dockerfile: Dockerfile
       ports:
         - "8000:8000"
       env_file:
         - ./backend/.env
       volumes:
         - ./backend/data:/app/data
         - ./backend/logs:/app/logs
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
         interval: 30s
         timeout: 10s
         retries: 3
         start_period: 15s

     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
         args:
           VITE_API_BASE_URL: http://localhost:8000/api/v1
       ports:
         - "3000:80"
       depends_on:
         backend:
           condition: service_healthy
   ```

7. Create the directory `.github/workflows/` at the project root. Create `.github/workflows/ci.yml` with the following content:
   ```yaml
   name: CI

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]

   jobs:
     lint:
       name: Lint
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'

         - name: Backend lint (flake8)
           run: |
             pip install flake8
             flake8 backend/app \
               --max-line-length=120 \
               --exclude=backend/migrations

         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json

         - name: Frontend install
           run: cd frontend && npm ci --frozen-lockfile

         - name: Frontend lint (ESLint)
           run: cd frontend && npm run lint

         - name: TypeScript check
           run: cd frontend && npx tsc --noEmit

     test-backend:
       name: Backend Tests
       runs-on: ubuntu-latest
       env:
         DATABASE_URL: sqlite:///./test.db
         GEMINI_API_KEY: test-placeholder-key-long-enough
         JWT_SECRET: test-secret-key-32-chars-minimum!!
         ENCRYPTION_KEY: test-encryption-key-32-chars-min!!
         ENVIRONMENT: test
       steps:
         - uses: actions/checkout@v4

         - uses: actions/setup-python@v4
           with:
             python-version: '3.11'

         - name: Install dependencies
           run: pip install -r backend/requirements.txt pytest pytest-cov httpx

         - name: Run backend tests
           run: |
             cd backend
             pytest \
               --cov=app \
               --cov-fail-under=80 \
               --cov-report=xml \
               --cov-report=term-missing

         - name: Upload coverage report
           uses: actions/upload-artifact@v4
           with:
             name: backend-coverage
             path: backend/coverage.xml

     test-frontend:
       name: Frontend Tests
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json

         - name: Install dependencies
           run: cd frontend && npm ci --frozen-lockfile

         - name: Run frontend tests with coverage
           run: cd frontend && npx vitest run --coverage

     build:
       name: Docker Build
       runs-on: ubuntu-latest
       needs: [lint]
       steps:
         - uses: actions/checkout@v4

         - name: Build backend image
           run: docker build -t msbon-backend:ci ./backend

         - name: Build frontend image
           run: |
             docker build \
               --build-arg VITE_API_BASE_URL=http://localhost:8000/api/v1 \
               -t msbon-frontend:ci \
               ./frontend

     security:
       name: Security Scan
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - uses: actions/setup-python@v4
           with:
             python-version: '3.11'

         - name: Python dependency scan (safety)
           run: |
             pip install safety
             safety check -r backend/requirements.txt

         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json

         - name: Frontend install
           run: cd frontend && npm ci --frozen-lockfile

         - name: npm audit
           run: cd frontend && npm audit --audit-level=high

     migrate:
       name: Migration Check
       runs-on: ubuntu-latest
       env:
         DATABASE_URL: sqlite:///./test_migrate.db
         GEMINI_API_KEY: test-placeholder-key-long-enough
         JWT_SECRET: test-secret-key-32-chars-minimum!!
         ENCRYPTION_KEY: test-encryption-key-32-chars-min!!
         ENVIRONMENT: test
       steps:
         - uses: actions/checkout@v4

         - uses: actions/setup-python@v4
           with:
             python-version: '3.11'

         - name: Install dependencies
           run: pip install -r backend/requirements.txt

         - name: Run migrations up
           run: cd backend && alembic upgrade head

         - name: Run migrations down
           run: cd backend && alembic downgrade -1

         - name: Run migrations up again (verify round-trip)
           run: cd backend && alembic upgrade head
   ```

8. Create `backend/app/services/backup_service.py`:
   ```python
   import logging
   import shutil
   from datetime import datetime
   from pathlib import Path

   from apscheduler.schedulers.asyncio import AsyncIOScheduler

   logger = logging.getLogger(__name__)


   def backup_database(db_path: str, backup_dir: str = "data/backups", max_backups: int = 7) -> None:
       """Copy the SQLite database file to a timestamped backup location.
       Retains only the most recent max_backups copies."""
       backup_path = Path(backup_dir)
       backup_path.mkdir(parents=True, exist_ok=True)

       source = Path(db_path)
       if not source.exists():
           logger.warning("Backup skipped: database file not found", extra={"db_path": db_path})
           return

       timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
       dest = backup_path / f"msbon_{timestamp}.db"
       shutil.copy2(source, dest)
       logger.info("Database backup created", extra={"backup_path": str(dest)})

       # Prune oldest backups beyond max_backups
       existing = sorted(backup_path.glob("msbon_*.db"))
       to_delete = existing[:-max_backups] if len(existing) > max_backups else []
       for old_backup in to_delete:
           old_backup.unlink()
           logger.info("Old backup pruned", extra={"path": str(old_backup)})


   def start_backup_scheduler(db_path: str) -> AsyncIOScheduler:
       """Start an APScheduler job that backs up the database every 6 hours."""
       scheduler = AsyncIOScheduler()
       scheduler.add_job(
           backup_database,
           trigger="interval",
           hours=6,
           args=[db_path, "data/backups"],
           id="db_backup",
           replace_existing=True,
       )
       scheduler.start()
       logger.info("Database backup scheduler started", extra={"interval_hours": 6})
       return scheduler
   ```

9. Add `apscheduler` to `backend/requirements.txt`.

10. Register the backup scheduler in `backend/app/main.py`. In the startup hook (either the existing `@app.on_event("startup")` or the `lifespan` context manager if the app has been migrated to that pattern), add:
    ```python
    from app.services.backup_service import start_backup_scheduler
    from app.config import settings

    # Parse SQLite file path from DATABASE_URL for backup purposes
    db_path = settings.database_url.replace("sqlite:///", "").replace("sqlite://", "")
    start_backup_scheduler(db_path)
    ```

11. Create `.github/PULL_REQUEST_TEMPLATE.md` at the project root:
    ```markdown
    ## Summary
    <!-- What does this PR do? Describe the change in 2-3 sentences. -->

    ## Finding IDs Addressed
    <!-- List Phase 2 finding IDs implemented in this PR (e.g., SEC-001, DB-007) -->

    ## Test Coverage
    - [ ] New code paths have unit tests
    - [ ] Integration tests pass locally (`pytest` and `npm test`)
    - [ ] No test coverage regression (`pytest --cov-fail-under=80`)

    ## CI Checklist
    - [ ] All 5 CI gates pass (lint / test-backend / test-frontend / build / security / migrate)
    - [ ] No new flake8 or ESLint warnings introduced
    - [ ] `alembic upgrade head` tested locally on a clean database
    - [ ] `.env` contains no real secret values
    ```

**Files in Scope:**
- `backend/Dockerfile` (CREATE)
- `backend/.dockerignore` (CREATE)
- `frontend/Dockerfile` (CREATE)
- `frontend/.dockerignore` (CREATE)
- `frontend/nginx.conf` (CREATE)
- `docker-compose.yml` (CREATE at project root)
- `.github/workflows/ci.yml` (CREATE)
- `.github/PULL_REQUEST_TEMPLATE.md` (CREATE)
- `backend/app/services/backup_service.py` (CREATE)
- `backend/app/main.py` (add backup scheduler startup call only)
- `backend/requirements.txt` (add `apscheduler`)

**Files Out of Scope:**
- Any application logic files (`models/`, `services/` other than backup_service, `routes/`, `repositories/`)
- `backend/app/config.py`
- Any frontend source files (`*.tsx`, `*.ts`, `*.css`)

**Definition of Done:**
- `docker-compose up --build` starts both services and the backend health check at `GET /api/v1/health` returns HTTP 200
- `docker build ./backend` and `docker build ./frontend` each complete without error in under 5 minutes on a cold cache
- `.github/workflows/ci.yml` exists and contains all six job names: `lint`, `test-backend`, `test-frontend`, `build`, `security`, `migrate`
- Manually calling `backup_database("data/msbon.db", "data/backups")` with a real SQLite file creates a `.db` file under `data/backups/` and logs a JSON line to `logs/app.log`
- `backend/.dockerignore` contains entries for `.env`, `data/`, `*.db`, and `.git/`
- `frontend/.dockerignore` contains entries for `node_modules/`, `dist/`, and `.env`

**Completion Report Template:**
```
## DevOps Agent Phase A, Completion Report

### Containerization
- [ ] backend/Dockerfile, two-stage, python:3.11-slim base
- [ ] frontend/Dockerfile, two-stage, node:20-alpine builder + nginx:alpine serve
- [ ] frontend/nginx.conf, SPA fallback and /api/ proxy configured
- [ ] backend/.dockerignore, excludes .env, data/, logs/, *.db, __pycache__
- [ ] frontend/.dockerignore, excludes node_modules/, dist/, .env
- [ ] docker-compose.yml, both services with healthcheck and volume mounts

### CI/CD Pipeline
- [ ] .github/workflows/ci.yml created
- [ ] lint gate: flake8 backend (max-line=120) + ESLint + tsc --noEmit
- [ ] test-backend gate: pytest --cov-fail-under=80 with GEMINI_API_KEY env stub
- [ ] test-frontend gate: vitest run --coverage
- [ ] build gate: both Docker images built successfully
- [ ] security gate: safety check + npm audit --audit-level=high
- [ ] migrate gate: alembic upgrade / downgrade / upgrade round-trip

### Database Backups
- [ ] backup_service.py created with backup_database() and start_backup_scheduler()
- [ ] APScheduler configured for 6-hour interval
- [ ] Max 7 backups retained with automatic pruning of oldest
- [ ] Backup creation and pruning events logged with logger.info()
- [ ] Scheduler registered in main.py startup hook
- [ ] apscheduler added to requirements.txt

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

### Agent: Frontend Critical Agent
**Phase:** A
**Finding IDs Addressed:** FE-001

**Task Summary:** Remove the single CRITICAL frontend finding, an `as any` cast in `ProgramsPage.tsx` that defeats TypeScript's type checking on the `addProgram` mutation call. Define a properly typed `ProgramForm` interface in the shared types file and update the component to use it as the state type, eliminating the need for the unsafe cast entirely.

**Context:**

Per **Decision 1 (State Management)**: Form state must be typed with a TypeScript interface. The interface must live in a shared types file, not inline in the component. Custom hooks are preferred for mutation logic, but for Phase A the minimum acceptable fix is removing the `as any` cast and introducing the typed interface, the custom hook extraction is a Phase B item (FE-005).

Per **Decision 7 (Error Handling)**: The codebase must not contain `as any` type assertions on data passed to service functions. If a type mismatch exists between the form state and the `addProgram` function signature, fix the function signature rather than casting.

**Step-by-Step Instructions:**

1. Open `frontend/src/types/index.ts`. At the end of the file (or in a logically grouped location with other form/request types), add the following:
   ```typescript
   /**
    * Form state type for the Add Program form in ProgramsPage.
    * All fields are strings because HTML inputs return string values.
    * accreditation_expires is an ISO date string or empty string.
    */
   export interface ProgramForm {
     institution_name: string;
     program_name: string;
     accreditation_body: string;
     accreditation_type: string;
     state: string;
     accreditation_expires: string;
   }

   /** Default (empty) state for the ProgramForm. */
   export const DEFAULT_PROGRAM_FORM: ProgramForm = {
     institution_name: "",
     program_name: "",
     accreditation_body: "",
     accreditation_type: "",
     state: "",
     accreditation_expires: "",
   };
   ```

2. Open `frontend/src/pages/ProgramsPage.tsx`. Make the following changes:

   a. Add the following imports at the top of the file (alongside or after existing imports from `../types`):
      ```typescript
      import { ProgramForm, DEFAULT_PROGRAM_FORM } from "../types";
      ```
      If `../types` is already imported, add `ProgramForm` and `DEFAULT_PROGRAM_FORM` to the existing import statement.

   b. Locate the `useState` call that initializes the form state. It will look similar to:
      ```typescript
      const [form, setForm] = useState({ institution_name: "", ... });
      ```
      Change it to:
      ```typescript
      const [form, setForm] = useState<ProgramForm>(DEFAULT_PROGRAM_FORM);
      ```

   c. Locate the `mutationFn` line that contains `as any`. It will look similar to:
      ```typescript
      mutationFn: () => addProgram({ ...form, accreditation_expires: form.accreditation_expires || null } as any),
      ```
      Replace it with:
      ```typescript
      mutationFn: () =>
        addProgram({
          ...form,
          accreditation_expires: form.accreditation_expires || null,
        }),
      ```
      Do not add `as any`. If TypeScript now reports a type error on the `addProgram` call, proceed to step 3.

   d. Locate any form reset call that reconstructs the initial state object inline, such as:
      ```typescript
      setForm({ institution_name: "", program_name: "", ... });
      ```
      Replace it with:
      ```typescript
      setForm(DEFAULT_PROGRAM_FORM);
      ```

3. If step 2c causes a TypeScript error because `addProgram()` does not accept `{ accreditation_expires: string | null }` (or similar), open `frontend/src/services/programClient.ts` (or wherever `addProgram` is defined). Update the parameter type of `addProgram` to accept the shape produced by the spread above. For example, if it currently accepts `Program` (the API response type), create a separate `AddProgramRequest` interface that matches the request body shape and use that as the parameter type. Fix the root type mismatch, do not introduce another `as any`.

4. From the `frontend/` directory, run `npx tsc --noEmit`. If it reports errors, fix each error by correcting the actual type rather than casting. Do not introduce any new `as any` assertions anywhere.

**Patterns to Follow:**

```typescript
// CORRECT, typed state with interface:
const [form, setForm] = useState<ProgramForm>(DEFAULT_PROGRAM_FORM);

// CORRECT, typed reset uses the constant:
const resetForm = () => setForm(DEFAULT_PROGRAM_FORM);

// CORRECT, mutation call without cast:
mutationFn: () => addProgram({
  ...form,
  accreditation_expires: form.accreditation_expires || null,
}),

// NEVER, removes type safety entirely:
mutationFn: () => addProgram({ ...form } as any),

// NEVER, inline anonymous type with cast:
const [form, setForm] = useState({} as any);
```

**Files in Scope:**
- `frontend/src/types/index.ts`
- `frontend/src/pages/ProgramsPage.tsx`
- `frontend/src/services/programClient.ts` (only if `addProgram`'s type signature requires correction, do not change this file unless a TypeScript error forces it)

**Files Out of Scope:**
- All other frontend files
- All backend files

**Definition of Done:**
- `npx tsc --noEmit` run from the `frontend/` directory exits with code 0 and zero errors
- `grep "as any" frontend/src/pages/ProgramsPage.tsx` returns empty output (no matches)
- `frontend/src/types/index.ts` contains an exported `interface ProgramForm` with exactly 6 fields, all typed as `string`
- `frontend/src/types/index.ts` contains an exported constant `DEFAULT_PROGRAM_FORM` typed as `ProgramForm`
- The `useState` call in `ProgramsPage.tsx` is written as `useState<ProgramForm>(DEFAULT_PROGRAM_FORM)` with the explicit type parameter

**Completion Report Template:**
```
## Frontend Critical Agent Phase A, Completion Report

### Type Safety Fix (FE-001)
- [ ] ProgramForm interface added to frontend/src/types/index.ts with 6 string fields
- [ ] DEFAULT_PROGRAM_FORM constant added to frontend/src/types/index.ts
- [ ] ProgramsPage.tsx useState typed as useState<ProgramForm>(DEFAULT_PROGRAM_FORM)
- [ ] as any cast removed from addProgram() call in ProgramsPage.tsx
- [ ] Form reset updated to use DEFAULT_PROGRAM_FORM constant
- [ ] npx tsc --noEmit exits 0 with zero errors

### Secondary Changes (if applicable)
- [ ] programClient.ts type signature updated (only if TypeScript error required it)
  - describe change if made: [...]

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

### Agent: UI/UX Foundation Agent
**Phase:** A
**Finding IDs Addressed:** UX-001, UX-002

**Task Summary:** Establish the design token system that all subsequent Phase B UI/UX work will depend on. Wire the CSS custom properties already defined in `index.css` into `tailwind.config.js` as named theme tokens so that Tailwind utility classes like `text-accent` and `bg-surface` reference the design system values. Update the navigation bar in `App.tsx`, the most prominent instance of raw hardcoded color classes, to use the new semantic token classes. Produce a `DESIGN_TOKENS.md` reference document so Phase B agents have a single source of truth.

**Context:**

Per **Decision 2 (Styling)**: CSS custom properties defined on `:root` in `index.css` are the single source of truth for all colors. `tailwind.config.js` must extend these via `var(--token-name)` references. No arbitrary Tailwind values (e.g., `bg-[#aa3bff]`) are permitted. No `style={{}}` inline props are permitted for design system values. Semantic class names must derive from the token names (e.g., token `--accent` → Tailwind class `text-accent`). `@apply` utilities are acceptable for commonly-repeated multi-class patterns.

**Step-by-Step Instructions:**

1. Open `frontend/src/index.css`. Read all CSS custom properties defined on `:root` (typically in the first 50-60 lines). Make an exact list of every `--` property name and its default value. Expected properties include but may not be limited to: `--accent`, `--accent-bg`, `--surface`, `--surface-2`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`. Record each one.

2. Still in `frontend/src/index.css`, add the following status semantic tokens to the `:root` block if they are not already present (add them at the end of the existing `:root` block):
   ```css
   --status-success: #16a34a;
   --status-warning: #d97706;
   --status-error: #dc2626;
   --status-info: #2563eb;
   --status-neutral: #6b7280;
   ```
   These tokens exist in the audit-reported design system and are referenced by Phase B agents for status badge and alert components.

3. Still in `frontend/src/index.css`, add an `@layer utilities` block at the end of the file (outside `:root` and any existing layer blocks) with the following utility classes:
   ```css
   @layer utilities {
     .page-container {
       @apply max-w-5xl mx-auto py-10 px-4;
     }
     .card {
       @apply bg-surface border border-border rounded-lg p-6;
     }
     .nav-link-active {
       @apply text-accent border-b-2 border-accent pb-0.5;
     }
     .nav-link-inactive {
       @apply text-text-secondary hover:text-accent;
     }
   }
   ```
   These utilities reference the token class names that will be configured in the next step. They will only resolve correctly after `tailwind.config.js` is updated.

4. Open `frontend/tailwind.config.js`. Replace the `extend: {}` block with a complete theme extension that maps every CSS custom property recorded in step 1, plus the five status tokens added in step 2. The result must look like this (substitute the actual property names you found in step 1; do not omit any):
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {
         colors: {
           // Core design tokens, map every CSS custom property from index.css :root
           accent: 'var(--accent)',
           'accent-bg': 'var(--accent-bg)',
           surface: 'var(--surface)',
           'surface-2': 'var(--surface-2)',
           border: 'var(--border)',
           'text-primary': 'var(--text-primary)',
           'text-secondary': 'var(--text-secondary)',
           'text-muted': 'var(--text-muted)',
           // Add any additional tokens found in step 1 here
           // Semantic status tokens
           status: {
             success: 'var(--status-success)',
             warning: 'var(--status-warning)',
             error: 'var(--status-error)',
             info: 'var(--status-info)',
             neutral: 'var(--status-neutral)',
           },
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
         },
       },
     },
     plugins: [],
   }
   ```
   Important: Read `index.css` first (step 1) and include every CSS custom property you find. If `index.css` defines `--bg`, `--fg`, or any other token not in the list above, add it to the `colors` block as well. The token mapping in `tailwind.config.js` must be exhaustive.

5. Open `frontend/src/App.tsx`. Locate the navigation bar's `NavLink` components. Find the `className` callback that currently contains hardcoded color strings such as `text-blue-600`, `border-blue-600`, `text-gray-600`, `hover:text-blue-600`. Replace the entire callback with:
   ```typescript
   className={({ isActive }: { isActive: boolean }) =>
     isActive ? "nav-link-active" : "nav-link-inactive"
   }
   ```
   Also locate the container element of the navigation bar (a `<nav>` or `<header>` or outer `<div>`). Find the classes `bg-white border-b border-gray-200` (or similar hardcoded white/gray classes). Replace them with `bg-surface border-b border-border`.

6. Run `npx tsc --noEmit` from the `frontend/` directory. Fix any TypeScript errors introduced by the changes, most likely none, since the changes are CSS classes and config only. Do not introduce `as any`.

7. Create the file `frontend/docs/DESIGN_TOKENS.md`. Create the `frontend/docs/` directory if it does not exist. The file must document every token in the following format:

   ```markdown
   # MSBON Design Token Reference

   **Source of truth:** `frontend/src/index.css` `:root` block
   **Last updated:** 2026-03-29

   All Tailwind utility classes in this project must use the tokens listed below
   rather than raw Tailwind color/gray/blue classes. Phase B agents: refer to this
   document before writing any new className strings.

   ## Color Tokens

   | Token Name      | CSS Variable        | Default Value | Tailwind Class       | Intended Use                          |
   |-----------------|---------------------|---------------|----------------------|---------------------------------------|
   | accent          | --accent            | #aa3bff       | text-accent, bg-accent, border-accent | Primary brand color; active links, buttons, focus rings |
   | accent-bg       | --accent-bg         | [value]       | bg-accent-bg         | Subtle background for accent-tinted sections |
   | surface         | --surface           | [value]       | bg-surface           | Card and panel backgrounds            |
   | surface-2       | --surface-2         | [value]       | bg-surface-2         | Nested surfaces; secondary panels     |
   | border          | --border            | [value]       | border-border        | All border colors                     |
   | text-primary    | --text-primary      | [value]       | text-text-primary    | Primary body text                     |
   | text-secondary  | --text-secondary    | [value]       | text-text-secondary  | Secondary/subtext, inactive nav links |
   | text-muted      | --text-muted        | [value]       | text-text-muted      | Captions, timestamps, disabled labels |
   | status-success  | --status-success    | #16a34a       | text-status-success  | Success states, CLEAR badge           |
   | status-warning  | --status-warning    | #d97706       | text-status-warning  | Warning states, NEEDS_MORE_INFO badge |
   | status-error    | --status-error      | #dc2626       | text-status-error    | Error states, FLAGGED badge           |
   | status-info     | --status-info       | #2563eb       | text-status-info     | Informational states                  |
   | status-neutral  | --status-neutral    | #6b7280       | text-status-neutral  | Neutral/unknown states                |

   ## Utility Classes (@apply shortcuts)

   | Class              | Expands To                                     | Use When                           |
   |--------------------|------------------------------------------------|------------------------------------|
   | .page-container    | max-w-5xl mx-auto py-10 px-4                   | Outermost page content wrapper     |
   | .card              | bg-surface border border-border rounded-lg p-6 | Any card/panel component           |
   | .nav-link-active   | text-accent border-b-2 border-accent pb-0.5    | Active navigation link             |
   | .nav-link-inactive | text-text-secondary hover:text-accent          | Inactive navigation link           |

   ## Rules for Phase B Agents

   - **Never** use `text-blue-600`, `bg-white`, `border-gray-200`, or any hardcoded
     Tailwind color class. Use the semantic tokens above.
   - **Never** use `style={{ color: "#aa3bff" }}` or similar inline styles.
   - **Never** add new color values without first adding them to `index.css` `:root`
     and `tailwind.config.js`.
   - When in doubt, check this document and `index.css` before choosing a color class.
   ```
   Fill in the actual default values from `index.css` for each `[value]` placeholder in the table above. If `index.css` defines additional tokens beyond the list above, add rows for them.

**Patterns to Follow:**

```typescript
// BEFORE (hardcoded Tailwind raw color):
className={({ isActive }) =>
  isActive
    ? "text-blue-600 border-b-2 border-blue-600 pb-0.5"
    : "text-gray-600 hover:text-blue-600"
}

// AFTER (semantic token classes):
className={({ isActive }) =>
  isActive ? "nav-link-active" : "nav-link-inactive"
}

// BEFORE (hardcoded container):
<nav className="bg-white border-b border-gray-200 px-6 py-4">

// AFTER (token-based container):
<nav className="bg-surface border-b border-border px-6 py-4">

// NEVER use arbitrary values:
className="bg-[#aa3bff]"   // wrong
className="bg-accent"      // correct
```

**Files in Scope:**
- `frontend/tailwind.config.js`
- `frontend/src/index.css`
- `frontend/src/App.tsx`
- `frontend/docs/DESIGN_TOKENS.md` (CREATE)
- `frontend/docs/` directory (CREATE if absent)

**Files Out of Scope:**
- All other frontend component files, Phase B agents will migrate components to the token system
- All backend files

**Definition of Done:**
- `frontend/tailwind.config.js` has `theme.extend.colors` with at minimum 8 semantic color tokens all mapped to `var(--token-name)` CSS variable references
- All tokens present in `tailwind.config.js` are defined on `:root` in `frontend/src/index.css`
- `frontend/src/App.tsx` NavLink className callbacks use `nav-link-active` and `nav-link-inactive` instead of `text-blue-600 border-blue-600` or similar
- `frontend/src/App.tsx` nav container uses `bg-surface` and `border-border` instead of `bg-white` and `border-gray-200`
- `frontend/docs/DESIGN_TOKENS.md` exists and documents every token with its CSS variable name, default value, Tailwind class name, and intended use
- `npx tsc --noEmit` exits with code 0 and zero errors after all changes

**Completion Report Template:**
```
## UI/UX Foundation Agent Phase A, Completion Report

### Design Token System (UX-001, UX-002)
- [ ] tailwind.config.js extended with N semantic color tokens (state actual count: N = ___)
- [ ] All N tokens map to CSS custom properties defined in index.css :root
- [ ] Status semantic tokens added to index.css :root (success/warning/error/info/neutral)
- [ ] @apply utilities added to index.css: page-container, card, nav-link-active, nav-link-inactive
- [ ] App.tsx NavLink updated: nav-link-active / nav-link-inactive replace hardcoded blue/gray
- [ ] App.tsx nav container updated: bg-surface / border-border replace bg-white / border-gray-200
- [ ] frontend/docs/DESIGN_TOKENS.md created and documents all N tokens

### Verification
- [ ] npx tsc --noEmit passes with 0 errors
- [ ] Application navigates correctly after changes (nav visually unchanged using --accent CSS var)

### Blockers Encountered:
[list any blocking issues here]

### Files Changed:
[list every file modified or created]
```

---

## Appendix: Finding Count Carried Forward

### Phase 1 → Phase 2 Finding Reconciliation

| Domain   | Phase 1 Stated | Confirmed in Blueprint | Delta | Notes |
|----------|---------------|------------------------|-------|-------|
| Frontend | 35 | 35 (FE-001 to FE-035) | 0 | ✓ Exact match |
| Backend  | 23 | 23 (BE-001 to BE-023) | 0 | ✓ Exact match |
| Database | 26 | 25 (DB-001 to DB-025) | **-1** | See note below |
| Security | 22 | 22 (SEC-001 to SEC-022) | 0 | ✓ Exact match |
| UI/UX    | 30 | 30 (UX-001 to UX-030) | 0 | ✓ Exact match |
| DevOps   | 17 | 17 (DO-001 to DO-017) | 0 | ✓ Exact match |
| **TOTAL**| **153** | **152** | **-1** | See note below |

### Database Domain Discrepancy, Audit Note

The Phase 1 Audit Report summary table states:
> Database: 11 Critical + 8 Major + 7 Minor = **26 total**

The Phase 1 report body contains findings **DB-001 through DB-025** (25 findings). The sub-agent's summary breakdown states 8 Major, but only 6 Major findings (DB-012 through DB-017) appear in the report body. The sub-agent's Minor count states 7, but 8 Minor findings are present (DB-006, DB-019–DB-025), including DB-024 which is informational with no fix required.

**Conclusion:** The Phase 1 Database domain summary contains an **arithmetic error in the severity breakdown** (Major stated as 8, actual is 6; Minor stated as 7, actual is 8 including DB-024). The finding bodies themselves are complete, DB-001 through DB-025 represent every distinct database finding. No finding has been dropped from this blueprint. All 25 Database findings are assigned to implementation phases. The one-finding gap between Phase 1's stated total (153) and this blueprint's confirmed count (152) is attributable to this Phase 1 summary arithmetic error, **not** to any finding being omitted here.

### Phase Status Summary

| Status | Count | Meaning |
|--------|-------|---------|
| Queued (Phase A) | 17 tasks covering 27 finding IDs | Execute first, nothing else starts |
| Queued (Phase B) | 40 tasks covering ~90 finding IDs | Architecture and structural work |
| Queued (Phase C) | ~41 tasks covering ~34 finding IDs | Polish, minor fixes, test coverage |
| Deferred | 1 finding (SEC-022) | Infrastructure decision required, human review |
| **Total Accounted** | **152 findings** | **All carried forward, none dropped** |

### Blueprint Validity Statement

> Every finding from the Phase 1 Audit Report has been assigned to exactly one implementation phase or explicitly deferred with written rationale. No finding has been paraphrased beyond its Phase 1 summary, dropped, or merged without notation. This blueprint is the authoritative input to Phase 3 implementation agents.

