/* Side-by-side compare of two transcripts. Catches the same applicant
 * submitting two transcripts (different files, same student name; or same
 * institution + different graduation date, the kinds of patterns paper
 * review misses).
 *
 * Route: /app/compare?a=<transcriptId>&b=<transcriptId>
 * Diff is simple field-level string equality with terracotta highlighting on
 * mismatches.
 */
import { Fragment } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getTranscript } from "../services/transcriptClient";
import type { TranscriptDetail } from "../types";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";
import SeverityBadge from "../components/ui/SeverityBadge";

interface FieldDef {
  label: string;
  get: (t: TranscriptDetail) => string | null;
}

const FIELDS: FieldDef[] = [
  { label: "Status",        get: (t) => t.status },
  { label: "Filename",      get: (t) => t.filename },
  { label: "Uploaded by",   get: (t) => t.uploaded_by },
  { label: "Student",       get: (t) => t.extracted_data?.student_name ?? null },
  { label: "Institution",   get: (t) => t.extracted_data?.institution_name ?? null },
  { label: "Program",       get: (t) => t.extracted_data?.program_name ?? null },
  { label: "Degree",        get: (t) => t.extracted_data?.degree_type ?? null },
  { label: "Graduation",    get: (t) => t.extracted_data?.graduation_date ?? null },
  { label: "Confirmed?",    get: (t) => (t.extracted_data ? (t.extracted_data.graduation_confirmed ? "Yes" : "No") : null) },
  { label: "Courses",       get: (t) => t.extracted_data ? String(t.extracted_data.courses.length) : null },
  { label: "Flags raised",  get: (t) => String(t.flags.length) },
];

export default function ComparePage() {
  const [params] = useSearchParams();
  const aId = params.get("a") || "";
  const bId = params.get("b") || "";

  const a = useQuery({
    queryKey: ["transcript", aId],
    queryFn: () => getTranscript(aId),
    enabled: !!aId,
  });
  const b = useQuery({
    queryKey: ["transcript", bId],
    queryFn: () => getTranscript(bId),
    enabled: !!bId,
  });

  if (!aId || !bId) {
    return (
      <Section bg="cream" padding="xl">
        <SectionLabel>Compare</SectionLabel>
        <DisplayHeading as="h1" size="lg" className="mt-4">
          Choose two transcripts to compare.
        </DisplayHeading>
        <p className="font-sans text-body-md text-charcoal-muted mt-6 max-w-[55ch]">
          From the queue, tick two rows and click "Compare selected." You can
          also paste two transcript IDs into the URL:
          <code className="ml-2 font-display italic text-charcoal">/app/compare?a=…&b=…</code>
        </p>
        <Link
          to="/app/transcripts"
          className="mt-10 inline-block font-sans text-label uppercase tracking-wider text-terracotta hover:text-terracotta-dark nav-underline transition-colors"
        >
          ← Go to queue
        </Link>
      </Section>
    );
  }

  const isLoading = a.isLoading || b.isLoading;
  const isError   = a.error || b.error || !a.data || !b.data;

  return (
    <Section bg="cream" padding="lg" container="wide">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <SectionLabel>Side by side</SectionLabel>
          <DisplayHeading as="h1" size="lg">
            Compare transcripts.
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted max-w-[55ch]">
            Differences are highlighted in terracotta. The same applicant
            submitting twice usually shows up first in <em>Student</em> and
            <em> Institution</em>.
          </p>
        </div>
        <Link
          to="/app/transcripts"
          className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta nav-underline transition-colors"
        >
          ← Back to queue
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      ) : isError ? (
        <p className="font-display italic text-display-md text-terracotta-dark" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
          One or both transcripts could not be loaded.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-px bg-charcoal-faint border border-charcoal-faint">
          {/* Headers */}
          <div className="bg-cream-dark p-6 md:p-8">
            <SectionLabel>Transcript A</SectionLabel>
            <p className="mt-2 font-display text-body-lg text-charcoal truncate" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
              {a.data!.filename}
            </p>
            <p className="mt-1 font-sans text-body-sm text-charcoal-muted">
              {a.data!.id.slice(0, 8)}…
            </p>
            <div className="mt-3">
              <SeverityBadge label={a.data!.status} />
            </div>
          </div>
          <div className="bg-cream-dark p-6 md:p-8">
            <SectionLabel>Transcript B</SectionLabel>
            <p className="mt-2 font-display text-body-lg text-charcoal truncate" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
              {b.data!.filename}
            </p>
            <p className="mt-1 font-sans text-body-sm text-charcoal-muted">
              {b.data!.id.slice(0, 8)}…
            </p>
            <div className="mt-3">
              <SeverityBadge label={b.data!.status} />
            </div>
          </div>

          {/* Field rows: each entry contributes a pair of grid cells. */}
          {FIELDS.map((field) => {
            const av = field.get(a.data!);
            const bv = field.get(b.data!);
            const diff = (av ?? "") !== (bv ?? "");
            return (
              <Fragment key={field.label}>
                <FieldCell field={field} value={av} diff={diff} />
                <FieldCell field={field} value={bv} diff={diff} />
              </Fragment>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-12 grid md:grid-cols-2 gap-12">
          <FlagSummary t={a.data!} label="A" />
          <FlagSummary t={b.data!} label="B" />
        </div>
      )}
    </Section>
  );
}

interface CellProps {
  field: FieldDef;
  value: string | null;
  diff: boolean;
}

function FieldCell({ field, value, diff }: CellProps) {
  return (
    <div
      className={`bg-cream p-6 md:p-8 flex flex-col gap-2 ${
        diff ? "ring-2 ring-terracotta ring-inset" : ""
      }`}
    >
      <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
        {field.label}
      </p>
      <p
        className={`font-display text-body-md break-all ${
          diff ? "text-terracotta" : "text-charcoal"
        }`}
        style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
      >
        {value ?? <span className="text-charcoal-muted italic">-</span>}
      </p>
    </div>
  );
}

function FlagSummary({ t, label }: { t: TranscriptDetail; label: string }) {
  return (
    <div>
      <SectionLabel>Flags · Transcript {label}</SectionLabel>
      <DisplayHeading as="h2" size="md" className="mt-3 mb-6">
        {t.flags.length} flag{t.flags.length === 1 ? "" : "s"}
      </DisplayHeading>
      {t.flags.length === 0 ? (
        <p className="font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
          No flags raised.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {t.flags.map((f) => (
            <li
              key={f.id}
              className="flex items-start gap-3 py-3 border-b border-charcoal-faint last:border-b-0"
            >
              <SeverityBadge label={f.severity} />
              <div>
                <p className="font-display text-body-md text-charcoal" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                  {f.description}
                </p>
                <p className="font-sans text-body-sm text-charcoal-muted">
                  {f.rule_id} · {f.category}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
