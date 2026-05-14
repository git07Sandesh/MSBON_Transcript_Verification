import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Section          from "../../components/layout/Section";
import FadeUp           from "../../components/motion/FadeUp";
import SectionLabel     from "../../components/ui/SectionLabel";
import DisplayHeading   from "../../components/ui/DisplayHeading";
import PullQuote        from "../../components/ui/PullQuote";
import CTAButton        from "../../components/ui/CTAButton";
import StatCounter      from "../../components/dataviz/StatCounter";
import Asterism         from "../../components/ornaments/Asterism";

const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 12,             label: "Transparent verification rules" },
  { value: 100, suffix: "%", label: "Audit coverage of every action" },
  { value: 0,              label: "Automated licensure decisions" },
];

const TEAM = [
  { initials: "SL", name: "Suvi Lama",         role: "Product Manager" },
  { initials: "SB", name: "Sandesh Bhattarai", role: "Engineering, design" },
  { initials: "NT", name: "Nishit Thapa",      role: "Backend, rule engine" },
  { initials: "KS", name: "Kiran Silwal",      role: "Data, extraction" },
  { initials: "CD", name: "Chance Davis",      role: "DevOps, CI" },
];

export default function HomePage() {
  return (
    <>
      {/* HERO -------------------------------------------------------------- */}
      <section className="bg-cream min-h-[80vh] md:min-h-screen flex flex-col">
        <div className="container-editorial flex-1 grid md:grid-cols-5 gap-12 md:gap-16 items-center pt-16 pb-12 md:pt-24">
          <div className="md:col-span-3 flex flex-col gap-8">
            <SectionLabel>
              A Mississippi licensure initiative · Hattiesburg, MS
            </SectionLabel>

            <DisplayHeading as="h1" size="2xl">
              Every transcript,<br />examined.
            </DisplayHeading>

            <p
              className="font-display italic text-display-md text-charcoal-muted max-w-[28ch]"
              style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
            >
              AI-assisted first-pass verification for nursing licensure&nbsp;- humans keep the decision.
            </p>

            <div className="pt-6">
              <Link to="/contact">
                <CTAButton>Get in touch</CTAButton>
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <figure className="flex flex-col gap-3">
              <div
                className="relative aspect-[4/5] bg-cream-dark border border-charcoal-faint overflow-hidden"
                role="img"
                aria-label="A nursing transcript under review on a desk in Hattiesburg, Mississippi."
              >
                {/* Editorial placeholder, engraved hatching pattern hints at archival paper */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full opacity-[0.04] text-charcoal"
                  viewBox="0 0 200 250"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M0 4L4 0" stroke="currentColor" strokeWidth="0.6" />
                    </pattern>
                  </defs>
                  <rect width="200" height="250" fill="url(#hatch)" />
                </svg>
                <div className="absolute inset-x-10 top-12 bottom-12 border border-charcoal-faint flex items-center justify-center">
                  <span
                    className="font-display italic text-display-md text-charcoal-muted"
                    style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}
                  >
                    Transcript<br />under review
                  </span>
                </div>
              </div>
              <figcaption className="font-sans text-body-sm text-charcoal-muted">
                Image: A nursing transcript under review · Hattiesburg, MS.
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="container-editorial border-t border-charcoal-faint py-6 flex items-center justify-between">
          <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
            Scroll
          </p>
          <motion.span
            aria-hidden="true"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="font-sans text-label text-charcoal-muted opacity-60"
          >
            ↓
          </motion.span>
        </div>
      </section>

      {/* NUMBERS ----------------------------------------------------------- */}
      <Section bg="cream-dark" padding="lg">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-charcoal-faint">
          {STATS.map((stat, i) => (
            <FadeUp
              key={stat.label}
              delay={i * 0.12}
              className="px-6 md:px-10 py-12 md:py-6 flex flex-col gap-3 md:items-start items-start"
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-display-xl text-terracotta tabular-nums"
                style={{ fontVariationSettings: '"opsz" 144, "wght" 700' }}
              />
              <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted max-w-[20ch]">
                {stat.label}
              </span>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4} className="text-center mt-16">
          <p
            className="font-display italic text-body-lg text-charcoal-muted max-w-[44ch] mx-auto"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            Twelve rules. Every flag explained. Every decision a person's.
          </p>
        </FadeUp>
      </Section>

      {/* OUR STORY --------------------------------------------------------- */}
      <Section bg="cream" padding="xl" container="prose">
        <FadeUp>
          <SectionLabel>Our Story</SectionLabel>
          <DisplayHeading as="h2" size="lg" className="mt-4 mb-12">
            Why this exists
          </DisplayHeading>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="prose-editorial prose-drop-cap">
            <p>
              Operation Nightingale, the 2023 federal investigation that uncovered
              thousands of fraudulent nursing diplomas, did not surprise the people
              who do this work for a living. State boards have always known the manual
              transcript review is slow, uneven, and porous. Bad actors found the gaps
              long before the headlines did.
            </p>
            <p>
              The Mississippi State Board of Nursing reviews every nursing-school
              transcript by hand. Each licensure file is a stack of paper, a list of
              accredited programs to cross-reference, and a tired reviewer trying to
              stay attentive at the end of an afternoon. The process produces the right
              answer most of the time. Most of the time is not the same as always.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <Asterism />
        </FadeUp>

        <FadeUp delay={0.15}>
          <PullQuote attribution="Team Nexus, design statement">
            AI proposes. People decide.
          </PullQuote>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="prose-editorial">
            <p>
              We built a tool that does the boring half of the work, extracting
              structured data from a transcript, evaluating it against twelve
              transparent rules, and presents the result to a human reviewer who
              keeps full authority. Every flag carries the rule that fired, the
              source excerpt the rule fired against, and a plain-language
              explanation. Every decision is logged. Nothing is automated that
              shouldn't be.
            </p>
            <p>
              The system is small. It does one thing. It is meant to make a person's
              afternoon a little less tired, and a state board a little less porous.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="mt-16 pt-12 border-t border-charcoal-faint">
            <SectionLabel className="mb-6">The team</SectionLabel>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {TEAM.map((p) => (
                <li key={p.name} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex-none w-12 h-12 border border-charcoal-faint bg-cream flex items-center justify-center font-display text-body-md text-terracotta"
                    style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
                  >
                    {p.initials}
                  </span>
                  <div>
                    <p className="font-sans font-medium text-body-md text-charcoal">{p.name}</p>
                    <p className="font-sans text-body-sm text-charcoal-muted">{p.role}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-sans text-body-sm text-charcoal-muted italic">
              Team Nexus · University of Southern Mississippi · CSC 424 senior capstone, Spring 2026.
            </p>
          </div>
        </FadeUp>
      </Section>

      {/* CTA --------------------------------------------------------------- */}
      <Section bg="cream-dark" padding="xl">
        <FadeUp className="max-w-[44ch] mx-auto text-center flex flex-col items-center gap-8">
          <SectionLabel>Talk to the team</SectionLabel>
          <DisplayHeading as="h2" size="lg">
            Want it for your board?
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted">
            We're available to talk through the approach, share the source, or pilot
            it against your synthetic test set. No vendor pitch. No NDAs. Just a tool.
          </p>
          <Link to="/contact">
            <CTAButton>Get in touch</CTAButton>
          </Link>
        </FadeUp>
      </Section>
    </>
  );
}
