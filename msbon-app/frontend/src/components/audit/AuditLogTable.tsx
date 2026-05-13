import { motion } from "framer-motion";
import type { AuditLog } from "../../types";
import SeverityBadge from "../ui/SeverityBadge";

interface Props {
  logs: AuditLog[];
}

const ACTION_LABEL: Record<string, string> = {
  UPLOAD:        "Transcript uploaded",
  EXTRACT:       "Extraction run",
  VERIFY:        "Verification run",
  REVIEW_FLAG:   "Flag confirmed",
  OVERRIDE_FLAG: "Flag overridden",
  EXPORT:        "Audit log exported",
  VIEW:          "Record viewed",
  LOGIN:         "Sign-in",
  LOGOUT:        "Sign-out",
};

export default function AuditLogTable({ logs }: Props) {
  if (!logs.length) {
    return (
      <div className="border border-charcoal-faint bg-cream-dark px-8 py-12 text-center">
        <p className="font-display italic text-display-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
          No audit entries match these filters.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col" aria-label="Audit log entries">
      {logs.map((log, i) => {
        const ts = new Date(log.timestamp);
        const isFailure = log.outcome !== "SUCCESS";
        return (
          <motion.li
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.025, 0.4), ease: [0.22, 1, 0.36, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-[140px_180px_1fr_140px] gap-4 md:gap-8 py-6 border-b border-charcoal-faint last:border-b-0"
          >
            {/* Severity rail */}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 bottom-0 w-1 ${isFailure ? "bg-terracotta" : "bg-charcoal"}`}
            />

            <div className="pl-4 md:pl-6 flex flex-col gap-0.5">
              <time
                dateTime={log.timestamp}
                className="font-sans text-body-sm text-charcoal"
              >
                {ts.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </time>
              <span className="font-sans text-body-sm text-charcoal-muted">
                {ts.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                Actor
              </span>
              <span className="font-sans text-body-md text-charcoal">
                {log.actor_id}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <p
                className="font-display text-body-lg text-charcoal"
                style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
              >
                {ACTION_LABEL[log.action_type] || log.action_type}
              </p>
              <p className="font-sans text-body-sm text-charcoal-muted break-all line-clamp-2">
                {log.action_detail}
              </p>
            </div>

            <div className="md:flex md:justify-end items-start">
              <SeverityBadge label={log.outcome} />
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
