/* Single-source rule-category icon set. Five hand-tuned SVG glyphs, one
 * stroke weight, parameterized colour. Used in FlagItem, /impact rule cards,
 * audit timeline left margin, and the glossary entries.
 */
import type { ReactElement, SVGProps } from "react";

type Category = "GRADUATION" | "ACCREDITATION" | "COURSE" | "FRAUD" | "FORMAT";

interface Props extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  category: string;       // string, not Category — tolerates anything from the API
  size?: number;
  tone?: "terracotta" | "charcoal" | "muted";
  decorative?: boolean;   // aria-hidden when true; otherwise gets title + role="img"
}

const TONE_CLASS: Record<NonNullable<Props["tone"]>, string> = {
  terracotta: "text-terracotta",
  charcoal:   "text-charcoal",
  muted:      "text-charcoal-muted",
};

const TITLE: Record<Category, string> = {
  GRADUATION:    "Graduation rule",
  ACCREDITATION: "Accreditation rule",
  COURSE:        "Coursework rule",
  FRAUD:         "Fraud-signal rule",
  FORMAT:        "Formatting rule",
};

function GraduationGlyph() {
  // Tasseled mortarboard
  return (
    <>
      <path d="M12 5 L22 9 L12 13 L2 9 Z" />
      <path d="M5 10.5 V15 C5 16 8 17 12 17 C16 17 19 16 19 15 V10.5" />
      <path d="M22 9 V13.5" />
      <circle cx="22" cy="14" r="0.7" />
    </>
  );
}

function AccreditationGlyph() {
  // State-seal stamp — concentric circles + radiating ticks
  return (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 8.5;
        const y1 = 12 + Math.sin(rad) * 8.5;
        const x2 = 12 + Math.cos(rad) * 10;
        const y2 = 12 + Math.sin(rad) * 10;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      <path d="M9 12 L11.5 14.5 L15.5 10" />
    </>
  );
}

function CourseGlyph() {
  // Open book — two pages with center spine
  return (
    <>
      <path d="M3 6 C6 5 9 5 12 7 C15 5 18 5 21 6 V18 C18 17 15 17 12 19 C9 17 6 17 3 18 Z" />
      <line x1="12" y1="7" x2="12" y2="19" />
      <line x1="6" y1="9" x2="10" y2="9.3" />
      <line x1="6" y1="11.5" x2="10" y2="11.8" />
      <line x1="6" y1="14" x2="10" y2="14.3" />
      <line x1="14" y1="9.3" x2="18" y2="9" />
      <line x1="14" y1="11.8" x2="18" y2="11.5" />
      <line x1="14" y1="14.3" x2="18" y2="14" />
    </>
  );
}

function FraudGlyph() {
  // Slashed circle with two small marks inside — "tampered"
  return (
    <>
      <circle cx="12" cy="12" r="8" />
      <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
      <circle cx="9.5" cy="10" r="0.8" />
      <circle cx="14.5" cy="14" r="0.8" />
    </>
  );
}

function FormatGlyph() {
  // Pen nib + underline
  return (
    <>
      <path d="M5 14 L9 4 L13 4 L17 14 Z" />
      <path d="M9 4 L13 4 L11 14 L9 14 Z" />
      <line x1="11" y1="14" x2="11" y2="17" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </>
  );
}

const GLYPHS: Record<Category, () => ReactElement> = {
  GRADUATION:    GraduationGlyph,
  ACCREDITATION: AccreditationGlyph,
  COURSE:        CourseGlyph,
  FRAUD:         FraudGlyph,
  FORMAT:        FormatGlyph,
};

export default function RuleCategoryIcon({
  category,
  size = 24,
  tone = "terracotta",
  decorative = false,
  className = "",
  ...rest
}: Props) {
  const key = (category || "").toUpperCase() as Category;
  const Glyph = GLYPHS[key];
  if (!Glyph) return null;
  const title = TITLE[key];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      className={`${TONE_CLASS[tone]} ${className}`}
      {...rest}
    >
      {!decorative && <title>{title}</title>}
      <Glyph />
    </svg>
  );
}
