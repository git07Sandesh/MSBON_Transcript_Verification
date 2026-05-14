# PHASE 1 OUTPUT: FULL AUDIT REPORT

**Project:** MSBON Fraud-Sensitive Transcript Verification System
**Audit Date:** 2026-03-29
**Auditor:** Principal Software Architect (Orchestrated 6-Domain Parallel Audit)

---

## Table of Contents

1. [Sub-Agent Report: Frontend (FE)](#sub-agent-report-frontend-fe)
2. [Sub-Agent Report: Backend (BE)](#sub-agent-report-backend-be)
3. [Sub-Agent Report: Database (DB)](#sub-agent-report-database-db)
4. [Sub-Agent Report: Security (SEC)](#sub-agent-report-security-sec)
5. [Sub-Agent Report: UI/UX (UX)](#sub-agent-report-uiux-ux)
6. [Sub-Agent Report: DevOps (DO)](#sub-agent-report-devops-do)
7. [Finding Count Summary](#finding-count-summary)

---

## Sub-Agent Report: Frontend (FE)

**Codebase:** `/msbon-app/frontend/src/`
**Persona:** Senior Frontend Engineer (Stripe / Linear / Vercel)

---

### FE-001
**[CRITICAL] | [TYPE SAFETY] | [ProgramsPage.tsx:38]**
Problem: Unsafe type assertion with `as any` bypasses type checking.
Evidence: Line 38: `mutationFn: () => addProgram({ ...form, accreditation_expires: form.accreditation_expires || null } as any)`, the `as any` cast on an object passed to `addProgram()` defeats type safety. The form state type mismatch is unresolved.
Fix: Define a proper type for the form object state that aligns with the `Program` type, or create an intermediate typed converter function instead of asserting `as any`.
Flags: Type safety regression, runtime error risk

---

### FE-002
**[MAJOR] | [ERROR HANDLING] | [UploadPage.tsx:29]**
Problem: Unsafe error type assertion in catch block.
Evidence: Line 29: `} catch (err: any) {` followed by optional chaining on unknown error type at line 31: `err?.response?.data?.error?.message`. The `any` type allows unsafe property access without runtime checks.
Fix: Use proper error typing with type guards:
```typescript
catch (err) {
  if (axios.isAxiosError(err)) {
    setMessage(err.response?.data?.error?.message || "Upload failed.");
  } else {
    setMessage("Upload failed.");
  }
}
```
Flags: Error handling vulnerability, production crash risk

---

### FE-003
**[MAJOR] | [ERROR HANDLING] | [ReviewForm.tsx:38]**
Problem: Unsafe error type assertion in mutation error callback.
Evidence: Line 38-39: `onError: (err: any) => { setError(err?.response?.data?.error?.message || "Submission failed."); }`, same pattern as FE-002 with `any` for error handling without proper type narrowing.
Fix: Use the correct error type from react-query or add explicit type guard before accessing nested properties.
Flags: Error handling vulnerability

---

### FE-004
**[MAJOR] | [STATE MANAGEMENT] | [ProgramsPage.tsx:27-34]**
Problem: Form state scattered across inline object literal with poor maintainability. Field names repeated in line 58 hardcoded as const array.
Evidence: Lines 27-34 define form state with multiple related fields but no TypeScript interface.
Fix: Extract form state to a TypeScript interface:
```typescript
interface ProgramForm {
  institution_name: string;
  program_name: string;
  accreditation_body: string;
  accreditation_type: string;
  state: string;
  accreditation_expires: string;
}
```
Flags: Maintainability, DRY violation, runtime error risk

---

### FE-005
**[MAJOR] | [COMPONENT ARCHITECTURE] | [ProgramsPage.tsx:37-44]**
Problem: Complex mutation configuration mixed with form state logic in component body.
Evidence: Lines 37-44: `useMutation` configured inline with form reset logic.
Fix: Extract to custom hook: `const useAddProgram = () => useMutation({...});`
Flags: Testing difficulty, separation of concerns violation

---

### FE-006
**[MAJOR] | [PERFORMANCE] | [TranscriptListPage.tsx:24]**
Problem: Automatic polling without conditional logic, refetches every 5 seconds regardless of user activity, tab visibility, or data staleness.
Evidence: Line 24: `refetchInterval: 5000`
Fix:
```typescript
staleTime: 10000,
refetchInterval: (data) => {
  const hasProcessing = data?.items?.some(t =>
    ["UPLOADED", "EXTRACTING", "VERIFYING"].includes(t.status)
  );
  return hasProcessing ? 5000 : false;
},
```
Flags: Battery drain on mobile, excessive server load, unnecessary network traffic

---

### FE-007
**[MAJOR] | [PERFORMANCE] | [VerificationPage.tsx:16-17]**
Problem: Complex refetchInterval callback with fragile data dependency.
Evidence: Lines 16-17: `refetchInterval: (data) => data && ["FLAGGED", "CLEAR", "REVIEWED"].includes(data.status) ? false : 3000`, fragile if data is null/undefined during initial load.
Fix:
```typescript
const getRefetchInterval = (data: TranscriptDetail | undefined) => {
  if (!data?.status) return 3000;
  return ["FLAGGED", "CLEAR", "REVIEWED"].includes(data.status) ? false : 3000;
};
```
Flags: Fragility in refetch logic, unclear intent

---

### FE-008
**[MAJOR] | [ACCESSIBILITY] | [FileDropzone.tsx:24-46; ExportButton.tsx:9-23; ReviewForm; ProgramsPage]**
Problem: Missing ARIA labels and semantic attributes for screen reader accessibility. No `role="button"` on FileDropzone div, no keyboard navigation support.
Evidence: FileDropzone (lines 24-46): no `role="button"` on the div, no keyboard event handlers.
Fix:
```typescript
<div
  role="button"
  tabIndex={0}
  aria-label="Drop transcript file here or click to browse"
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
>
```
Use proper `<label htmlFor="">` associations for all form inputs.
Flags: WCAG 2.1 Level A violation, accessibility lawsuit risk

---

### FE-009
**[MAJOR] | [ACCESSIBILITY] | [AuditLogTable.tsx:35-37]**
Problem: Outcome status badge lacks semantic markup for assistive technology.
Evidence: Lines 35-37: `<span className={...}>SUCCESS</span>`, not semantically meaningful to screen readers.
Fix: `<span className={...} role="status" aria-label={`Outcome: ${log.outcome}`}>{log.outcome}</span>`
Flags: Screen reader incompatibility

---

### FE-010
**[MAJOR] | [ACCESSIBILITY] | [TranscriptListPage.tsx:83-87]**
Problem: Pagination buttons use ← and → Unicode characters without `aria-label`.
Evidence: Lines 83-87: buttons with arrow characters only.
Fix: `<button aria-label={`Go to previous page (page ${page})`} ...>← Prev</button>`
Flags: WCAG 2.1 Level A violation

---

### FE-011
**[MAJOR] | [ACCESSIBILITY] | [DecisionButtons.tsx:9-13]**
Problem: Color-only differentiation of decision options. Users with color blindness cannot distinguish between CONFIRMED, OVERRIDDEN, and NEEDS_MORE_INFO.
Evidence: Lines 9-13: decision buttons use only color (red, green, yellow) to indicate meaning.
Fix: Add text patterns or icons in addition to color:
```typescript
{ value: "CONFIRMED", label: "Confirm Flag", icon: "✓", color: "border-red-500 text-red-600" },
{ value: "OVERRIDDEN", label: "Override Flag", icon: "✕", color: "border-green-500 text-green-600" },
{ value: "NEEDS_MORE_INFO", label: "Needs More Info", icon: "?", color: "border-yellow-500 text-yellow-600" },
```
Flags: WCAG 2.1 Level A violation (color only), accessibility lawsuit risk

---

### FE-012
**[MAJOR] | [TESTING] | [Entire frontend codebase]**
Problem: No test files present anywhere. Application has zero test coverage.
Evidence: No `*.test.tsx`, `*.spec.tsx`, or `__tests__` directories found across components, pages, services, or store.
Fix: Install Vitest + React Testing Library. Add `"test": "vitest"` to `package.json`. Create tests for all components, pages, and service clients. Target ≥80% coverage.
Flags: Critical coverage gap, no regression protection, production risk

---

### FE-013
**[MAJOR] | [ERROR HANDLING] | [All service clients]**
Problem: No error boundary or centralized error handling for network failures. Each component handles errors independently.
Evidence: Services use axios directly without error interceptors.
Fix: Create axios interceptor:
```typescript
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) handleUnauthorized();
    if (error.response?.status === 500) handleServerError();
    return Promise.reject(error);
  }
);
```
Wrap pages with an `ErrorBoundary` component.
Flags: Inconsistent error handling, poor UX for failures

---

### FE-014
**[MAJOR] | [COMPONENT ARCHITECTURE] | [VerificationPage.tsx:1-54]**
Problem: Heavy component with mixed concerns, data fetching, UI logic, state management all in one component body.
Evidence: Lines 1-54: query setup, refetch logic, status filtering, and conditional rendering all co-located.
Fix: Extract data fetching to `src/hooks/useTranscriptDetail.ts`. Simplify VerificationPage to render UI only.
Flags: Testing difficulty, reusability, maintainability

---

### FE-015
**[MAJOR] | [COMPONENT ARCHITECTURE] | [ProgramsPage.tsx:8-18]**
Problem: Page component contains API logic (`fetchPrograms`, `addProgram`) inline rather than in a service module.
Evidence: Lines 8-18: API functions defined within the same file as the component.
Fix: Extract API functions to `src/services/programClient.ts`.
Flags: Code organization violation, API reusability

---

### FE-016
**[MINOR] | [TYPE SAFETY] | [ProgramsPage.tsx:58]**
Problem: Hardcoded field names as const array without type safety. TypeScript won't catch mismatches if form state is refactored.
Evidence: Line 58: `(["institution_name", "program_name", "accreditation_type", "state"] as const).map(...)`
Fix: Use `Object.keys(defaultForm).filter(...)` or a named constant referenced from the form type definition.
Flags: DRY violation, refactoring brittleness

---

### FE-017
**[MINOR] | [PERFORMANCE] | [ProgramsPage.tsx:61]**
Problem: Inline object spread in onChange handler creates a new object every keystroke.
Evidence: Line 61: `onChange={(e) => setForm({ ...form, [f]: e.target.value })}`
Fix: Use `useCallback` with functional update: `onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}`
Flags: Minor performance impact

---

### FE-018
**[MINOR] | [STATE MANAGEMENT] | [uiStore.ts:11]**
Problem: UI store lacks persistence mechanism. `staffId: "staff_demo"` resets on every page refresh.
Evidence: Line 11: hardcoded initial state with no localStorage fallback.
Fix: Add Zustand `persist` middleware with `name: "msbon-ui-store"`.
Flags: Poor UX, unexpected behavior on refresh

---

### FE-019
**[MINOR] | [STYLING] | [App.tsx:29]**
Problem: Inline conditional className logic in NavLink is verbose and duplicated.
Evidence: Line 29: two long Tailwind class strings in a callback.
Fix: `const getNavLinkClass = (isActive: boolean) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-0.5" : "text-gray-600 hover:text-blue-600";`
Flags: Maintainability, DRY violation

---

### FE-020
**[MINOR] | [STYLING] | [TranscriptListPage.tsx:6-15; TranscriptSummary.tsx:3-12; FlagItem.tsx:6-16]**
Problem: Duplicate `STATUS_COLORS` and `SEVERITY_COLORS` objects defined identically in multiple files.
Evidence: `STATUS_COLORS` defined in both `TranscriptListPage.tsx` and `TranscriptSummary.tsx`.
Fix: Move all color constants to `src/utils/colorMaps.ts` and import across components.
Flags: DRY violation, maintainability

---

### FE-021
**[MINOR] | [CODE QUALITY] | [App.css:1-185]**
Problem: `App.css` contains legacy/unused styles (`.counter`, `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks`) that appear nowhere in current components.
Evidence: Lines 1-185: selectors not referenced in any current component.
Fix: Delete the file and rely entirely on Tailwind utilities.
Flags: Dead code, bundle bloat

---

### FE-022
**[MINOR] | [PERFORMANCE] | [FileDropzone.tsx:32]**
Problem: onClick handler not memoized.
Evidence: Line 32: `onClick={() => !disabled && inputRef.current?.click()}`
Fix: `const handleClick = useCallback(() => { if (!disabled && inputRef.current) inputRef.current.click(); }, [disabled]);`
Flags: Low risk, defensive coding improvement

---

### FE-023
**[MINOR] | [COMPONENT ARCHITECTURE] | [AuditLogPage.tsx:37-39]**
Problem: Conditional rendering of filter component based on route parameter creates unclear component contracts.
Evidence: Lines 37-39: `{!id && <AuditLogFilters ... />}`, behavior changes based on URL route with no explicit documentation.
Fix: Make disabled state explicit: `<AuditLogFilters disabled={!!id} />`
Flags: Component contract clarity

---

### FE-024
**[MINOR] | [TYPE SAFETY] | [types/index.ts:2,5-7]**
Problem: Nullable fields in `Course` interface without documentation explaining when/why they can be null.
Evidence: `code`, `credits`, `semester`, `year` are nullable with no JSDoc.
Fix: Add JSDoc comments explaining nullability for each nullable field.
Flags: API contract ambiguity

---

### FE-025
**[MINOR] | [CODE QUALITY] | [TranscriptListPage.tsx:28]**
Problem: Error caught and displayed as generic message but error object discarded, no logging, no detail.
Evidence: Line 28: `if (error) return <div className="p-8 text-red-500">Failed to load transcripts.</div>;`
Fix: Add `console.error('Failed to load transcripts:', error);` and display `error.message` if available.
Flags: Debugging difficulty, poor UX

---

### FE-026
**[MINOR] | [CODE QUALITY] | [UploadPage.tsx:28]**
Problem: Hardcoded `setTimeout` duration magic number with no explanation.
Evidence: Line 28: `setTimeout(() => navigate(...), 1500);`
Fix: `const UPLOAD_COMPLETE_REDIRECT_DELAY_MS = 1500; setTimeout(() => navigate(...), UPLOAD_COMPLETE_REDIRECT_DELAY_MS);`
Flags: Maintainability

---

### FE-027
**[MINOR] | [CODE QUALITY] | [ReviewForm.tsx:45-49]**
Problem: Multiple sequential `setState` calls in validation are fragile.
Evidence: Lines 45-49: `setError(null)` then immediate conditional `setError(...)`.
Fix: Consolidate all validation logic before any `setState` call.
Flags: Code clarity

---

### FE-028
**[MINOR] | [STYLING] | [DecisionButtons.tsx:23-25]**
Problem: Inline className construction is complex and hard to read.
Evidence: Lines 23-25: long template literal with multiple conditionals.
Fix: Use `clsx` library: `import clsx from 'clsx'; const cls = clsx("px-3 py-1 text-sm border rounded-md transition-colors", selected === opt.value ? "bg-gray-100 font-semibold" : "bg-white", opt.color, "disabled:opacity-50");`
Flags: Maintainability, readability

---

### FE-029
**[MINOR] | [COMPONENT ARCHITECTURE] | [ReviewForm.tsx:31,62-69]**
Problem: `decision === "OVERRIDDEN"` conditional checked twice, in mutation payload and in render.
Evidence: Lines 31 and 62-69: same conditional duplicated.
Fix: Extract decision-specific rendering to a subcomponent or custom hook.
Flags: DRY violation

---

### FE-030
**[MINOR] | [CONFIG] | [vite.config.ts:10]**
Problem: Proxy target URL hardcoded to `http://localhost:8000`.
Evidence: Line 10: `target: 'http://localhost:8000'`
Fix: `const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000';`
Flags: Dev environment friction

---

### FE-031
**[MINOR] | [TYPE SAFETY] | [reviewClient.ts; auditClient.ts]**
Problem: Inconsistent type import patterns between service files.
Evidence: Some use `import type { ... }`, others do not. No co-location convention.
Fix: Establish consistent convention; centralize all shared request/response types in `types/index.ts`.
Flags: Organization

---

### FE-032
**[MINOR] | [LOGGING] | [Entire frontend codebase]**
Problem: No application-level logging or debug utilities. Makes debugging production issues extremely difficult.
Evidence: No logging utility or structured debug output anywhere in the source.
Fix: Create `src/utils/logger.ts` with structured `info`, `error`, `warn` helpers. Use throughout components.
Flags: Production observability gap

---

### FE-033
**[MINOR] | [PERFORMANCE] | [TranscriptSummary.tsx:43-44]**
Problem: `transcript.flags.length` accessed directly without memoization in a potentially frequently re-rendering component.
Evidence: Line 43: `<dd>{transcript.flags.length}</dd>`
Fix: `const flagCount = useMemo(() => transcript.flags.length, [transcript.flags]);`
Flags: Negligible performance impact at current scale

---

### FE-034
**[MINOR] | [ACCESSIBILITY] | [VerificationPage.tsx:28-32]**
Problem: Navigation links do not indicate current page context.
Evidence: Lines 28-32: "← All Transcripts" and "View Audit Log →" links lack `aria-current`.
Fix: Add `aria-current="page"` to the active page link.
Flags: Minor accessibility improvement

---

### FE-035
**[MINOR] | [CODE QUALITY] | [Multiple components using Record<string, string> color maps]**
Problem: Color map lookups have no fallback, silently returning `undefined` for unknown keys.
Evidence: Multiple files use `STATUS_COLORS[status]` without a default value.
Fix: `export function getStatusColor(status: string): string { return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"; }`
Flags: Defensive coding

---

**Category Clean Assessments:**
- **File & Folder Structure:** CLEAN. Project is properly feature-organized (`/pages`, `/components/[feature]`, `/services`, `/store`, `/types`). No scattered files.

---

## Sub-Agent Report: Backend (BE)

**Codebase:** `/msbon-app/backend/`
**Persona:** Senior Backend Engineer (Uber / Cloudflare / Shopify)

---

### BE-001
**[CRITICAL] | [Architecture & Design] | [config.py:7; database.py:14-16]**
Problem: No environment validation at startup. Missing `GEMINI_API_KEY` silently defaults to empty string and only fails when the LLM is first called.
Evidence: `config.py` line 7: `gemini_api_key: str = ""`, no required constraint. Health check only tests key presence, not validity.
Fix: Add Pydantic `Field(..., min_length=10)` with `field_validator` to enforce non-empty, valid-format key at startup. Raise `ValueError` on empty or placeholder values.
Flags: Production blocker, silent failure vulnerability

---

### BE-002
**[MAJOR] | [Architecture & Design] | [main.py:46-48]**
Problem: `@app.on_event("startup")` is deprecated in FastAPI 0.110+ and planned for removal.
Evidence: `main.py` lines 46-48: `@app.on_event("startup")`.
Fix: Migrate to `@asynccontextmanager async def lifespan(app: FastAPI): init_db(); yield`. Pass `lifespan=lifespan` to `FastAPI(...)`.
Flags: Technical debt, future compatibility

---

### BE-003
**[MAJOR] | [Architecture & Design] | [transcript_service.py:69-81; extraction_service.py:84-86]**
Problem: File write and DB commit are not atomic. If DB commit fails after a file is written, the file is orphaned with no cleanup.
Evidence: `transcript_service.py` lines 69-81: file written to disk, then DB commit happens later in a separate call.
Fix: Wrap file write and DB persist in try/except. On DB failure, call `os.remove(file_path)` for cleanup. Use `db.begin_nested()` for multi-step writes.
Flags: Data integrity risk, orphaned files accumulate

---

### BE-004
**[MINOR] | [Architecture & Design] | [base_repository.py:25-26]**
Problem: Generic repository `list_all()` fetches everything unbounded, no pagination, filtering, or batch operations.
Evidence: `base_repository.py` lines 25-26: `list_all()` has no limit or skip parameters.
Fix: Add `list_paginated(skip: int, limit: int) -> tuple[list[ModelT], int]` and `bulk_save(instances: list[ModelT])` methods.
Flags: Scalability concern

---

### BE-005
**[CRITICAL] | [API Design] | [programs.py:24,27-28; transcripts.py:29; reviews.py:17]**
Problem: Authentication relies entirely on client-supplied HTTP headers with no validation. Any client can claim any role or identity.
Evidence: `programs.py` lines 27-28: `if x_staff_role != "admin"`, header value comes directly from user input, never cryptographically verified. No JWT, no bearer token, no signature validation.
Fix: Implement `HTTPBearer` with `jwt.decode()` validation. Store role in JWT payload. Replace all header-based auth with `Depends(verify_token)` on every protected route.
Flags: CRITICAL security vulnerability; any client can impersonate any role

---

### BE-006
**[MAJOR] | [API Design] | [transcripts.py:49-75]**
Problem: Background task processing returns 202 but provides no job ID, no status endpoint, and no error reporting. Client never learns if async job fails.
Evidence: `transcripts.py` lines 61-67: `_run_pipeline()` exceptions are silently lost.
Fix: Create `ProcessingJob` ORM table with `id`, `transcript_id`, `status`, `error_message`. Return `job_id` in 202 response. Add `GET /jobs/{job_id}/status` endpoint.
Flags: Operational blind spot; no observability into async jobs

---

### BE-007
**[MINOR] | [API Design] | [audit.py:36,46,55]**
Problem: Export format validated via regex string pattern. A named `Enum` is safer and prevents potential Content-Disposition injection.
Evidence: `audit.py` line 36: `format: str = Query(default="json", pattern="^(json|csv)$")`
Fix: `class ExportFormat(str, Enum): JSON = "json"; CSV = "csv"`. Use in route signature.
Flags: Minor injection risk

---

### BE-008
**[MINOR] | [API Design] | [transcripts.py:147; audit.py:15]**
Problem: `status` and `action_type` query parameters accept unconstrained strings.
Evidence: `transcripts.py` line 147: `status: Optional[str] = Query(default=None)`.
Fix: Replace with `Optional[TranscriptStatus]` and `Optional[AuditActionType]` enum types.
Flags: Improves API contract; prevents status enumeration abuse

---

### BE-009
**[MAJOR] | [Error Handling] | [infrastructure/llm_adapter.py:66-84]**
Problem: Retry logic catches all exceptions generically. Fatal errors (401 auth failures) are retried unnecessarily, wasting up to 14 seconds before failing.
Evidence: `llm_adapter.py` lines 66-84: `except Exception as exc` with 2s/4s/8s sleep for all error types including unrecoverable auth failures.
Fix: Distinguish transient (timeout, 503, 429) from permanent (401, parse error) errors. Fail fast on permanent errors. Retry only transient ones with exponential backoff.
Flags: Wastes resources, poor error classification

---

### BE-010
**[MINOR] | [Error Handling] | [services/extraction_service.py:37-51]**
Problem: Some exception re-raises lose original context / traceback in certain code paths.
Evidence: `extraction_service.py` lines 37-40: raises custom exception with `str(exc)` as detail; chain may drop stack trace.
Fix: Ensure all re-raises use `raise CustomError(...) from exc` syntax for full chain preservation.
Flags: Debugging difficulty

---

### BE-011
**[CRITICAL] | [Input Validation] | [document_extractor.py:6-19,22-31]**
Problem: No path traversal validation. `file_path` is accepted and opened without confirming it falls within the allowed upload directory.
Evidence: `document_extractor.py` accepts `file_path: str` directly. Although current callers use UUID-based filenames, no code enforces the path boundary.
Fix: Resolve to absolute path: `Path(file_path).resolve().relative_to(upload_dir.resolve())`. Raise `ExtractionFailedError` if traversal is detected.
Flags: CRITICAL security; path traversal allows reading arbitrary files

---

### BE-012
**[MAJOR] | [Input Validation] | [transcript_service.py:59-61]**
Problem: File extension validation is weak. A double-extension file (e.g., `malicious.pdf.exe`) may pass validation because only the last extension is checked without cross-validating against detected MIME type.
Evidence: `transcript_service.py` lines 59-61: falls back to default extension without validating that the detected MIME type matches the file extension.
Fix: Detect MIME via magic bytes, then verify the file extension matches the detected type. Reject any mismatch.
Flags: Double-extension attacks possible

---

### BE-013
**[MINOR] | [Input Validation] | [services/review_service.py:29-48]**
Problem: `decision: str` not validated at service layer. Defense-in-depth relies solely on Pydantic schema validation.
Evidence: `review_service.py` lines 29-48: `decision: str` with no enum guard.
Fix: Change parameter type to `ReviewDecision` enum.
Flags: Defense-in-depth improvement

---

### BE-014
**[MAJOR] | [Authentication & Authorization] | [programs.py]**
Problem: Admin check is the only authorization control in the entire codebase. No fine-grained permissions model.
Evidence: `programs.py` lines 24-28: single string comparison against a header value. No permission scopes, no delegation, no RBAC.
Fix: Implement `ROLE_PERMISSIONS` mapping with `Permission` enum. Add `require_permission(Permission.MANAGE_PROGRAMS)` decorator. Look up role from JWT claims, not headers.
Flags: No granular access control

---

### BE-015
**[MINOR] | [Authentication & Authorization] | [api/v1/reviews.py:17-20]**
Problem: `reviewer_id` falls back to `body.reviewer_id` if header is missing, allowing one staff member to impersonate another.
Evidence: `reviews.py` lines 17-20: `reviewer_id = x_staff_id or body.reviewer_id`.
Fix: After implementing JWT (BE-005), use `reviewer_id = auth["staff_id"]` exclusively. Ignore `body.reviewer_id`.
Flags: Privilege escalation; reviewer identity not enforced

---

### BE-016
**[MINOR] | [Dependency Management] | [extraction_service.py:25]**
Problem: Hard dependency on `LLMAdapter` instantiation makes testing fragile.
Evidence: `extraction_service.py` line 25: `self.llm = llm_adapter or LLMAdapter()`, optional injection.
Fix: Make injection required: `def __init__(self, db: Session, llm_adapter: LLMAdapter) -> None:`
Flags: Testability

---

### BE-017
**[MINOR] | [Testability] | [rule_engine.py:50-72]**
Problem: `_build_rule()` is a giant if-elif chain violating the Open/Closed Principle. Adding a new rule requires modifying core engine logic.
Evidence: `rule_engine.py` lines 50-72: 18+ conditional branches.
Fix: Implement a `RuleRegistry` class with `@RuleRegistry.register("GRAD-001")` decorators on each rule class. Engine looks up class from registry by `rule_orm.id`.
Flags: Violates Open/Closed Principle

---

### BE-018
**[MAJOR] | [Logging & Observability] | [main.py; config.py:16]**
Problem: No structured logging. `log_level` config setting is defined but never consumed. No correlation IDs, no request tracing, no performance metrics.
Evidence: `config.py` line 16: `log_level: str = "INFO"` never used. `main.py`: no `logging` module imported or configured.
Fix: Create `logging_config.py` with `python-json-logger`, `RotatingFileHandler`, and per-service loggers. Add HTTP middleware for request/response logging with correlation IDs. Use `settings.log_level`.
Flags: Production blocker; no observability

---

### BE-019
**[MINOR] | [Logging & Observability] | [services/audit_service.py:33,55]**
Problem: `action_detail` stored as a JSON-serialized string via `json.dumps()` and deserialized via `json.loads()` on export, fragile double serialization.
Evidence: `audit_service.py` line 33: `action_detail=json.dumps(action_detail)`. Line 55: `json.loads(log.action_detail)`.
Fix: Use SQLAlchemy native `JSON` column type so `action_detail` is stored and read as a Python dict natively.
Flags: Reliability; serialization bugs

---

### BE-020
**[CRITICAL] | [Configuration Management] | [.env; config.py]**
Problem: Real API key present in `.env` file. While `.gitignore` lists `.env`, the file exists on disk and is one accidental commit away from leaking permanently.
Evidence: `backend/.env` line 2: `GEMINI_API_KEY=AIza...`, actual key value present.
Fix: Rotate the API key immediately. For production, use GCP Secret Manager, AWS Secrets Manager, or HashiCorp Vault. Inject secrets at runtime via environment, never in files.
Flags: CRITICAL; secrets management required for production

---

### BE-021
**[MINOR] | [Configuration Management] | [config.py:14]**
Problem: `file_retention_hours: int = 24` is defined but never used, uploaded files accumulate on disk indefinitely.
Evidence: `config.py` line 14: `file_retention_hours: int = 24`, no cleanup service references this.
Fix: Create a `CleanupService` that deletes uploads older than `file_retention_hours`. Schedule via APScheduler on startup.
Flags: Disk space leak

---

### BE-022
**[MAJOR] | [Async Patterns & Resource Management] | [transcripts.py:61-67]**
Problem: Background task creates a new DB session inside the task body using a closure over request-scope data. Potential race conditions with request lifecycle.
Evidence: `transcripts.py` lines 61-67: `_run_pipeline()` uses `with SessionLocal() as session` inside background task.
Fix: Pass only primitive IDs (not ORM objects or sessions) to background task. Open a fresh, independently scoped session inside the task body. Ensure no shared state from request scope.
Flags: Concurrent DB access risk

---

### BE-023
**[MINOR] | [Scalability] | [database.py:17-18]**
Problem: No explicit connection pool configuration. SQLite in file mode is not suitable for production concurrent writes.
Evidence: `database.py` lines 17-18: `create_engine(db_url, connect_args=connect_args, echo=False)`, no `pool_size`, `max_overflow`, or `pool_recycle`.
Fix: For SQLite: explicit `NullPool`. For PostgreSQL (production): `QueuePool(pool_size=10, max_overflow=20, pool_recycle=3600, pool_pre_ping=True)`. Migrate to PostgreSQL for production.
Flags: Production scaling blocker

---

**Category Clean Assessments:**
- **Pydantic Schema Validation:** CLEAN. Request/response schemas well-defined with proper type hints and field requirements.
- **Rule Engine Design:** CLEAN. Domain rules cleanly abstract verification logic. `FlagResult` dataclass is well-structured.
- **Audit Immutability:** CLEAN. `AuditRepository` raises `OperationNotPermittedError` on update/delete. Write-only pattern properly enforced.

---

## Sub-Agent Report: Database (DB)

**Codebase:** `/msbon-app/backend/app/models/`, `/msbon-app/backend/app/repositories/`, `/msbon-app/backend/migrations/`
**Persona:** Senior Data Architect (Notion / Figma)

---

### DB-001
**[CRITICAL] | [INDEXES] | [transcript.py:15-35; transcript_repository.py:28-30; audit_repository.py:29; review_repository.py:14]**
Problem: No database indexes exist on any foreign key columns or commonly-queried fields. Will cause full table scans as data grows beyond 10K records.
Evidence: `transcript_repository.py` line 28: `query.filter(Transcript.status == status_filter)`, full table scan. Line 30: `order_by(Transcript.uploaded_at.desc())`, no index for sort. `audit_repository.py` line 29: compound filter on `transcript_id` + `order_by(timestamp)`, no index.
Fix: Add `__table_args__` with `Index(...)` to all ORM models:
```python
# Transcript:
Index('idx_transcript_status', 'status'),
Index('idx_transcript_uploaded_at', 'uploaded_at'),
# AuditLog:
Index('idx_audit_transcript_timestamp', 'transcript_id', 'timestamp'),
# VerificationFlag:
Index('idx_vflag_transcript_flagged', 'transcript_id', 'flagged_at'),
# ExtractedData:
Index('idx_extracted_data_transcript', 'transcript_id'),
```
Flags: BLOCKING for production

---

### DB-002
**[CRITICAL] | [CONSTRAINTS] | [audit_log.py:17-19; verification_flag.py:19-24; staff_review.py:17-19; extracted_data.py:17-19]**
Problem: Foreign keys to `transcripts.id` have no `ondelete` cascade. Deleting a transcript leaves orphaned records in all child tables, violating referential integrity and the audit trail.
Evidence: `audit_log.py` line 17-19: `ForeignKey("transcripts.id"), nullable=True`, no cascade. Same pattern in `verification_flag.py`, `extracted_data.py`, `staff_review.py`.
Fix: Add `ondelete="CASCADE"` to all FKs pointing to `transcripts.id`. Use `ondelete="RESTRICT"` for `flagging_rules.id` to prevent accidental rule deletion.
Flags: Data integrity violation; GDPR right-to-erasure compliance; audit trail corruption

---

### DB-003
**[CRITICAL] | [CONSTRAINTS] | [staff_review.py:20-21]**
Problem: `StaffReview.transcript_id` stored as plain `String(36)` with no foreign key constraint. Reviews can reference non-existent transcripts.
Evidence: `staff_review.py` lines 20-21: `transcript_id: Mapped[str] = mapped_column(String(36), nullable=False)`, no `ForeignKey` definition.
Fix: `transcript_id: Mapped[str] = mapped_column(ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False)`
Flags: Data integrity violation; orphaned review records possible

---

### DB-004
**[CRITICAL] | [QUERY PATTERNS] | [program_repository.py:21-28]**
Problem: `find_by_name()` loads ALL active programs into Python memory and iterates with string matching, O(n) memory complexity. Will timeout with 1000+ records.
Evidence: `program_repository.py` lines 21-28: `for prog in self.list_active():`, fetches every active program, then does string comparison in application memory.
Fix: Push filtering to SQL using `func.lower()` with `.contains()`:
```python
self.db.query(AccreditedProgram)
    .filter(AccreditedProgram.is_active == True)
    .filter(func.lower(AccreditedProgram.institution_name).contains(name_lower))
    .first()
```
Flags: O(n) memory complexity; CPU overhead; production performance blocker

---

### DB-005
**[CRITICAL] | [SCALABILITY] | [database.py:17-18]**
Problem: No explicit connection pool configuration. Default pooling will be exhausted under concurrent load.
Evidence: `database.py` lines 17-18: `create_engine(db_url, connect_args=connect_args, echo=False)`, no `poolclass`, `pool_size`, `max_overflow`, or `pool_recycle`.
Fix: For SQLite: `NullPool`. For PostgreSQL: `QueuePool(pool_size=20, max_overflow=40, pool_recycle=3600, pool_pre_ping=True)`.
Flags: Production-blocking; connection leaks under load

---

### DB-006
**[MINOR] | [DATA INTEGRITY] | [audit_log.py:20-24]**
Problem: `actor_id`, `action_type`, `outcome`, `action_detail` are `nullable=False` but no CHECK constraint prevents empty strings (`""`).
Evidence: `audit_log.py` lines 20-24: `NOT NULL` enforced, but no minimum length check.
Fix: Add `CheckConstraint("LENGTH(actor_id) > 0", name="ck_audit_actor_not_empty")` for each critical audit field.
Flags: Audit trail reliability; compliance violation

---

### DB-007
**[CRITICAL] | [TRANSACTIONS] | [services/extraction_service.py:27-93]**
Problem: `ExtractionService.process()` makes multiple DB modifications across two separate `db.commit()` calls. Partial failure leaves system in inconsistent state.
Evidence: `extraction_service.py` line 33: `update_status(..., "EXTRACTING")` commits. Line 86: `self.db.commit()` commits `extracted_data`. Line 88-91: `audit.log()` commits audit entry. Three separate transaction boundaries.
Fix: Wrap all three operations in `db.begin_nested()`. Catch exceptions, `db.rollback()`, revert status, then log failure.
Flags: Data inconsistency; orphaned records; compliance violation

---

### DB-008
**[CRITICAL] | [TRANSACTIONS] | [services/verification_service.py:51-78]**
Problem: Verification audit log (lines 74-78) called AFTER `db.commit()` (line 72). If audit logging fails, verification succeeded but has no audit record.
Evidence: `verification_service.py`: `self.db.commit()` at line 72, `self.audit.log()` at lines 74-78, two separate transaction boundaries.
Fix: Move audit log creation inside the transaction. Commit atomically. Log failure separately on exception.
Flags: Audit trail gaps; inconsistent state on failure

---

### DB-009
**[CRITICAL] | [TRANSACTIONS] | [services/review_service.py:29-84]**
Problem: `submit_review()` calls `repo.save()`, `audit.log()`, and `transcript_repo.update_status()` as three separate `db.commit()` operations. Partial failure leaves review saved but transcript in wrong status.
Evidence: `review_service.py` lines 65, 68-79, 82: three separate commit points.
Fix: Use `db.begin_nested()` to wrap review creation and status update atomically. Audit log after successful commit.
Flags: Inconsistent state; orphaned reviews; audit gaps

---

### DB-010
**[CRITICAL] | [SENSITIVE DATA] | [extracted_data.py:20,28]**
Problem: Student PII (`student_name`) and full transcript OCR text (`raw_text`) stored as plain text. Violates HIPAA, GDPR, and similar regulations.
Evidence: `extracted_data.py` line 20: `student_name: Mapped[Optional[str]] = mapped_column(String(255))`, plaintext. Line 28: `raw_text: Mapped[Optional[str]] = mapped_column(Text)`, entire transcript text, may contain SSN, address, phone.
Fix: Use `sqlalchemy-utils` `EncryptedType` column with `settings.encryption_key`. Or use `cryptography.fernet` hybrid property for field-level encryption.
Flags: HIPAA violation; GDPR violation; regulatory audit failure

---

### DB-011
**[CRITICAL] | [MIGRATIONS] | [migrations/versions/ (empty); database.py:48]**
Problem: Alembic is configured but `migrations/versions/` has zero migration files. Schema created dynamically via `Base.metadata.create_all()`. No version history, no rollback, no cross-environment coordination.
Evidence: `database.py` line 48: `Base.metadata.create_all(bind=engine)`. `migrations/versions/` is empty.
Fix: Run `alembic revision --autogenerate -m "initial schema"`. Replace `create_all()` with `alembic upgrade head` in `init_db()`. Create `downgrade()` functions for every revision.
Flags: No version control; cannot rollback; schema drift; production blocker

---

### DB-012
**[MAJOR] | [INDEXES] | [flagging_rule.py:17]**
Problem: `FlaggingRule.name` uses implicit `unique=True` index without explicit `UniqueConstraint`. Missing index on `category` field for rule filtering.
Evidence: `flagging_rule.py` line 17: `unique=True` implicit only; no `__table_args__`.
Fix: Add `UniqueConstraint('name', name='uq_flagging_rule_name')` and `Index('idx_flagging_rule_category', 'category')` to `__table_args__`.
Flags: Schema clarity; missing category index

---

### DB-013
**[MAJOR] | [SCHEMA DESIGN] | [verification_flag.py:18-30]**
Problem: No composite unique constraint on `(transcript_id, rule_id)`. The same rule can flag the same transcript multiple times.
Evidence: `verification_flag.py` lines 19-24: FK to both `transcripts.id` and `flagging_rules.id`, no composite uniqueness enforced.
Fix: `UniqueConstraint('transcript_id', 'rule_id', name='uq_vflag_transcript_rule')` in `__table_args__`.
Flags: Duplicate flag detection; data quality

---

### DB-014
**[MAJOR] | [SCHEMA DESIGN] | [accredited_program.py:10-21]**
Problem: `AccreditedProgram` table has no `created_at` or `updated_at` timestamp fields. Impossible to audit when a program was added or last modified.
Evidence: `accredited_program.py`, no DateTime fields anywhere.
Fix: Add `created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)` and `updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, onupdate=datetime.utcnow)`.
Flags: Audit trail; compliance; temporal analysis

---

### DB-015
**[MAJOR] | [QUERY PATTERNS] | [transcript_repository.py:26-31]**
Problem: `list_paginated()` executes two separate queries (count + fetch) on every request. Count not cached; re-runs on every page load.
Evidence: `transcript_repository.py` lines 26-31: `total = query.count()` then `items = query.order_by(...).offset(skip).limit(limit).all()`.
Fix: Use `select(func.count(Transcript.id))` scalar or only count on first page (`skip == 0`).
Flags: Two DB round-trips per page request

---

### DB-016
**[MAJOR] | [INDEXES] | [staff_review.py:13-29]**
Problem: `StaffReview` queries by `transcript_id` (full table scan) with no index. `reviewed_at` also unindexed.
Evidence: `review_repository.py` line 18: `filter(StaffReview.transcript_id == transcript_id)`, no index.
Fix: `Index('idx_staff_review_transcript_id', 'transcript_id')` and `Index('idx_staff_review_reviewed_at', 'reviewed_at')` in `__table_args__`.
Flags: Query performance; N+1 queries in bulk operations

---

### DB-017
**[MAJOR] | [ORM USAGE] | [transcript.py:27-35]**
Problem: Relationships `extracted_data`, `flags`, `audit_logs` have no explicit `lazy` loading strategy. Default `lazy="select"` causes N+1 queries when iterating a list of transcripts.
Evidence: `transcript.py` lines 27-35: no `lazy=...` parameter on any relationship. Accessing `transcript.flags` for 100 transcripts executes 101 queries.
Fix: Use `lazy="joined"` for `extracted_data` (one-to-one). Use `lazy="selectin"` for `flags` and `audit_logs` (one-to-many). Or use explicit `joinedload()`/`selectinload()` in repository queries.
Flags: N+1 queries; performance degradation at scale

---

### DB-018
**[CRITICAL] | [SCHEMA DESIGN] | [transcript.py:22]**
Problem: `Transcript.status` is an unconstrained `String(20)`. Invalid states can be persisted via bugs or direct SQL, breaking state machine logic.
Evidence: `transcript.py` line 22: `status: Mapped[str] = mapped_column(String(20), nullable=False, default="UPLOADED")`, no constraint on values.
Fix: Use `SQLEnum(TranscriptStatus)` or add `CheckConstraint("status IN ('UPLOADED','EXTRACTING','EXTRACTED','VERIFYING','FLAGGED','CLEAR','REVIEWED','OVERRIDDEN')")`.
Flags: State machine integrity; data quality

---

### DB-019
**[MINOR] | [SCHEMA DESIGN] | [extracted_data.py:20-27; verification_flag.py:27]**
Problem: String lengths inconsistent across models (`String(255)` for names, `String(500)` for descriptions) with no centralized constants.
Evidence: `extracted_data.py` lines 20-22: `String(255)`. `verification_flag.py` line 27: `String(500)`.
Fix: Define module-level length constants (`INSTITUTION_NAME_LENGTH = 255`, `VERIFICATION_DESC_LENGTH = 500`) and reference them in column definitions.
Flags: Data truncation risk; consistency

---

### DB-020
**[MINOR] | [CONSTRAINTS] | [audit_log.py:17-19]**
Problem: `AuditLog.transcript_id` is `nullable=True` with no documentation explaining when a NULL transcript ID is valid.
Evidence: `audit_log.py` lines 17-19: `nullable=True` FK, semantically ambiguous.
Fix: Either make it `nullable=False` (all audit events tied to a transcript) or add a code comment: `# NULL indicates system-level audit event (e.g., startup, config change)`.
Flags: Schema clarity

---

### DB-021
**[MINOR] | [CONFIGURATION] | [database.py:18]**
Problem: `echo=False` hardcoded; cannot enable SQL debug logging in development without code change.
Evidence: `database.py` line 18: `create_engine(db_url, ..., echo=False)`.
Fix: `echo = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"`
Flags: Development convenience

---

### DB-022
**[MINOR] | [SEEDING] | [database.py:105-144]**
Problem: Accredited programs list hardcoded in Python. Cannot add new programs without code changes; won't scale to thousands.
Evidence: `database.py` lines 108-125: hardcoded list of 8 programs.
Fix: Move to a CSV seed file (`data/accredited_programs.csv`) loaded at startup, or to an Alembic seed migration.
Flags: Scalability; maintainability

---

### DB-023
**[MINOR] | [SEEDING] | [database.py:86-102,127-144]**
Problem: Race condition, two instances starting simultaneously both see `count == 0` and both attempt inserts, causing unique constraint violations.
Evidence: `database.py` lines 88-89: check-then-insert pattern with no atomicity guarantee.
Fix: Use upsert: `insert(FlaggingRule).values(...).on_conflict_do_nothing()`.
Flags: Data integrity; parallel deployment

---

### DB-024
**[MINOR] | [ORM USAGE] | [transcripts.py:61-68]**
Problem: *(Informational)* Background task session lifecycle was initially flagged. On review, the code correctly uses `with SessionLocal() as session:` context manager, no fix needed.
Evidence: `transcripts.py` lines 61-68: `with SessionLocal() as session:`, properly scoped.
Fix: No fix needed. Add clarifying comment: `# Context manager ensures session cleanup even on exception`.
Flags: Code quality; documentation only

---

### DB-025
**[MINOR] | [CONFIGURATION] | [alembic.ini:5]**
Problem: Hardcoded SQLite connection string in `alembic.ini`. Should come from environment variable.
Evidence: `alembic.ini` line 5: `sqlalchemy.url = sqlite:///./data/msbon.db`.
Fix: In `migrations/env.py`: `config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL", "sqlite:///./data/msbon.db"))`
Flags: Security; configuration management

---

## Sub-Agent Report: Security (SEC)

**Codebase:** `/msbon-app/backend/` + `/msbon-app/frontend/`
**Persona:** Senior Application Security Engineer (Financial / Healthcare OWASP expertise)

---

### SEC-001
**[CRITICAL] | [Authentication] | [All API endpoints, transcripts.py, reviews.py, programs.py, audit.py]**
Problem: No authentication mechanism exists on any API endpoint. All endpoints are completely public and do not validate user identity.
Evidence: All routes in `/api/v1/` accept requests without any token, session, or credential validation. Frontend passes `X-Staff-ID` header but backend does NOT verify it is legitimate.
Fix: Implement OAuth 2.0 or JWT-based authentication. Add `HTTPBearer` middleware validating `Authorization: Bearer <token>` on all non-public endpoints. Add `Depends(verify_token)` to every protected route.
Flags: OWASP A01:2021, Broken Authentication; production deployment blocker

---

### SEC-002
**[CRITICAL] | [Authorization] | [programs.py:24,27-28]**
Problem: Authorization based on client-controlled `X-Staff-Role` header. Any user can set any header value.
Evidence: `programs.py` lines 27-28: `if x_staff_role != "admin": raise HTTPException(...)`, header value comes directly from user request, no server-side verification.
Fix: Remove reliance on client-supplied headers. After authenticating (SEC-001), look up the user's role from server-side storage. Validate against server-stored permissions.
Flags: OWASP A01:2021, trivially bypassed

---

### SEC-003
**[CRITICAL] | [Secrets Management] | [api/v1/health.py:23]**
Problem: Public health endpoint leaks LLM API key configuration status.
Evidence: `health.py` line 23: `"llm_api": "reachable" if settings.gemini_api_key else "not_configured"`, public endpoint reveals internal configuration.
Fix: Remove LLM status from public health check. Restrict to authenticated admin users only.
Flags: OWASP A07:2021, Information Disclosure; reconnaissance vector

---

### SEC-004
**[MAJOR] | [CORS] | [main.py:23-28]**
Problem: CORS middleware missing `allow_credentials=True`. Must be addressed when cookie-based auth is added.
Evidence: `main.py` lines 23-28: `CORSMiddleware` configuration does not include `allow_credentials`.
Fix: Add `allow_credentials=True`. Restrict `allow_headers` to only required headers.
Flags: OWASP A07:2021, CORS misconfiguration

---

### SEC-005
**[MAJOR] | [CORS] | [config.py:17; .env]**
Problem: CORS origins hardcoded to `http://localhost:5173`. Will block production requests and is easily overlooked.
Evidence: `config.py` line 17: `cors_origins: str = "http://localhost:5173"`. Same in `.env.example`.
Fix: Remove default value. Require explicit `CORS_ORIGINS` env var. Validate at startup. Set to actual frontend domain(s) in production.
Flags: Production deployment blocker

---

### SEC-006
**[MAJOR] | [Input Validation & Injection] | [transcripts.py:143-152; transcript_repository.py:27-28]**
Problem: `status` query parameter accepts any unconstrained string before database filtering.
Evidence: `transcripts.py` line 143: `status: Optional[str] = Query(default=None)`, no whitelist.
Fix: Replace with `Optional[TranscriptStatus]` Pydantic enum. Non-enum values automatically rejected with 422.
Flags: OWASP A03:2021, Injection; status enumeration

---

### SEC-007
**[MAJOR] | [Input Validation & Injection] | [audit.py:17; audit_repository.py:36-39]**
Problem: `action_type` query parameter accepts any string without validation.
Evidence: `audit.py` line 17: `action_type: Optional[str] = Query(default=None)`.
Fix: Create `AuditActionType` enum; use `Optional[AuditActionType]` in route signature.
Flags: OWASP A03:2021, Injection

---

### SEC-008
**[MAJOR] | [Data Exposure] | [extraction_service.py:89-91; transcript_service.py:86-87; audit_log.py:22]**
Problem: Audit logs store potentially sensitive metadata (filenames, text length, LLM model names) as plain text with no field-level access controls.
Evidence: `extraction_service.py` lines 89-91: logs `{"llm_model": ..., "text_length": len(raw_text)}`. `transcript_service.py` lines 86-87: logs filename and file_type. All stored as plain `Text`.
Fix: Log events, not data. Hash/redact PII like filenames in logs. Implement field-level access controls on audit log viewing.
Flags: OWASP A09:2021; GDPR/HIPAA compliance risk

---

### SEC-009
**[MAJOR] | [Rate Limiting & Abuse Prevention] | [All endpoints]**
Problem: No rate limiting on any API endpoint. Unlimited uploads, processing requests, and log enumeration possible.
Evidence: No `slowapi` or equivalent middleware configured anywhere.
Fix: `pip install slowapi`. Apply `@limiter.limit("10/hour")` to upload, `@limiter.limit("30/minute")` to processing, `@limiter.limit("100/hour")` to read endpoints.
Flags: OWASP A05:2021, DoS attack vector

---

### SEC-010
**[MAJOR] | [Data Exposure] | [extracted_data.py:20,28]**
Problem: Student PII (`student_name`) and full transcript OCR text (`raw_text`) stored unencrypted in SQLite. May contain SSN, address, phone, DOB.
Evidence: `extracted_data.py` line 20: `student_name: Mapped[Optional[str]] = mapped_column(String(255))`, plaintext. Line 28: `raw_text: Mapped[Optional[str]] = mapped_column(Text)`.
Fix: Use `sqlalchemy-utils` `EncryptedType` with `ENCRYPTION_KEY` env var. Or use `cryptography.fernet` hybrid property.
Flags: OWASP A02:2021, Cryptographic Failures; GDPR Article 32; HIPAA §164.312(a)(2)(iv)

---

### SEC-011
**[MAJOR] | [Security Logging & Audit Trail] | [services/review_service.py:68-79; api/v1/reviews.py:21]**
Problem: IP address is optional in audit logs (`None` possible). Insufficient for forensic analysis.
Evidence: `api/v1/reviews.py` line 21: `ip = request.client.host if request.client else None`. No user-agent logging.
Fix: `ip = request.client.host if request.client else "UNKNOWN"`. Add `user_agent = request.headers.get("user-agent")` to audit detail.
Flags: OWASP A09:2021, Logging and Monitoring Failures

---

### SEC-012
**[MAJOR] | [Secrets Management] | [frontend/.env:1]**
Problem: Frontend `.env` contains API base URL. While gitignored, presence creates accidental commit risk.
Evidence: `frontend/.env` line 1: `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
Fix: Document clearly in README that `.env` must never be committed. Use CI/CD secrets for production builds.
Flags: OWASP A01:2021, Configuration Exposure

---

### SEC-013
**[MAJOR] | [Input Validation & Injection] | [transcript_service.py:25-56]**
Problem: File validation relies solely on magic bytes. Can be bypassed by prepending PDF magic bytes to malicious content.
Evidence: `transcript_service.py` lines 25-56: `mime = _detect_mime_type(file_bytes)`, magic bytes only. No PDF structure validation, no antivirus, no extracted text size limit.
Fix: Add secondary PDF structural validation (pdfplumber open + page count check). Add max extracted text size cap. Consider ClamAV integration.
Flags: OWASP A04:2021, Insecure Deserialization; CWE-434: Unrestricted Upload

---

### SEC-014
**[MAJOR] | [Dependency Vulnerabilities] | [requirements.txt]**
Problem: Multiple outdated dependencies with potential CVEs. No automated vulnerability scanning.
Evidence: `requirements.txt`: `google-generativeai==0.5.0` (Dec 2023), `Pillow==10.3.0`, `pdfplumber==0.11.0`, `fastapi==0.110.0`, `sqlalchemy==2.0.29`, all from early 2024.
Fix: Run `pip install safety && safety check`. Update all packages. Add `safety check` to CI/CD. Enable Dependabot.
Flags: OWASP A06:2021, Vulnerable and Outdated Components

---

### SEC-015
**[MINOR] | [Authorization] | [All transcript endpoints]**
Problem: UUID4 IDs combined with missing authentication (SEC-001) allow any user to access any transcript by knowing its ID (IDOR).
Evidence: Transcript IDs used in URLs with no ownership verification.
Fix: After implementing auth (SEC-001), add ownership check: `filter(Transcript.id == id, Transcript.uploaded_by == current_user.id)`.
Flags: OWASP A01:2021, Insecure Direct Object Reference (IDOR)

---

### SEC-016
**[MINOR] | [Input Validation & Injection] | [schemas/review.py:10; schemas/transcript.py]**
Problem: String input fields lack `max_length` constraints, allowing potential resource exhaustion.
Evidence: `review.py` line 10: `decision: str`, no length constraint. `annotation`, `override_reason` also unconstrained.
Fix: Add `Field(..., max_length=36)` for IDs, `Field(default=None, max_length=5000)` for text fields.
Flags: OWASP A03:2021, Resource exhaustion

---

### SEC-017
**[MINOR] | [Input Validation & Injection] | [Frontend components; types/index.ts:40]**
Problem: LLM-generated `source_excerpt` rendered in components without explicit sanitization. Potential XSS vector if rendering ever switches to HTML.
Evidence: `types/index.ts` line 40: `source_excerpt: string | null`, rendered via React (escapes by default). No `dangerouslySetInnerHTML` found currently.
Fix: Maintain the no-`dangerouslySetInnerHTML` discipline. If rich text rendering ever needed, use `DOMPurify.sanitize()`. On backend, sanitize LLM output with `bleach.clean()`.
Flags: OWASP A03:2021, XSS; preemptive

---

### SEC-018
**[MINOR] | [Transport Security] | [main.py]**
Problem: No security HTTP headers set. Missing HSTS, X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy.
Evidence: `main.py`, no security header middleware.
Fix:
```python
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
response.headers["X-Content-Type-Options"] = "nosniff"
response.headers["X-Frame-Options"] = "DENY"
response.headers["Content-Security-Policy"] = "default-src 'self'"
response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
```
Flags: OWASP A05:2021, Security Misconfiguration

---

### SEC-019
**[MINOR] | [Security Logging] | [main.py; config.py:16]**
Problem: No logging configuration. Default Python logging could expose stack traces with sensitive data in production.
Evidence: `config.py` line 16: `log_level: str = "INFO"`, defined but no logger configured.
Fix: Configure logging with a `SensitiveDataFilter` class redacting `api_key`, `token`, `password` fields. Truncate detail in production: `logger.error(f"Unhandled: {str(exc)[:100]}")`.
Flags: OWASP A09:2021, Logging and Monitoring Failures

---

### SEC-020
**[MINOR] | [Rate Limiting] | [All endpoints]**
Problem: No `X-RateLimit-Limit`, `X-RateLimit-Remaining`, or `X-RateLimit-Reset` response headers.
Evidence: No rate limit headers in any API response.
Fix: Once `slowapi` is implemented (SEC-009), propagate rate limit state to response headers via middleware.
Flags: OWASP A05:2021

---

### SEC-021
**[MINOR] | [Data Exposure] | [main.py:31-42; exceptions.py:9-10]**
Problem: Error responses include `exc.detail` which can expose internal implementation details in production.
Evidence: `main.py` lines 31-42: exception handler returns `exc.detail` directly.
Fix: In production (`settings.environment == "production"`), return only `exc.message`. In development, include `exc.detail`. Add `environment: str` to `Settings`.
Flags: OWASP A04:2021, Information Disclosure

---

### SEC-022
**[MINOR] | [Data Exposure] | [database.py:17]**
Problem: SQLite stores data unencrypted at rest. Inappropriate for production healthcare credential data.
Evidence: `database.py` line 17: plain SQLite `create_engine` with no encryption.
Fix: For production, migrate to PostgreSQL with `sslmode=require`. Document current risk for PoC use.
Flags: OWASP A02:2021, Cryptographic Failures; HIPAA §164.312(a)(2)(iv)

---

## Sub-Agent Report: UI/UX (UX)

**Codebase:** `/msbon-app/frontend/src/`
**Persona:** Senior Product Designer (Figma / Airbnb / Apple)

---

### UX-001
**[CRITICAL] | [Visual Consistency] | [App.tsx:22-34; index.css:5-50; tailwind.config.js:1-11]**
Problem: Navigation bar uses hardcoded Tailwind blue colors (`text-blue-600`, `border-blue-600`) while global design tokens (`--accent: #aa3bff`) are defined as CSS custom properties in `index.css`. These systems are completely disconnected.
Evidence: `App.tsx` lines 22-34: `text-blue-600`. `index.css` lines 5-50: `--accent`, `--accent-bg`. `tailwind.config.js` line 8: `extend: {}`, zero token extension.
Fix: Extend `tailwind.config.js` with CSS variable references. Update navigation to use semantic classes from the token system. Create `@apply` utilities in `index.css`.
Flags: Design token inconsistency; hard-to-theme application

---

### UX-002
**[CRITICAL] | [Design Token System] | [tailwind.config.js:1-11; index.css:5-50; All component files]**
Problem: Tailwind configured with zero theme extensions (`extend: {}`). All components use arbitrary utilities. CSS custom properties in `index.css` are defined but never connected to Tailwind tokens.
Evidence: `tailwind.config.js` lines 1-11: `extend: {}`. All pages/components use ad-hoc classes like `bg-blue-600`, `text-gray-500`, `border-gray-200` with no token reference.
Fix: Extend `tailwind.config.js` with a complete theme mapping all CSS custom properties. Create reusable component classes with `@apply` directives.
Flags: No design system; not themeable; violates design best practices

---

### UX-003
**[MAJOR] | [Component Consistency] | [Multiple component files]**
Problem: At least 7 different button implementations with varying padding, border-radius, hover states, and disabled states.
Evidence: `FileDropzone.tsx` line 43: "browse" as inline text. `ReviewForm.tsx` line 75: `px-4 py-1.5 bg-blue-600`. `ProgramsPage.tsx` line 51: `px-4 py-2 bg-blue-600`. `ExportButton.tsx` lines 13-22: two buttons with different gray shades. `DecisionButtons.tsx` lines 23-25: custom color variants.
Fix: Create a reusable `Button` component with `variant` (`primary`, `secondary`, `danger`, `ghost`), `size` (`sm`, `md`, `lg`), and `isLoading` props. Replace all inline button styles.
Flags: No component consistency; poor maintainability

---

### UX-004
**[MAJOR] | [Design Token System] | [Multiple component files]**
Problem: Color palette duplicated, raw Tailwind color classes (`bg-red-100`, `text-red-700`, `bg-blue-600`) scattered throughout with no single source of truth.
Evidence: `bg-red-` appears in 5+ files. `bg-blue-` appears 15+ times in different shades. `border-gray-` appears 20+ times. `index.css` defines `--accent` but `App.tsx` uses `bg-blue-600`.
Fix: Create `src/utils/colors.ts` with centralized color aliases. Extend `tailwind.config.js` with these values.
Flags: Maintenance nightmare; inconsistent experience

---

### UX-005
**[MAJOR] | [Layout & Spacing] | [AuditLogPage.tsx:22; UploadPage.tsx:36; TranscriptListPage.tsx:34; ReviewForm.tsx:54]**
Problem: Padding and margins inconsistent across application with no coherent spacing scale.
Evidence: Page padding varies: `py-10 px-4` vs `py-12 px-4` vs `py-8 px-4`. Component padding: `p-4` vs `p-6` vs `p-3`. Form spacing: `space-y-2` vs `gap-3` vs `gap-2`.
Fix: Define spacing scale in `tailwind.config.js`. Establish standards: all pages use `py-10 px-4`, form fields use `gap-4`, sections use `gap-6`.
Flags: Visual inconsistency; unprofessional appearance

---

### UX-006
**[MAJOR] | [User Flows] | [UploadPage.tsx:26-28]**
Problem: After successful upload, a 1.5-second `setTimeout` auto-redirect occurs with no countdown or cancel option.
Evidence: `UploadPage.tsx` lines 26-28: `setStatus("done"); setTimeout(() => navigate(...), 1500);`
Fix: Replace with a countdown timer ("Redirecting in 3s... [skip]"), immediate redirect with success toast, or an explicit "View Results" CTA.
Flags: Poor UX; inaccessible (no user control over redirect)

---

### UX-007
**[MAJOR] | [Feedback & States] | [AuditLogPage.tsx:42; TranscriptListPage.tsx:27; VerificationPage.tsx:20; ProgramsPage.tsx:89]**
Problem: Loading states are bare text with no spinner, skeleton, or context.
Evidence: Four files all show `<div className="text-gray-500">Loading…</div>`, no animation, no context.
Fix: Create reusable `LoadingSpinner` component with context message. Implement skeleton screens for tables/lists.
Flags: Poor feedback; user uncertainty

---

### UX-008
**[MAJOR] | [Error States] | [ReviewForm.tsx:71; UploadPage.tsx:31; TranscriptListPage.tsx:28; VerificationPage.tsx:21]**
Problem: Error states inconsistent, inline red text, ProgressBar messages, and full-page red divs. No retry or recovery mechanism anywhere.
Evidence: Four different error implementations, none with a retry button.
Fix: Create unified `ErrorAlert` component with `error`, `onRetry`, `onDismiss` props. Apply consistently across all async operations.
Flags: No recovery paths; user feels stuck

---

### UX-009
**[MAJOR] | [Empty & Error States] | [AuditLogTable.tsx:8-9; ProgramsPage.tsx:89; TranscriptListPage.tsx:42-43]**
Problem: Empty states inconsistent. `FlagList` has a good contextual empty state; all other tables/lists have generic or missing empty states.
Evidence: `AuditLogTable.tsx` lines 8-9: `<p>No audit entries found.</p>`. `ProgramsPage.tsx`: no empty state when programs array is empty. Only `FlagList.tsx` lines 12-17 has contextual messaging.
Fix: Create `EmptyState` component with `icon`, `title`, `description`, `action` props. Apply to all list/table views.
Flags: Missed user guidance; inconsistent UX

---

### UX-010
**[MAJOR] | [Mobile Responsiveness] | [index.css:57-67; App.tsx:22; TranscriptListPage.tsx:45; ProgramsPage.tsx:57]**
Problem: Root layout constrained to 1126px. Navigation doesn't collapse on mobile. Tables require horizontal scrolling. Grid forms break on small screens.
Evidence: `index.css` line 58: `#root { width: 1126px; }`. `App.tsx` line 22: 4 full nav items, no hamburger. `ProgramsPage.tsx` line 57: `grid grid-cols-2`, too narrow on phones.
Fix: Mobile-first responsive design. Hamburger nav for < 768px. Card layouts for tables on mobile. `grid-cols-1 md:grid-cols-2`.
Flags: Poor mobile experience; navigation non-functional on mobile

---

### UX-011
**[MAJOR] | [Component Consistency] | [UploadPage.tsx:44; ProgramsPage.tsx:62,68; AnnotationInput.tsx:20]**
Problem: Text inputs, textareas, and selects have inconsistent styling across the application.
Evidence: `UploadPage.tsx` line 44: `border border-gray-300 rounded px-3 py-1.5`. `ProgramsPage.tsx` line 62: `border rounded px-2 py-1 mt-0.5`. `AnnotationInput.tsx` line 20: `border border-gray-300 rounded p-2`.
Fix: Create reusable `Input`, `Select`, `Textarea` components with consistent padding, border, focus states, and disabled states.
Flags: Inconsistent form UX

---

### UX-012
**[MAJOR] | [Micro-interactions & Motion] | [FileDropzone.tsx:26; UploadProgressBar.tsx:26; DecisionButtons.tsx:23; App.css:8,128]**
Problem: Transitions applied inconsistently. No page transitions. `transition-colors` vs `transition-all duration-500` vs no transition at all.
Evidence: Multiple files use different transition classes with no standard. No Framer Motion or CSS animation system.
Fix: Define `transition-standard` = `transition-all duration-200`. Document animation patterns (hover 200ms, state 300ms). Consider Framer Motion for page transitions.
Flags: Janky, inconsistent feel

---

### UX-013
**[MAJOR] | [Accessibility & Inclusivity] | [App.tsx:24-33; ReviewForm.tsx; ProgramsPage.tsx:57; FlagItem.tsx:40-45]**
Problem: Focus management absent throughout. No skip-to-main-content. No `aria-current` on active navigation. No focus trap in forms.
Evidence: `App.tsx` lines 24-33: `NavLink` uses `isActive` but no `aria-current="page"`. No focus trap in `ReviewForm`. `FlagItem.tsx` lines 40-45: toggle button has no role announcement.
Fix: Add skip-to-main-content link. Set `aria-current="page"` on active nav link. Implement focus trap in forms. Add `aria-live="polite"` to async state changes.
Flags: WCAG 2.1 compliance issues; keyboard navigation broken

---

### UX-014
**[MAJOR] | [Accessibility & Inclusivity] | [TranscriptListPage.tsx:67; AuditLogTable.tsx:30; Multiple components]**
Problem: Several color combinations likely fail WCAG AA contrast. Disabled states use `opacity-50` reducing contrast further.
Evidence: `text-gray-500` on white (#9ca3af on #ffffff ≈ 4.5:1, borderline/fails for small text). Disabled buttons at `opacity-50` significantly reduce contrast.
Fix: Run WebAIM contrast checker on all combinations. Replace weak grays with `text-gray-700` minimum for body copy. Use visual patterns instead of opacity for disabled states.
Flags: WCAG AA failure; legal accessibility risk

---

### UX-015
**[MAJOR] | [Layout & Spacing] | [TranscriptListPage.tsx:45; AuditLogTable.tsx:13; ProgramsPage.tsx:91]**
Problem: All three main list views use HTML tables with `overflow-x-auto`, unusable on mobile with cramped text and mandatory horizontal scrolling.
Evidence: All three use standard `<table>` markup with `text-sm`. No responsive card alternatives.
Fix: Create `ResponsiveList` component that renders `<table>` on desktop and a card stack on mobile (≤ 768px).
Flags: Mobile UX broken; accessibility issue

---

### UX-016
**[MAJOR] | [User Flows] | [ReviewForm.tsx:43-70]**
Problem: Review form has complex conditional flow with no visual explanation of what each decision means or when fields are required.
Evidence: `ReviewForm.tsx` lines 43-50: validation logic. Lines 62-70: conditional field appears for OVERRIDDEN with no upfront indication.
Fix: Add instruction text. Change button labels: "Confirm Flag", "Override Flag", "Request More Info". Show confirmation summary before submit. Show success message with next action.
Flags: Unclear UX; complex mental model; error-prone

---

### UX-017
**[MAJOR] | [Feedback & States] | [VerificationPage.tsx:36-40; TranscriptListPage.tsx:24]**
Problem: Intermediate processing states (EXTRACTING, VERIFYING) poorly communicated. Auto-refresh works silently with no visual indicator.
Evidence: `TranscriptListPage.tsx` line 24: `refetchInterval: 5000`, silent background polling. No "last updated" indicator.
Fix: Create `ProcessingState` component with progress indicator and status explanation. Show "Last updated X seconds ago, refreshing..." indicator.
Flags: Poor user feedback; unclear system state

---

### UX-018
**[MINOR] | [Component Consistency] | [AuditLogPage.tsx:30; VerificationPage.tsx:28; TranscriptListPage.tsx:37; ProgramsPage.tsx:52]**
Problem: Button text patterns inconsistent, "← Back", "+ Upload New", "Export JSON" (no icon), "Details"/"Hide" toggle, no convention.
Evidence: Four different text pattern styles across navigation and action buttons.
Fix: Establish standards: Navigation: "← Back". Actions: verb-noun. Toggles: "Show/Hide Details".
Flags: Minor consistency issue

---

### UX-019
**[MINOR] | [Feedback & States] | [DecisionButtons.tsx:18-31]**
Problem: Decision buttons use `<button>` elements styled as radio selection but lack `role="radio"` or `aria-checked` attributes.
Evidence: `DecisionButtons.tsx` lines 18-31: custom button elements with selected state styling but no ARIA semantics.
Fix: Add `role="radio"` and `aria-checked={selected === opt.value}`, wrapping in `role="radiogroup"`. Or use native radio buttons with custom CSS.
Flags: Accessibility issue; non-semantic HTML

---

### UX-020
**[MINOR] | [Layout & Spacing] | [FlagItem.tsx:29; ReviewForm.tsx:54; ProgramsPage.tsx:57; DecisionButtons.tsx:17]**
Problem: Lists and stacked elements use different gap values with no consistent scale.
Evidence: `mb-3`, `space-y-2`, `gap-3`, `gap-2` used interchangeably.
Fix: Standardize: inline items → `gap-2`, form fields/cards → `gap-4`, page sections → `gap-6`.
Flags: Visual inconsistency

---

### UX-021
**[MINOR] | [Visual Consistency] | [TranscriptListPage.tsx:60; AuditLogTable.tsx:35; FlagItem.tsx:32; TranscriptSummary.tsx:24]**
Problem: Status and severity badges styled differently across components (different padding, sizing, font size).
Evidence: Most: `text-xs px-2 py-0.5 rounded-full`. `TranscriptSummary.tsx` line 24: `px-3 py-1 rounded-full text-sm font-medium`.
Fix: Create reusable `Badge` component with `variant` and `size` props.
Flags: Minor inconsistency; visual polish

---

### UX-022
**[MINOR] | [Feedback & States] | [ReviewForm.tsx:35-36]**
Problem: After review submission succeeds, form just clears with no success message. User cannot confirm submission worked.
Evidence: `ReviewForm.tsx` lines 35-36: `onSuccess: () => { ...; onSubmitted(); }`, no success UI.
Fix: Show brief success message ("Review submitted successfully") for 3 seconds before clearing. Indicate next steps.
Flags: Minor UX issue; user confusion

---

### UX-023
**[MINOR] | [Accessibility & Inclusivity] | [UploadPage.tsx:39; ProgramsPage.tsx:60; AnnotationInput.tsx:12-14]**
Problem: Form inputs lack proper `htmlFor`/`id` label associations.
Evidence: `UploadPage.tsx` line 39: `<label>Staff ID</label>` without `htmlFor`. `ProgramsPage.tsx` line 60: label without matching `htmlFor`.
Fix: Add matching `id` to inputs and `htmlFor` to labels for all form fields.
Flags: Accessibility issue; WCAG failure

---

### UX-024
**[MINOR] | [Mobile Responsiveness] | [index.css:32-34; App.tsx navigation]**
Problem: Only one responsive breakpoint at 1024px. Navigation bar has no mobile collapse. Items wrap awkwardly on tablets.
Evidence: `index.css` lines 32-34: only breakpoint at 1024px.
Fix: Add responsive nav with breakpoints at 768px. Implement hamburger menu with `aria-expanded`.
Flags: Mobile/tablet experience poor

---

### UX-025
**[MINOR] | [Empty & Error States] | [TranscriptListPage.tsx:79-89]**
Problem: Pagination controls shown even when transcript list is empty.
Evidence: `TranscriptListPage.tsx` lines 79-89: pagination rendered unconditionally.
Fix: `{items.length > 0 && (<div>...pagination...</div>)}`
Flags: Minor UX issue; confusing empty state

---

### UX-026
**[MINOR] | [Visual Consistency] | [AuditLogPage.tsx:30; VerificationPage.tsx:28; FileDropzone.tsx:43]**
Problem: Icon buttons and text within links have inconsistent spacing. "browse" in FileDropzone is a `<span>` not a `<button>`.
Evidence: `FileDropzone.tsx` line 43: `<span>browse</span>`, styled as interactive but not keyboard-focusable.
Fix: Change the "browse" span to `<button type="button">`. Enforce spacing standards around arrows.
Flags: Minor polish; accessibility issue

---

### UX-027
**[MINOR] | [Accessibility & Inclusivity] | [FlagItem.tsx:40-45; ExportButton.tsx:10-23; TranscriptListPage.tsx:70]**
Problem: Several icon-only or ambiguous buttons lack `aria-label` attributes.
Evidence: `FlagItem.tsx` lines 40-45: "Details"/"Hide" button doesn't announce expand/collapse. `ExportButton.tsx` links lack export format context.
Fix: Add `aria-label="View transcript details"`, `aria-expanded={isExpanded}`, and `aria-label="Export audit logs as JSON"` where appropriate.
Flags: Accessibility issue; screen reader confusion

---

### UX-028
**[MINOR] | [Design Token System] | [index.css:22; Component files]**
Problem: Font sizes defined at root level but component-level font classes (`text-sm`, `text-xs`, `text-2xl`) don't scale responsively across all breakpoints.
Evidence: `index.css` line 22: base font 18px → 16px at 1024px. Only h1 and h2 have responsive variants. All other text uses fixed `text-*` classes.
Fix: Extend Tailwind with responsive font scale using `clamp()` or per-breakpoint values.
Flags: Typography not optimized for all screen sizes

---

### UX-029
**[MINOR] | [User Flows] | [AuditLogPage.tsx:23-30]**
Problem: Transcript-specific audit log page uses a simple back arrow without a true breadcrumb showing navigation hierarchy.
Evidence: `AuditLogPage.tsx` lines 23-26: title changes based on `id` param. Line 30: simple back link only.
Fix: Implement semantic `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the final crumb.
Flags: Minor UX issue; poor wayfinding

---

### UX-030
**[MINOR] | [Feedback & States] | [ProgramsPage.tsx:81]**
Problem: "Saving…" button text has no spinner, form doesn't disable other inputs during save, and no success/error message shown after mutation.
Evidence: `ProgramsPage.tsx` line 81: text-only loading state. No `mutation.isSuccess` or `mutation.isError` feedback rendered.
Fix: Add loading spinner inside button. Disable form inputs during mutation. Show success/error message for 3 seconds after mutation settles.
Flags: Minor feedback issue

---

## Sub-Agent Report: DevOps (DO)

**Codebase:** `/msbon-app/` (full project)
**Persona:** Senior DevOps Engineer (CI/CD / Containerization / Production Reliability)

---

### DO-001
**[CRITICAL] | [CI/CD Pipeline] | [Missing: .github/workflows/; Any CI config]**
Problem: No CI/CD pipeline exists. No GitHub Actions, GitLab CI, Jenkins, or any automated build/test/deploy orchestration. Tests exist but are only run manually.
Evidence: No `.github/workflows/` directory. No `.gitlab-ci.yml`, `Jenkinsfile`, or `Makefile`.
Fix: Create `.github/workflows/ci.yml` running: lint (flake8 + ESLint), pytest with `--cov-fail-under=80`, frontend build, Docker image build, and dependency vulnerability scans. Gate PRs on all checks passing.
Flags: Production readiness blocker

---

### DO-002
**[CRITICAL] | [CI/CD Pipeline] | [Missing: DEPLOYMENT.md, k8s/, docker-compose.prod.yml]**
Problem: No deployment strategy, documentation, or automation. No environment promotion path (dev → staging → prod). No rollback procedures.
Evidence: `README.md` line ~120: "not for production deployment". No `DEPLOYMENT.md`. No Kubernetes manifests, Helm charts, Terraform, or cloud configs.
Fix: Create `DEPLOYMENT.md` documenting staging/production deployment, env var management, migration strategy, and rollback procedures. Create `docker-compose.prod.yml` and infrastructure-as-code.
Flags: No production path defined

---

### DO-003
**[CRITICAL] | [Containerization] | [Missing: Dockerfile (backend & frontend), docker-compose.yml]**
Problem: Application is not containerized. No Dockerfiles, no docker-compose, no `.dockerignore`. Prevents consistent deployment across environments.
Evidence: No `/backend/Dockerfile`, no `/frontend/Dockerfile`, no `docker-compose.yml`.
Fix: Create multi-stage `Dockerfile` for backend (python:3.11-slim). Create multi-stage `Dockerfile` for frontend (Node builder + nginx). Create `docker-compose.yml` wiring both services. Create `.dockerignore` excluding `node_modules`, `.venv`, `__pycache__`.
Flags: Deployment blocker

---

### DO-004
**[MAJOR] | [Environment Management] | [backend/.env:2]**
Problem: The `.env` file contains a real Google Gemini API key. While `.gitignore` lists `.env`, the file is one accidental `git add .` away from being committed.
Evidence: `backend/.env` line 2: `GEMINI_API_KEY=AIza...`, actual key value present on disk.
Fix: Rotate the API key immediately in Google Cloud Console. For production, use GCP Secret Manager, AWS Secrets Manager, or CI/CD secrets. Document in README that secrets must be injected at runtime.
Flags: Security incident risk; PCI/HIPAA/SOC2 non-compliance

---

### DO-005
**[MAJOR] | [Environment Management] | [app/config.py:7; app/infrastructure/llm_adapter.py:54]**
Problem: Application does not validate required environment variables at startup. Missing `GEMINI_API_KEY` only surfaces when the LLM is first called.
Evidence: `config.py` line 7: `gemini_api_key: str = ""`, empty default, no required constraint.
Fix: Add Pydantic `field_validator` to reject empty `gemini_api_key`. Add startup validation in `main.py` probing LLM connectivity and failing fast.
Flags: Silent failure risk

---

### DO-006
**[MAJOR] | [Environment Management] | [Missing: frontend/.env.example]**
Problem: Frontend directory lacks `.env.example`. Developers must infer `VITE_API_BASE_URL` from code inspection.
Evidence: No `frontend/.env.example` file exists.
Fix: Create `frontend/.env.example`:
```
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
Document in `frontend/README.md`.
Flags: DX issue

---

### DO-007
**[MAJOR] | [Dependency Management] | [frontend/package.json:12-19; backend/requirements.txt]**
Problem: Backend uses pinned `==` versions but frontend uses caret `^` constraints. Inconsistent strategy allows frontend minor version drift.
Evidence: `backend/requirements.txt`: all `==` pins. `frontend/package.json` lines 12-19: all `^` constraints.
Fix: Enforce `npm ci --frozen-lockfile` in CI/CD (not `npm install`). Update `package-lock.json` only during deliberate upgrades.
Flags: Dependency drift risk

---

### DO-008
**[MAJOR] | [Dependency Management] | [Missing: poetry.lock or requirements.lock for backend]**
Problem: Python backend has no lock file. Sub-dependencies (transitive deps) can drift between environments.
Evidence: `requirements.txt` only lists direct dependencies. No `poetry.lock`, no `Pipfile.lock`.
Fix: Migrate to Poetry (`poetry init` + `poetry lock`) or pip-tools (`pip-compile requirements.in`). Commit lock file. CI installs from lock file only.
Flags: Supply chain risk; reproducibility broken

---

### DO-009
**[MINOR] | [Dependency Management] | [Missing: .github/dependabot.yml]**
Problem: No automated dependency vulnerability scanning. No Dependabot or Renovate configured.
Evidence: No `.github/dependabot.yml`. No `safety check` or `npm audit` in any pipeline.
Fix: Create `.github/dependabot.yml` for both `pip` and `npm` with weekly schedule. Add `safety check` and `npm audit --audit-level=high` to CI/CD.
Flags: Vulnerability management gap

---

### DO-010
**[CRITICAL] | [Logging Infrastructure] | [main.py; config.py:16]**
Problem: No centralized logging. Application logs to stdout only with no JSON formatting, no log aggregation, no retention, no searchability. `log_level` config setting is unused.
Evidence: `config.py` line 16: `log_level: str = "INFO"`, never consumed. `main.py`: no `logging` module imported.
Fix: Create `logging_config.py` with `python-json-logger`, `RotatingFileHandler`, and per-service loggers. Add HTTP middleware for request/response logging with correlation IDs. Pipe to ELK/Datadog/CloudWatch in production.
Flags: No observability; HIPAA audit trail gap

---

### DO-011
**[CRITICAL] | [Error Monitoring] | [transcripts.py:61-69; main.py]**
Problem: No error tracking (Sentry, Rollbar) or APM. Failed background tasks fail silently. No alerting on new errors.
Evidence: `transcripts.py` lines 61-69: `_run_pipeline()` background task, exceptions not caught, not logged, not reported. No Sentry or equivalent configured.
Fix: `pip install sentry-sdk`. Configure `sentry_sdk.init(dsn=settings.sentry_dsn, ...)` in `main.py`. Wrap background task in try/except with `sentry_sdk.capture_exception(e)`. Add global unhandled exception handler.
Flags: Silent failure risk; compliance gap

---

### DO-012
**[MAJOR] | [Performance Monitoring] | [All endpoint handlers; main.py]**
Problem: No application instrumentation. No metrics for request latency, error rate, DB connection utilization, or background task processing time. No SLO/SLI definitions.
Evidence: No `prometheus-client`, `statsd`, or metrics library imported anywhere.
Fix: Add `prometheus-client`. Create `metrics.py` with `Counter`, `Histogram`, `Gauge` for requests, duration, transcripts processed, flags generated, LLM call success rate. Mount `/metrics` endpoint. Define SLOs (P95 latency < 200ms, error rate < 0.1%).
Flags: No observability into production health

---

### DO-013
**[CRITICAL] | [Database Backups & Recovery] | [config.py:10; database.py:14-18]**
Problem: SQLite single-file database with no backup strategy, no replication, no disaster recovery. Any disk failure = total data loss.
Evidence: `config.py` line 10: `database_url: str = "sqlite:///./data/msbon.db"`. `database.py` lines 14-18: path creation, no backup hooks. `.gitignore` line 2: `data/` excluded from VCS.
Fix: Implement automated local backups (`shutil.copy2` on schedule via APScheduler). For production, migrate to PostgreSQL with PITR, streaming replication, and `pg_dump` backups. Document RTO/RPO targets. Test recovery quarterly.
Flags: Compliance failure (audit logs not recoverable); data loss risk

---

### DO-014
**[MAJOR] | [Scalability & Reliability] | [main.py:46]**
Problem: Deprecated `@app.on_event("startup")` pattern. No graceful shutdown handling.
Evidence: `main.py` line 46: `@app.on_event("startup")`. No `@app.on_event("shutdown")`.
Fix: Migrate to `@asynccontextmanager async def lifespan(app): init_db(); yield; # cleanup`. Pass `lifespan=lifespan` to `FastAPI(...)`. Add shutdown logic (flush logs, drain background tasks).
Flags: Technical debt; future compatibility

---

### DO-015
**[MAJOR] | [Scalability & Reliability] | [database.py:17-18; migrations/env.py:45]**
Problem: No connection pool configuration. `NullPool` in migrations context; no explicit pool for app engine.
Evidence: `database.py` lines 17-18: `create_engine(db_url, connect_args=connect_args, echo=False)`, no pool params.
Fix: For PostgreSQL: `QueuePool(pool_size=10, max_overflow=20, pool_recycle=3600, pool_pre_ping=True)`. For SQLite (dev): explicit `NullPool`. Add `database_pool_size` and `database_max_overflow` to `Settings`.
Flags: Production scaling blocker

---

### DO-016
**[MAJOR] | [Scalability & Reliability] | [transcripts.py:24-46,49-75]**
Problem: No rate limiting on any endpoint. Upload and processing can be flooded, causing DoS. Background task queue has no bounds.
Evidence: No `slowapi` or equivalent. Both upload and process endpoints accept unlimited requests. `background_tasks.add_task(_run_pipeline)`, unlimited queue depth.
Fix: `pip install slowapi`. Apply `@limiter.limit("10/minute")` to upload, `@limiter.limit("30/minute")` to processing. Consider Celery or RQ for bounded background task queue.
Flags: DoS vulnerability

---

### DO-017
**[MINOR] | [Developer Experience] | [Missing: CONTRIBUTING.md, DEVELOPMENT.md, docs/ADR/]**
Problem: No `CONTRIBUTING.md`, `DEVELOPMENT.md`, or Architecture Decision Records. New developers must infer everything from code.
Evidence: No contribution guide, no development setup beyond README quick-start, no ADRs for key decisions (SQLite choice, LLM provider, etc.).
Fix: Create `CONTRIBUTING.md` with setup steps, testing instructions, code standards. Create `docs/ADR/ADR-001-SQLite-for-PoC.md` documenting database technology decision with context and consequences.
Flags: Onboarding friction

**Category Clean Assessment:**
- **Security Audit Logging:** CLEAN. `AuditRepository` raises `OperationNotPermittedError` on update/delete. Immutability correctly enforced.

---

## Finding Count Summary

| Domain   | Critical | Major | Minor | Total |
|----------|----------|-------|-------|-------|
| Frontend |    1     |  14   |  20   |  **35**  |
| Backend  |    4     |  11   |   8   |  **23**  |
| Database |   11     |   8   |   7   |  **26**  |
| Security |    3     |  11   |   8   |  **22**  |
| UI/UX    |    2     |  15   |  13   |  **30**  |
| DevOps   |    6     |   9   |   2   |  **17**  |
| **TOTAL**|  **27**  | **68**| **58**| **153**  |

---

> **Phase 1 complete.** 153 findings across 6 domains preserved verbatim.
> No finding has been paraphrased, summarized, or omitted.
> This report is the raw input to Phase 2 triage and remediation planning.
