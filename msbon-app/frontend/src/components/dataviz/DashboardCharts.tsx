/* Three small, single-color, no-axis-clutter charts for the dashboard.
 * Plain SVG — no chart library. Editorial restraint: terracotta on
 * cream-dark, no gridlines, labels in DM Sans label scale.
 */
import type { DailyCount, RuleCount, DecisionCount } from "../../services/insightsClient";

const HEIGHT_BARS = 140;

/* ── Decisions over time ──────────────────────────────────────────────── */

interface DotsProps {
  data: DailyCount[];
  label?: string;
}
export function DecisionsTimeline({ data, label = "Decisions, last 14 days" }: DotsProps) {
  const padded = padDaily(data, 14);
  const max = Math.max(1, ...padded.map((d) => d.count));
  const w = 100 / Math.max(padded.length, 1);

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
        {label}
      </figcaption>
      <svg
        viewBox={`0 0 100 ${HEIGHT_BARS}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: HEIGHT_BARS, display: "block" }}
        aria-label={`${label}: ${padded.reduce((s, d) => s + d.count, 0)} reviews`}
      >
        {padded.map((d, i) => {
          const h = (d.count / max) * (HEIGHT_BARS - 10);
          const x = i * w;
          return (
            <rect
              key={`${d.date}-${i}`}
              x={x + 0.5}
              y={HEIGHT_BARS - h}
              width={Math.max(w - 1, 1.4)}
              height={Math.max(h, 1.5)}
              className={d.count > 0 ? "fill-terracotta" : "fill-charcoal-faint"}
            />
          );
        })}
        <line
          x1="0"
          x2="100"
          y1={HEIGHT_BARS - 0.5}
          y2={HEIGHT_BARS - 0.5}
          className="stroke-charcoal-faint"
          strokeWidth="0.4"
        />
      </svg>
      <div className="flex justify-between font-sans text-body-sm text-charcoal-muted">
        <span>{padded[0]?.date.slice(5) || ""}</span>
        <span>{padded[padded.length - 1]?.date.slice(5) || ""}</span>
      </div>
    </figure>
  );
}

function padDaily(data: DailyCount[], days: number): DailyCount[] {
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const out: DailyCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return out;
}

/* ── Top firing rules (ranked bars) ───────────────────────────────────── */

interface RuleBarsProps {
  data: RuleCount[];
  label?: string;
}
export function TopFiringRules({ data, label = "Top firing rules" }: RuleBarsProps) {
  if (!data.length) {
    return (
      <figure className="flex flex-col gap-4">
        <figcaption className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
          {label}
        </figcaption>
        <p className="font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
          No rules have fired yet.
        </p>
      </figure>
    );
  }
  const max = data[0].count;
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
        {label}
      </figcaption>
      <ul className="flex flex-col gap-3">
        {data.slice(0, 6).map((r) => {
          const pct = (r.count / max) * 100;
          return (
            <li key={r.rule_id} className="flex items-center gap-4">
              <span className="font-sans text-body-sm text-charcoal-muted w-20 shrink-0 tabular-nums">
                {r.rule_id}
              </span>
              <div className="flex-1 h-2 bg-charcoal-faint relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-terracotta"
                  style={{ width: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="font-display text-body-md text-charcoal w-10 text-right tabular-nums" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                {r.count}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/* ── Decision breakdown (proportional bar) ────────────────────────────── */

interface DecisionProps {
  data: DecisionCount[];
  label?: string;
}
const DECISION_LABEL: Record<string, string> = {
  CONFIRMED:       "Confirmed",
  OVERRIDDEN:      "Overridden",
  NEEDS_MORE_INFO: "Needs info",
};
const DECISION_FILL: Record<string, string> = {
  CONFIRMED:       "bg-charcoal",
  OVERRIDDEN:      "bg-terracotta",
  NEEDS_MORE_INFO: "bg-charcoal-muted",
};

export function DecisionBreakdown({ data, label = "Decision split" }: DecisionProps) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
        {label}
      </figcaption>
      {total === 0 ? (
        <p className="font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
          No decisions submitted yet.
        </p>
      ) : (
        <>
          <div className="h-3 w-full flex bg-charcoal-faint overflow-hidden">
            {data.map((d) => (
              <div
                key={d.decision}
                aria-hidden="true"
                style={{ width: `${(d.count / total) * 100}%` }}
                className={DECISION_FILL[d.decision] ?? "bg-charcoal-muted"}
              />
            ))}
          </div>
          <dl className="flex flex-col gap-2 mt-2">
            {data.map((d) => (
              <div key={d.decision} className="flex items-center gap-3">
                <span aria-hidden="true" className={`w-2 h-2 ${DECISION_FILL[d.decision] ?? "bg-charcoal-muted"}`} />
                <dt className="font-sans text-body-sm text-charcoal">
                  {DECISION_LABEL[d.decision] ?? d.decision}
                </dt>
                <dd className="ml-auto font-display text-body-md text-charcoal tabular-nums" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                  {d.count}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </figure>
  );
}
