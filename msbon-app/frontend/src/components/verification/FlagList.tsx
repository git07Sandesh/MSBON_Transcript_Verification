import { motion } from "framer-motion";
import type { Flag } from "../../types";
import FlagItem from "./FlagItem";

interface Props {
  flags: Flag[];
  transcriptId: string;
  staffId: string;
  onReviewSubmitted: () => void;
  flashFlagId?: string | null;
}

const SEVERITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default function FlagList({
  flags,
  transcriptId,
  staffId,
  onReviewSubmitted,
  flashFlagId,
}: Props) {
  if (flags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-charcoal-faint bg-cream-dark px-8 py-10 flex flex-col gap-3 items-start"
      >
        <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
          Clear
        </span>
        <p
          className="font-display text-display-md text-charcoal"
          style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
        >
          All twelve rules passed.
        </p>
        <p className="font-sans text-body-md text-charcoal-muted max-w-[44ch]">
          No verification flags were raised on this transcript. The reviewer's job
          is done — though a confirmation note is still good practice.
        </p>
      </motion.div>
    );
  }

  // Sort by severity then by category for predictable scanning
  const sorted = [...flags].sort((a, b) => {
    const sev = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (sev !== 0) return sev;
    return a.category.localeCompare(b.category);
  });

  return (
    <section aria-labelledby="flags-heading">
      <div className="flex items-baseline justify-between mb-6">
        <h2
          id="flags-heading"
          className="font-display text-display-md text-charcoal"
          style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
        >
          {sorted.length} flag{sorted.length === 1 ? "" : "s"}
        </h2>
        <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
          Sorted by severity
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {sorted.map((flag, i) => (
          <motion.div
            key={flag.id}
            id={`flag-${flag.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={
              flashFlagId === flag.id
                ? { opacity: 1, y: 0, boxShadow: "0 0 0 2px var(--terracotta)" }
                : { opacity: 1, y: 0, boxShadow: "0 0 0 0px rgba(184,74,50,0)" }
            }
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <FlagItem
              flag={flag}
              transcriptId={transcriptId}
              staffId={staffId}
              onReviewSubmitted={onReviewSubmitted}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
