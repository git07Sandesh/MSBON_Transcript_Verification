/* Public glossary, what each of the twelve rules does, in plain language.
 * Editorial article style: drop cap on the first paragraph, category icons
 * in margins, anchor-able rule sections (the command palette links to
 * #grad-001 etc. so a reviewer can sense-check what the system means).
 */
import { Link } from "react-router-dom";
import Section from "../../components/layout/Section";
import SectionLabel from "../../components/ui/SectionLabel";
import DisplayHeading from "../../components/ui/DisplayHeading";
import PullQuote from "../../components/ui/PullQuote";
import FadeUp from "../../components/motion/FadeUp";
import RuleCategoryIcon from "../../components/icons/RuleCategoryIcon";
import Asterism from "../../components/ornaments/Asterism";
import Fleuron from "../../components/ornaments/Fleuron";

type Category = "GRADUATION" | "ACCREDITATION" | "COURSE" | "FRAUD" | "FORMAT";

interface Rule {
  id: string;
  name: string;
  category: Category;
  categoryLabel: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  fires_on: string;
  why_it_matters: string;
  override_looks_like: string;
}

const RULES: Rule[] = [
  {
    id: "GRAD-001", name: "Missing graduation confirmation",
    category: "GRADUATION", categoryLabel: "Graduation", severity: "HIGH",
    fires_on: "The transcript text does not contain an explicit statement of degree conferral or graduation.",
    why_it_matters: "Without explicit confirmation, the applicant may be ABD (all-but-degree), eligible to leave a program but never actually credentialed. Manual reviewers miss this when scanning.",
    override_looks_like: "A reviewer who has spoken with the registrar by phone and confirmed conferral in writing.",
  },
  {
    id: "GRAD-002", name: "Graduation date absent",
    category: "GRADUATION", categoryLabel: "Graduation", severity: "MEDIUM",
    fires_on: "The extracted JSON has a null graduation_date.",
    why_it_matters: "A missing date prevents the FRAU-001 duration check from running. It is rarely deliberate, but it always degrades verification.",
    override_looks_like: "A reviewer who has located the date elsewhere, usually a stamped diploma scan attached separately.",
  },
  {
    id: "ACCR-001", name: "Institution not in MS accredited list",
    category: "ACCREDITATION", categoryLabel: "Accreditation", severity: "HIGH",
    fires_on: "The applicant's institution does not match any school in the seeded accredited_programs table.",
    why_it_matters: "Mississippi licensure requires a program accredited by ACEN, CCNE, or recognized by the state board. This is the single rule most commonly overridden when an out-of-state ACEN/CCNE institution is involved.",
    override_looks_like: "A reviewer confirming a real institution that simply isn't seeded yet, and adding it to the catalog before approving.",
  },
  {
    id: "ACCR-002", name: "Accreditation body not recognized",
    category: "ACCREDITATION", categoryLabel: "Accreditation", severity: "MEDIUM",
    fires_on: "The extracted accreditation_body is something other than ACEN or CCNE.",
    why_it_matters: "Other accreditors exist, but a non-{ACEN, CCNE} body is the most common signal of either a typo on the application or a non-nursing-specific accreditation being claimed.",
    override_looks_like: "A note that the institution is accredited by a recognized regional body and the application is being routed through a different review path.",
  },
  {
    id: "COUR-001", name: "Required nursing courses missing",
    category: "COURSE", categoryLabel: "Coursework", severity: "HIGH",
    fires_on: "The course list does not contain at least one course matching each of the six required nursing curriculum areas (fundamentals, med-surg/adult health, pharmacology, mental health, maternal/OB, pediatric).",
    why_it_matters: "These six are the floor for any clinically licensed nurse. A gap is either a transcript that didn't extract cleanly or, more rarely, a program that didn't actually require them.",
    override_looks_like: "A reviewer who has the original transcript open and can point to where the missing course actually lives in the text.",
  },
  {
    id: "COUR-002", name: "Insufficient credit hours",
    category: "COURSE", categoryLabel: "Coursework", severity: "MEDIUM",
    fires_on: "The total nursing credits in the extracted course list are below the program-type minimum (60 for ADN, 120 for BSN, 36 for MSN, etc.).",
    why_it_matters: "A small gap (1–2 credits) is usually an extraction artifact. A large gap (the BSN with 4 total credits we ship as a fixture) is a strong fraud signal.",
    override_looks_like: "A reviewer attaching a separate credit-summary document from the registrar.",
  },
  {
    id: "FRAU-001", name: "Program completed too quickly",
    category: "FRAUD", categoryLabel: "Fraud signal", severity: "HIGH",
    fires_on: "Time between enrollment_date and graduation_date is below a plausible minimum for the program type.",
    why_it_matters: "This is the rule Operation Nightingale would have caught. A BSN granted eight months after enrollment is physically impossible.",
    override_looks_like: "Very rare. Almost always requires the school's letterhead explaining transfer credits or an accelerated pathway program, and even then it triggers a second-reviewer requirement.",
  },
  {
    id: "FRAU-002", name: "Suspicious grade distribution",
    category: "FRAUD", categoryLabel: "Fraud signal", severity: "MEDIUM",
    fires_on: "Eight or more nursing courses with no grade variance, all A, all A+, or otherwise impossibly uniform.",
    why_it_matters: "Real transcripts have variance. Perfectly uniform A's are an indicator that someone hand-typed the transcript rather than the registrar producing it.",
    override_looks_like: "Honors-program documentation or a school whose policy was pass/fail at the time.",
  },
  {
    id: "FRAU-003", name: "Institution on fraud watch list",
    category: "FRAUD", categoryLabel: "Fraud signal", severity: "HIGH",
    fires_on: "The institution name exactly matches a known-fraudulent program from the federal Operation Nightingale list (and any state additions).",
    why_it_matters: "Three institutions in Florida issued thousands of fake diplomas. The list is small but non-negotiable.",
    override_looks_like: "Never. This rule is a hard stop; the file goes to a senior compliance officer.",
  },
  {
    id: "FORM-001", name: "Required transcript fields missing",
    category: "FORMAT", categoryLabel: "Formatting", severity: "LOW",
    fires_on: "Applicant name, institution, or program could not be extracted at all.",
    why_it_matters: "Usually a scan quality problem, not a fraud problem. But it makes every downstream rule unreliable.",
    override_looks_like: "Re-scanning the document at a higher DPI and re-uploading.",
  },
  {
    id: "FORM-002", name: "Inconsistent date formatting",
    category: "FORMAT", categoryLabel: "Formatting", severity: "LOW",
    fires_on: "Multiple date formats (2023-05-10, May 2023, 5/10/23) appear in the same document.",
    why_it_matters: "Real registrars use one format. Mixed formats are mild evidence that pages were assembled from different sources.",
    override_looks_like: "A reviewer noting that the school combined an internal transcript with an external course list and the inconsistency is a known artifact.",
  },
  {
    id: "FORM-003", name: "Inconsistent grade formatting",
    category: "FORMAT", categoryLabel: "Formatting", severity: "LOW",
    fires_on: "Grade notation changes mid-transcript (letter, percentage, pass/fail interleaved without legend).",
    why_it_matters: "Same as FORM-002, a mild structural integrity signal, not a fraud claim.",
    override_looks_like: "Pass/fail courses cleanly documented and the rest letter-graded.",
  },
];

export default function GlossaryPage() {
  return (
    <>
      {/* HERO ----------------------------------------------------------- */}
      <Section bg="cream" padding="xl">
        <FadeUp className="max-w-[60ch]">
          <SectionLabel>Glossary</SectionLabel>
          <DisplayHeading as="h1" size="xl" className="mt-4">
            What every flag means.
          </DisplayHeading>
          <p
            className="font-display italic text-body-lg text-charcoal-muted mt-8"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            Twelve rules, in plain English. Each rule has a fixed identifier, a
            severity, the condition that triggers it, why MSBON cares, and what
            a legitimate override looks like.
          </p>
        </FadeUp>
      </Section>

      {/* INTRO ----------------------------------------------------------- */}
      <Section bg="cream" padding="md" container="prose">
        <FadeUp>
          <div className="prose-editorial prose-drop-cap">
            <p>
              Operation Nightingale taught the licensure community a hard
              lesson: a transcript review is only as good as the reviewer's
              attention, and attention is finite. The twelve rules below are
              the system's attempt to do the mechanical half of a reviewer's
              job, not to replace judgment, but to make sure the boring checks
              happen every time, on every page, without anyone getting tired.
            </p>
            <p>
              Each rule fires on a specific condition. None of them refuses an
              applicant. They are signals, not decisions. The decision still
              belongs to a person; the rule's job is to make sure that person
              knows what to look at.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <PullQuote attribution="House style guide">
            Every flag has a rule ID, a source excerpt, and a plain-language
            explanation. Anything that does not is a bug.
          </PullQuote>
        </FadeUp>
      </Section>

      <Asterism />

      {/* THE RULES ------------------------------------------------------- */}
      <Section bg="cream" padding="md" container="editorial">
        <ul className="flex flex-col divide-y divide-charcoal-faint">
          {RULES.map((rule) => (
            <FadeUp as="li" key={rule.id} className="py-12 first:pt-0 last:pb-0">
              <article id={rule.id.toLowerCase()} className="grid md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex md:flex-col items-start gap-3">
                  <RuleCategoryIcon
                    category={rule.category}
                    size={40}
                    tone="terracotta"
                    decorative
                  />
                  <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                    {rule.categoryLabel}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-4">
                    <span
                      className="font-display text-display-md text-terracotta tabular-nums"
                      style={{ fontVariationSettings: '"opsz" 36, "wght" 700' }}
                    >
                      {rule.id}
                    </span>
                    <span className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                      {rule.severity}
                    </span>
                  </div>
                  <DisplayHeading as="h2" size="md" className="mb-6">
                    {rule.name}
                  </DisplayHeading>

                  <dl className="grid md:grid-cols-3 gap-x-10 gap-y-6">
                    <div>
                      <dt className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-2">
                        Fires on
                      </dt>
                      <dd className="font-sans text-body-md text-charcoal-muted leading-relaxed">
                        {rule.fires_on}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-2">
                        Why it matters
                      </dt>
                      <dd className="font-sans text-body-md text-charcoal-muted leading-relaxed">
                        {rule.why_it_matters}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-2">
                        Override looks like
                      </dt>
                      <dd className="font-sans text-body-md text-charcoal-muted leading-relaxed">
                        {rule.override_looks_like}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            </FadeUp>
          ))}
        </ul>
      </Section>

      {/* CLOSER ---------------------------------------------------------- */}
      <Section bg="cream-dark" padding="lg">
        <FadeUp className="max-w-[44ch] mx-auto text-center flex flex-col items-center gap-5">
          <Fleuron className="text-terracotta" size={32} />
          <p
            className="font-display italic text-display-md text-charcoal"
            style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
          >
            That's the whole list.
          </p>
          <p className="font-sans text-body-md text-charcoal-muted">
            If your board has rules we don't, we'd like to hear about them.
          </p>
          <Link
            to="/contact"
            className="mt-2 font-sans text-label uppercase tracking-wider text-terracotta hover:text-terracotta-dark nav-underline transition-colors"
          >
            Tell us →
          </Link>
        </FadeUp>
      </Section>
    </>
  );
}
