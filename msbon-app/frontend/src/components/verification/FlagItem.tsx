import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Flag } from "../../types";
import RuleExplanation from "./RuleExplanation";
import ReviewForm from "../review/ReviewForm";
import SeverityBadge from "../ui/SeverityBadge";
import RuleCategoryIcon from "../icons/RuleCategoryIcon";

const SEVERITY_BAR: Record<string, string> = {
  HIGH:   "bg-terracotta",
  MEDIUM: "bg-charcoal",
  LOW:    "bg-charcoal-muted",
};

interface Props {
  flag: Flag;
  transcriptId: string;
  staffId: string;
  onReviewSubmitted: () => void;
}

export default function FlagItem({
  flag,
  transcriptId,
  staffId,
  onReviewSubmitted,
}: Props) {
  // Expanded by default — the audit explicitly called out that hiding the
  // explanation + review form behind a click slowed down reviewers.
  const [expanded, setExpanded] = useState(true);

  return (
    <article className="relative bg-cream border border-charcoal-faint">
      {/* Severity color rail */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-1 ${SEVERITY_BAR[flag.severity]}`}
      />

      <div className="pl-8 pr-6 py-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <RuleCategoryIcon category={flag.category} size={20} tone="terracotta" decorative />
              <SeverityBadge label={flag.severity} />
              <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                {flag.rule_id} · {flag.category}
              </span>
              {flag.is_fraud_indicator && (
                <SeverityBadge label="Fraud" tone="alert" />
              )}
            </div>
            <h3
              className="font-display text-display-md text-charcoal mt-1"
              style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
            >
              {flag.description}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors min-h-[44px] flex items-center"
            aria-expanded={expanded}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </header>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid md:grid-cols-2 gap-10 pt-6 border-t border-charcoal-faint">
                <div>
                  <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-3">
                    Why this fired
                  </p>
                  <RuleExplanation
                    explanation={flag.explanation}
                    sourceExcerpt={flag.source_excerpt}
                  />
                </div>

                <div>
                  <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-3">
                    Your decision
                  </p>
                  {flag.review ? (
                    <div className="flex flex-col gap-3">
                      <SeverityBadge label={flag.review.decision} />
                      {flag.review.annotation && (
                        <p className="font-sans text-body-md text-charcoal-muted">
                          {flag.review.annotation}
                        </p>
                      )}
                      {flag.review.override_reason && (
                        <div className="border-l-2 border-terracotta pl-4">
                          <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-1">
                            Override reason
                          </p>
                          <p className="font-sans text-body-md text-charcoal">
                            {flag.review.override_reason}
                          </p>
                        </div>
                      )}
                      <p className="font-sans text-body-sm text-charcoal-muted">
                        Reviewed {new Date(flag.review.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <ReviewForm
                      flagId={flag.id}
                      transcriptId={transcriptId}
                      staffId={staffId}
                      onSubmitted={onReviewSubmitted}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
