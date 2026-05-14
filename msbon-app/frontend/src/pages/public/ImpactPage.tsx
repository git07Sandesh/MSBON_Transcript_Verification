import { useQuery } from "@tanstack/react-query";
import Section        from "../../components/layout/Section";
import FadeUp         from "../../components/motion/FadeUp";
import SectionLabel   from "../../components/ui/SectionLabel";
import DisplayHeading from "../../components/ui/DisplayHeading";
import RuleCategoryIcon from "../../components/icons/RuleCategoryIcon";
import StatCounter from "../../components/dataviz/StatCounter";
import { fetchPublicInsights } from "../../services/insightsClient";

const RULES = [
  { id: "GRAD-001", name: "Missing graduation confirmation",     category: "Graduation",     severity: "HIGH",
    note: "No explicit degree-conferral statement found in the transcript." },
  { id: "GRAD-002", name: "Graduation date absent",              category: "Graduation",     severity: "MEDIUM",
    note: "The transcript does not record a graduation date." },
  { id: "ACCR-001", name: "Institution not in MS accredited list", category: "Accreditation", severity: "HIGH",
    note: "The school is not present in the seeded accredited-programs catalog." },
  { id: "ACCR-002", name: "Accreditation body not recognized",   category: "Accreditation",   severity: "MEDIUM",
    note: "The accreditor is neither ACEN nor CCNE." },
  { id: "COUR-001", name: "Required nursing courses missing",    category: "Coursework",     severity: "HIGH",
    note: "One or more required curriculum areas were not detected." },
  { id: "COUR-002", name: "Insufficient credit hours",           category: "Coursework",     severity: "MEDIUM",
    note: "Total nursing credits are below the program minimum." },
  { id: "FRAU-001", name: "Program completed too quickly",       category: "Fraud signal",   severity: "HIGH",
    note: "Time from enrollment to graduation is below a plausible minimum." },
  { id: "FRAU-002", name: "Suspicious grade distribution",       category: "Fraud signal",   severity: "MEDIUM",
    note: "Grade pattern is statistically inconsistent with the program." },
  { id: "FRAU-003", name: "Institution on fraud watch list",     category: "Fraud signal",   severity: "HIGH",
    note: "The school name matches a known-fraud entry." },
  { id: "FORM-001", name: "Required transcript fields missing",  category: "Formatting",     severity: "LOW",
    note: "Applicant, institution, or program could not be extracted." },
  { id: "FORM-002", name: "Inconsistent date formatting",        category: "Formatting",     severity: "LOW",
    note: "Multiple, conflicting date formats appear in the document." },
  { id: "FORM-003", name: "Inconsistent grade formatting",       category: "Formatting",     severity: "LOW",
    note: "Grade notation changes mid-transcript." },
];

export default function ImpactPage() {
  const { data: insights } = useQuery({
    queryKey: ["insights", "public"],
    queryFn: fetchPublicInsights,
    refetchInterval: 60_000,
  });

  // Live stats from the backend insights endpoint; sensible fallbacks while
  // the data is loading on first paint.
  const SEMESTER: { value: number; suffix?: string; label: string }[] = [
    {
      value: insights?.transcripts_total ?? 0,
      label: "Transcripts processed since the system started",
    },
    {
      value: insights?.flags_total ?? 0,
      label: "Verification flags raised",
    },
    {
      value: insights?.accredited_programs ?? 11,
      label: "Mississippi accredited programs in the catalog",
    },
    {
      value: 100,
      suffix: "%",
      label: "of overrides required a written justification",
    },
  ];
  return (
    <>
      {/* HERO -------------------------------------------------------------- */}
      <Section bg="cream" padding="xl">
        <FadeUp className="max-w-[60ch]">
          <SectionLabel>Impact · Spring 2026</SectionLabel>
          <DisplayHeading as="h1" size="xl" className="mt-4">
            The work, so far.
          </DisplayHeading>
          <p
            className="font-display italic text-body-lg text-charcoal-muted mt-8"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            A proof of concept against synthetic transcripts. The numbers are small on
            purpose, what matters is that every flag is explainable and every decision
            is owned.
          </p>
        </FadeUp>
      </Section>

      {/* LAST SEMESTER ----------------------------------------------------- */}
      <Section bg="cream-dark" padding="lg">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeUp>
            <figure>
              <div
                className="aspect-[4/5] bg-cream border border-charcoal-faint relative overflow-hidden"
                role="img"
                aria-label="A representative synthetic transcript fixture in PDF form."
              >
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full opacity-[0.05] text-charcoal"
                  viewBox="0 0 200 250"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Faux page lines */}
                  {[...Array(18)].map((_, i) => (
                    <line key={i} x1="20" x2="180" y1={20 + i * 12} y2={20 + i * 12}
                      stroke="currentColor" strokeWidth="0.4" />
                  ))}
                </svg>
                <div className="absolute inset-x-10 top-10 bottom-10 border border-charcoal-faint flex items-end p-5">
                  <span
                    className="font-display italic text-body-lg text-charcoal-muted"
                    style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
                  >
                    Synthetic fixture<br />fraud_BSN.pdf
                  </span>
                </div>
              </div>
              <figcaption className="mt-3 font-sans text-body-sm text-charcoal-muted">
                Synthetic transcript, synthetic data, no real applicant.
              </figcaption>
            </figure>
          </FadeUp>

          <FadeUp delay={0.1}>
            <SectionLabel>2026 · Synthetic cohort, n = 3</SectionLabel>
            <DisplayHeading as="h2" size="md" className="mt-3 mb-6">
              The three transcripts the system met first.
            </DisplayHeading>
            <div className="prose-editorial">
              <p style={{ fontSize: "1.125rem" }}>
                The proof-of-concept ships with three synthetic PDFs. The clean BSN
                graduate from the University of Southern Mississippi passes every rule
                and lands in <em>Cleared</em>. The accelerated-BSN candidate from a
                fictional online institute fires four flags in seconds, including the
                hard one, an enrollment-to-graduation duration that no real program
                allows. The third transcript is honestly incomplete; it is missing a
                graduation date and triggers exactly the rules a paper reviewer would
                circle in red.
              </p>
              <p style={{ fontSize: "1.125rem" }}>
                In each case the human reviewer is shown the rule that fired, the line
                of the transcript that triggered it, and a plain-language explanation
                they can quote in a memo.
              </p>
            </div>
            <p className="mt-8 font-sans text-body-sm italic text-terracotta-dark">
              Synthetic data, proof of concept, not production.
            </p>
          </FadeUp>
        </div>
      </Section>

      {/* THIS SEMESTER NUMBERS --------------------------------------------- */}
      <Section bg="cream" padding="lg">
        <FadeUp>
          <SectionLabel>This semester</SectionLabel>
          <DisplayHeading as="h2" size="lg" className="mt-4 mb-12">
            What's running today.
          </DisplayHeading>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 border-t border-charcoal-faint pt-12">
          {SEMESTER.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.08}>
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-display-lg text-terracotta tabular-nums"
                style={{ fontVariationSettings: '"opsz" 96, "wght" 700' }}
              />
              <p className="mt-3 font-sans text-body-sm text-charcoal-muted max-w-[22ch]">
                {stat.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* RULES IN PRODUCTION ----------------------------------------------- */}
      <Section bg="cream-dark" padding="xl">
        <FadeUp>
          <SectionLabel>Rules in production</SectionLabel>
          <DisplayHeading as="h2" size="lg" className="mt-4 mb-4">
            Twelve rules. Five categories. Zero black boxes.
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted max-w-[58ch] mb-16">
            Each rule is a small, transparent predicate. When it fires it must produce
            the rule ID, the verbatim source excerpt that triggered it, and an
            explanation a non-engineer can read out loud.
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal-faint border border-charcoal-faint">
          {RULES.map((rule, i) => (
            <FadeUp
              key={rule.id}
              delay={Math.min(i * 0.04, 0.4)}
              className="bg-cream-dark p-7 flex flex-col gap-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="font-display text-display-md text-terracotta"
                  style={{ fontVariationSettings: '"opsz" 36, "wght" 700' }}
                >
                  {rule.id}
                </span>
                <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                  {rule.severity}
                </span>
              </div>
              <RuleCategoryIcon
                category={rule.category.toUpperCase().replace(/ /g, "_").replace("_SIGNAL","")}
                size={28}
                tone="terracotta"
                decorative
                className="mt-1"
              />
              <p className="font-display text-body-md text-charcoal" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                {rule.name}
              </p>
              <p className="font-sans text-body-sm text-charcoal-muted">{rule.note}</p>
              <p className="mt-auto font-sans text-label uppercase tracking-wider text-charcoal-muted">
                {rule.category}
              </p>
            </FadeUp>
          ))}
        </div>
      </Section>
    </>
  );
}
