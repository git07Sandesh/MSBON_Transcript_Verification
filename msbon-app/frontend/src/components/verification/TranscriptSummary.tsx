import { motion } from "framer-motion";
import type { TranscriptDetail } from "../../types";
import SeverityBadge from "../ui/SeverityBadge";

interface Props {
  transcript: TranscriptDetail;
}

interface Field {
  label: string;
  value: string | null;
  emphasize?: boolean;
}

export default function TranscriptSummary({ transcript }: Props) {
  const ed = transcript.extracted_data;

  const fields: Field[] = ed
    ? [
        { label: "Student",       value: ed.student_name },
        { label: "Institution",   value: ed.institution_name, emphasize: true },
        { label: "Program",       value: ed.program_name },
        { label: "Degree",        value: ed.degree_type },
        { label: "Graduation",    value: ed.graduation_date },
        { label: "Confirmed?",    value: ed.graduation_confirmed ? "Yes" : "No" },
        { label: "Courses",       value: String(ed.courses.length) },
        { label: "Total credits", value: String(ed.courses.reduce((s, c) => s + (c.credits ?? 0), 0)) },
      ]
    : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="border border-charcoal-faint bg-cream-dark px-6 py-8 md:px-10 md:py-10"
      aria-labelledby="transcript-heading"
    >
      <header className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div className="flex flex-col gap-2">
          <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
            Transcript
          </p>
          <h1
            id="transcript-heading"
            className="font-display text-display-lg text-charcoal break-all"
            style={{ fontVariationSettings: '"opsz" 96, "wght" 400' }}
          >
            {transcript.filename}
          </h1>
        </div>
        <SeverityBadge label={transcript.status} />
      </header>

      {ed ? (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <dt className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                {f.label}
              </dt>
              <dd
                className={`${
                  f.emphasize
                    ? "font-display text-body-lg text-charcoal"
                    : "font-sans text-body-md text-charcoal"
                }`}
                style={f.emphasize ? { fontVariationSettings: '"opsz" 9, "wght" 400' } : undefined}
              >
                {f.value || <span className="text-charcoal-muted">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="font-sans text-body-md text-charcoal-muted">
          Extraction has not produced data yet.
        </p>
      )}
    </motion.section>
  );
}
