/* Single source of truth for every status/severity badge in the app.
 * The previous codebase had three duplicated badge maps using 8 distinct
 * Tailwind hues; this collapses to four semantic tones drawn from the
 * editorial palette: terracotta (alert), amber (in-progress), emerald
 * (success/clear), charcoal-muted (neutral).
 */
import type { ReactNode } from "react";

export type Tone = "alert" | "progress" | "success" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  alert:    "bg-terracotta-light text-terracotta border-terracotta/30",
  progress: "bg-cream-dark text-charcoal border-charcoal-faint",
  success:  "bg-cream-dark text-charcoal border-charcoal-faint",
  neutral:  "bg-cream-dark text-charcoal-muted border-charcoal-faint",
};

const TONE_DOT: Record<Tone, string> = {
  alert:    "bg-terracotta",
  progress: "bg-charcoal animate-pulse",
  success:  "bg-charcoal",
  neutral:  "bg-charcoal-muted",
};

// Map every status string the backend produces onto a tone.
export const STATUS_TONE: Record<string, Tone> = {
  // Transcript lifecycle
  UPLOADED:        "neutral",
  EXTRACTING:      "progress",
  EXTRACTED:       "progress",
  VERIFYING:       "progress",
  CLEAR:           "success",
  CLEARED:         "success",
  FLAGGED:         "alert",
  REVIEWED:        "success",
  AWAITING_REVIEW: "alert",
  FAILED:          "alert",
  // Severity
  HIGH:            "alert",
  MEDIUM:          "progress",
  LOW:             "neutral",
  // Audit outcome
  SUCCESS:         "success",
  FAILURE:         "alert",
  // Review decision
  CONFIRMED:       "success",
  OVERRIDDEN:      "alert",
  NEEDS_MORE_INFO: "neutral",
};

interface SeverityBadgeProps {
  label: string;
  tone?: Tone;            // explicit override; otherwise derived from label
  withDot?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function SeverityBadge({
  label,
  tone,
  withDot = true,
  className = "",
  children,
}: SeverityBadgeProps) {
  const resolved = tone ?? STATUS_TONE[label.toUpperCase()] ?? "neutral";
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 border font-sans text-label uppercase tracking-wider ${TONE_CLASS[resolved]} ${className}`}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className={`inline-block w-1.5 h-1.5 rounded-full ${TONE_DOT[resolved]}`}
        />
      )}
      {children ?? label}
    </span>
  );
}
