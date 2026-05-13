import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchFullInsights } from "../services/insightsClient";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";
import SeverityBadge from "../components/ui/SeverityBadge";
import StatCounter from "../components/dataviz/StatCounter";
import FadeUp from "../components/motion/FadeUp";
import {
  DecisionsTimeline,
  TopFiringRules,
  DecisionBreakdown,
} from "../components/dataviz/DashboardCharts";

const ACTION_LABEL: Record<string, string> = {
  UPLOAD:        "Transcript uploaded",
  EXTRACT:       "Extraction run",
  VERIFY:        "Verification run",
  REVIEW_FLAG:   "Flag confirmed",
  OVERRIDE_FLAG: "Flag overridden",
  EXPORT:        "Audit log exported",
  VIEW:          "Record viewed",
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights", "summary"],
    queryFn: fetchFullInsights,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Section bg="cream" padding="xl">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      </Section>
    );
  }
  if (error || !data) {
    return (
      <Section bg="cream" padding="xl">
        <p className="font-display italic text-display-md text-terracotta" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
          Could not load insights.
        </p>
      </Section>
    );
  }

  const { public: p, transcript_status, top_firing_rules, decision_breakdown, decisions_last_14_days, recent_actions } = data;

  const KPIs = [
    { value: p.transcripts_total,    label: "Transcripts processed" },
    { value: p.flags_total,          label: "Flags raised" },
    { value: p.overrides_total,      label: "Overrides issued" },
    { value: p.accredited_programs,  label: "Accredited programs" },
  ];

  return (
    <Section bg="cream" padding="lg" container="wide">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <SectionLabel>Overview</SectionLabel>
          <DisplayHeading as="h1" size="lg">
            Dashboard.
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted max-w-[55ch]">
            What the system has done since it started running, in one screen.
          </p>
        </div>
        <Link
          to="/app/transcripts"
          className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta nav-underline transition-colors"
        >
          See the queue →
        </Link>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-charcoal-faint border-t border-b border-charcoal-faint mb-16">
        {KPIs.map((kpi, i) => (
          <FadeUp
            key={kpi.label}
            delay={i * 0.06}
            className="bg-cream-dark px-6 py-10 flex flex-col gap-3"
          >
            <StatCounter
              value={kpi.value}
              className="font-display text-display-lg text-terracotta tabular-nums"
              style={{ fontVariationSettings: '"opsz" 96, "wght" 700' }}
            />
            <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted max-w-[20ch]">
              {kpi.label}
            </p>
          </FadeUp>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
        <FadeUp className="lg:col-span-2">
          <DecisionsTimeline data={decisions_last_14_days} />
        </FadeUp>
        <FadeUp delay={0.06}>
          <DecisionBreakdown data={decision_breakdown} />
        </FadeUp>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
        <FadeUp className="lg:col-span-2">
          <TopFiringRules data={top_firing_rules} />
        </FadeUp>
        <FadeUp delay={0.06}>
          <figure className="flex flex-col gap-4">
            <figcaption className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
              Transcript status
            </figcaption>
            <ul className="flex flex-col gap-3">
              {transcript_status.map((s) => (
                <li key={s.status} className="flex items-center gap-4">
                  <SeverityBadge label={s.status} />
                  <span className="ml-auto font-display text-body-md text-charcoal tabular-nums" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                    {s.count}
                  </span>
                </li>
              ))}
              {transcript_status.length === 0 && (
                <li className="font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                  No transcripts yet.
                </li>
              )}
            </ul>
          </figure>
        </FadeUp>
      </div>

      {/* Recent activity */}
      <div>
        <SectionLabel>Recent activity</SectionLabel>
        <DisplayHeading as="h2" size="md" className="mt-3 mb-8">
          The last eight things that happened.
        </DisplayHeading>
        {recent_actions.length === 0 ? (
          <p className="font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
            No activity recorded yet.
          </p>
        ) : (
          <ol className="flex flex-col">
            {recent_actions.map((a, i) => {
              const failed = a.outcome !== "SUCCESS";
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative grid grid-cols-[140px_1fr_120px] gap-6 py-4 border-b border-charcoal-faint last:border-b-0"
                >
                  <span aria-hidden="true" className={`absolute left-0 top-0 bottom-0 w-1 ${failed ? "bg-terracotta" : "bg-charcoal"}`} />
                  <time className="pl-4 font-sans text-body-sm text-charcoal-muted whitespace-nowrap">
                    {new Date(a.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-display text-body-md text-charcoal truncate" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                      {ACTION_LABEL[a.action_type] || a.action_type}
                    </p>
                    <p className="font-sans text-body-sm text-charcoal-muted truncate">
                      {a.actor_id}
                      {a.transcript_id && (
                        <>
                          {" · "}
                          <Link to={`/app/transcripts/${a.transcript_id}`} className="hover:text-terracotta transition-colors underline underline-offset-4 decoration-charcoal-faint">
                            {a.transcript_id.slice(0, 8)}…
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-start justify-end">
                    <SeverityBadge label={a.outcome} />
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </div>
    </Section>
  );
}
