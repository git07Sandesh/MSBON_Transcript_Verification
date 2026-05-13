import { Link } from "react-router-dom";
import Section        from "../../components/layout/Section";
import FadeUp         from "../../components/motion/FadeUp";
import SectionLabel   from "../../components/ui/SectionLabel";
import DisplayHeading from "../../components/ui/DisplayHeading";
import PullQuote      from "../../components/ui/PullQuote";
import CTAButton      from "../../components/ui/CTAButton";
import HandwrittenArrow from "../../components/ornaments/HandwrittenArrow";

const STEPS = [
  {
    n: "01",
    label: "Extract",
    body:
      "pdfplumber pulls the raw text. Tesseract handles scanned images. A large language model normalizes the result into a strict JSON schema. We never trust the LLM with a decision; it just gives the data shape.",
  },
  {
    n: "02",
    label: "Verify",
    body:
      "Twelve transparent rules run on the structured data. Every flag carries the rule ID, the verbatim source excerpt that triggered it, and a plain-language explanation a reviewer can quote.",
  },
  {
    n: "03",
    label: "Review",
    body:
      "Staff confirm, override, or request more information. An override requires a written justification. Every action is captured in a tamper-evident audit log that exports as CSV.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* HERO -------------------------------------------------------------- */}
      <Section bg="cream" padding="xl">
        <FadeUp className="max-w-[60ch]">
          <SectionLabel>Process</SectionLabel>
          <DisplayHeading as="h1" size="xl" className="mt-4">
            Three steps. No surprises.
          </DisplayHeading>
          <p
            className="font-display italic text-body-lg text-charcoal-muted mt-8"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            Extract, verify, review. The first two are mechanical. The third is the
            only one that matters, and it stays with a person.
          </p>
        </FadeUp>
      </Section>

      {/* HIDDEN COSTS ------------------------------------------------------ */}
      <Section bg="cream" padding="md" container="prose">
        <FadeUp>
          <SectionLabel>The hidden cost of manual review</SectionLabel>
          <DisplayHeading as="h2" size="md" className="mt-4 mb-8">
            What the paper-stack process really costs.
          </DisplayHeading>

          <div className="prose-editorial prose-drop-cap">
            <p>
              A licensure reviewer at a state board can spend forty minutes on a
              single transcript before the easy parts are done. Cross-referencing the
              accredited programs catalog. Tabulating credit hours. Reading down the
              course list to make sure the required areas are present. Looking for
              dates that don't quite work. Most transcripts are fine. The forty minutes
              gets spent anyway.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <PullQuote attribution="A reviewer, paraphrased">
            By the third one of the afternoon you have to fight to keep paying attention.
          </PullQuote>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="prose-editorial">
            <p>
              The tool is built around the reviewer's attention budget. Mechanical
              checks come pre-done; the screen tells the reviewer where to look,
              what fired, and why. The reviewer's job becomes the part of the job that
              needs a person — judgment.
            </p>
          </div>
        </FadeUp>
      </Section>

      {/* THREE-STEP CENTERPIECE -------------------------------------------- */}
      <Section bg="cream-dark" padding="xl">
        <FadeUp className="mb-12">
          <SectionLabel>The pipeline</SectionLabel>
          <DisplayHeading as="h2" size="lg" className="mt-4">
            From upload to decision.
          </DisplayHeading>
        </FadeUp>

        <div className="border-t border-charcoal-faint">
          {STEPS.map((step, i) => (
            <div key={step.n}>
              {i > 0 && (
                <FadeUp className="flex justify-center -mt-6 -mb-6 relative z-10">
                  <HandwrittenArrow direction="down" tone="terracotta" className="h-12" />
                </FadeUp>
              )}
              <FadeUp delay={i * 0.12}>
                <div className="grid grid-cols-1 md:grid-cols-[140px_220px_1fr] gap-6 md:gap-12 py-12 border-b border-charcoal-faint items-baseline">
                  <span
                    className="font-display text-display-xl text-terracotta"
                    style={{ fontVariationSettings: '"opsz" 144, "wght" 300' }}
                  >
                    {step.n}
                  </span>
                  <span className="font-sans text-label uppercase tracking-wider text-charcoal">
                    {step.label}
                  </span>
                  <p className="font-sans text-body-md text-charcoal-muted max-w-[55ch] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>
      </Section>

      {/* TRANSPARENCY BLOCK ------------------------------------------------ */}
      <Section bg="cream" padding="xl">
        <FadeUp className="max-w-[80ch] mx-auto">
          <div className="border border-charcoal-faint p-10 md:p-16">
            <SectionLabel className="mb-6">Transparency</SectionLabel>
            <p
              className="font-display italic text-display-md text-charcoal leading-tight"
              style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
            >
              Every decision is logged. No flag is a black box. No licensure is
              automated. The system's job is to make a person's afternoon faster, not
              to replace their judgment.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <Link to="/contact">
                <CTAButton>Talk to the team</CTAButton>
              </Link>
              <Link
                to="/impact"
                className="font-sans text-label uppercase tracking-wider text-charcoal hover:text-terracotta nav-underline transition-colors"
              >
                See the rules
              </Link>
            </div>
          </div>
        </FadeUp>
      </Section>
    </>
  );
}
