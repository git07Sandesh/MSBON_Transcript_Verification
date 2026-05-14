/* Editorial illustration of a nursing transcript. Pure SVG, single-file,
 * single-color (navy on bone), no external assets. Built to look like a
 * scanned institutional transcript without being a real student's PII.
 *
 * The course list mirrors the curriculum keywords the rule engine looks
 * for (see backend/app/domain/rules/course_completion_rule.py) so the
 * marketing image and the demo stay in narrative alignment.
 */
import type { SVGProps } from "react";

interface Props extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  className?: string;
}

export default function TranscriptIllustration({ className = "", ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Sample nursing transcript with redacted student name, course list, and registrar seal."
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>Nursing transcript under review</title>

      {/* Paper background */}
      <defs>
        {/* Subtle paper-grain noise. ~5% opacity, almost invisible but adds tactility. */}
        <filter id="paper-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.118
                    0 0 0 0 0.227
                    0 0 0 0 0.322
                    0 0 0 0.05 0"
          />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>

        {/* Registrar stamp */}
        <symbol id="seal" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {[...Array(16)].map((_, i) => {
            const a = (i * Math.PI * 2) / 16;
            const x1 = 30 + Math.cos(a) * 28;
            const y1 = 30 + Math.sin(a) * 28;
            const x2 = 30 + Math.cos(a) * 30.5;
            const y2 = 30 + Math.sin(a) * 30.5;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.4" />;
          })}
          {/* Center mark */}
          <text x="30" y="26" textAnchor="middle" fontSize="6.5" fontFamily="serif" fontWeight="700" fill="currentColor">
            USM
          </text>
          <text x="30" y="34" textAnchor="middle" fontSize="3.8" fontFamily="serif" letterSpacing="0.5" fill="currentColor">
            REGISTRAR
          </text>
          <text x="30" y="40" textAnchor="middle" fontSize="3.2" fontFamily="serif" fill="currentColor">
            ★ 1910 ★
          </text>
        </symbol>
      </defs>

      {/* Cream-bone paper */}
      <rect width="400" height="500" fill="#F5F0E6" />
      {/* Faint paper grain overlay */}
      <rect width="400" height="500" filter="url(#paper-noise)" opacity="0.4" />

      {/* Top + bottom hairline frames */}
      <rect x="14" y="14" width="372" height="472" fill="none" stroke="#1A3A52" strokeOpacity="0.18" strokeWidth="0.5" />

      {/* ── Institutional header ──────────────────────────────────────── */}
      <g fill="#1A3A52">
        <text x="200" y="44" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" letterSpacing="1.5">
          UNIVERSITY OF SOUTHERN MISSISSIPPI
        </text>
        <text x="200" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" opacity="0.85">
          College of Nursing and Health Professions
        </text>
        <line x1="60" y1="68" x2="340" y2="68" stroke="#1A3A52" strokeWidth="0.6" />
        <text x="200" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" letterSpacing="3">
          OFFICIAL ACADEMIC TRANSCRIPT
        </text>
      </g>

      {/* ── Student info block ────────────────────────────────────────── */}
      <g fontFamily="ui-monospace, 'SF Mono', Menlo, monospace" fontSize="6.5" fill="#1E1E1E">
        <text x="32" y="106" fill="#6B6560">STUDENT NAME</text>
        <text x="32" y="116" fontSize="9" fontFamily="Georgia, serif" fill="#1E1E1E">
          ████████  ████████████
        </text>

        <text x="220" y="106" fill="#6B6560">STUDENT ID</text>
        <text x="220" y="116" fontSize="9" fontFamily="ui-monospace, monospace">w███████9</text>

        <text x="32" y="134" fill="#6B6560">PROGRAM</text>
        <text x="32" y="144" fontSize="8.5" fontFamily="Georgia, serif">Bachelor of Science in Nursing</text>

        <text x="220" y="134" fill="#6B6560">DEGREE CONFERRED</text>
        <text x="220" y="144" fontSize="8.5" fontFamily="Georgia, serif">10 May 2025</text>
      </g>

      {/* ── Course table header ───────────────────────────────────────── */}
      <g fill="#6B6560" fontFamily="ui-monospace, 'SF Mono', Menlo, monospace" fontSize="6">
        <line x1="32" y1="166" x2="368" y2="166" stroke="#1A3A52" strokeWidth="0.5" />
        <text x="32"  y="178">TERM</text>
        <text x="92"  y="178">COURSE</text>
        <text x="148" y="178">TITLE</text>
        <text x="316" y="178" textAnchor="middle">CR</text>
        <text x="354" y="178" textAnchor="middle">GR</text>
        <line x1="32" y1="184" x2="368" y2="184" stroke="#1A3A52" strokeOpacity="0.3" strokeWidth="0.4" />
      </g>

      {/* ── Course rows ───────────────────────────────────────────────── */}
      <g fontFamily="Georgia, serif" fontSize="7" fill="#1E1E1E">
        {[
          ["FA 2021", "NSG 200", "Foundations of Nursing",          "16.0", "A"],
          ["SP 2022", "NSG 301", "Health Assessment",                "12.0", "A"],
          ["SP 2023", "NSG 302", "Pharmacology",                     "12.0", "B+"],
          ["FA 2023", "NSG 401", "Adult Health / Med-Surg I",        "16.0", "A−"],
          ["SP 2024", "NSG 402", "Maternal Newborn / OB Nursing",    "16.0", "B"],
          ["FA 2024", "NSG 405", "Pediatric Nursing",                "16.0", "A"],
          ["FA 2024", "NSG 410", "Mental Health / Psychiatric Nsg",  "16.0", "A"],
          ["SP 2025", "NSG 420", "Community Health Nursing",         " 8.0", "B+"],
          ["SP 2025", "NSG 499", "Nursing Capstone",                 "12.0", "A"],
        ].map(([term, course, title, cr, gr], i) => {
          const y = 200 + i * 16;
          return (
            <g key={i}>
              <text x="32"  y={y} fontFamily="ui-monospace, monospace" fontSize="6" fill="#6B6560">{term}</text>
              <text x="92"  y={y} fontFamily="ui-monospace, monospace" fontSize="6.5" fill="#1A3A52" fontWeight="700">{course}</text>
              <text x="148" y={y}>{title}</text>
              <text x="316" y={y} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6.5">{cr}</text>
              <text x="354" y={y} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6.5" fontWeight="700">{gr}</text>
              {i < 8 && (
                <line x1="32" y1={y + 5} x2="368" y2={y + 5} stroke="#1A3A52" strokeOpacity="0.08" strokeWidth="0.3" />
              )}
            </g>
          );
        })}
      </g>

      {/* ── Summary band ──────────────────────────────────────────────── */}
      <g fill="#1E1E1E">
        <line x1="32" y1="354" x2="368" y2="354" stroke="#1A3A52" strokeWidth="0.5" />
        <text x="32"  y="368" fontFamily="ui-monospace, monospace" fontSize="6" fill="#6B6560">CUMULATIVE</text>
        <text x="32"  y="380" fontFamily="Georgia, serif" fontSize="9" fontWeight="700">GPA  3.78</text>

        <text x="120" y="368" fontFamily="ui-monospace, monospace" fontSize="6" fill="#6B6560">CREDITS EARNED</text>
        <text x="120" y="380" fontFamily="Georgia, serif" fontSize="9" fontWeight="700">124.0</text>

        <text x="220" y="368" fontFamily="ui-monospace, monospace" fontSize="6" fill="#6B6560">CONFERRED</text>
        <text x="220" y="380" fontFamily="Georgia, serif" fontSize="9" fontWeight="700">May 10, 2025</text>
      </g>

      {/* ── Footer: signature line + registrar seal ───────────────────── */}
      <g>
        <line x1="32"  y1="430" x2="180" y2="430" stroke="#1A3A52" strokeWidth="0.5" />
        <text x="32" y="442" fontFamily="ui-monospace, monospace" fontSize="6" fill="#6B6560">REGISTRAR (signed)</text>
        <text x="32" y="454" fontFamily="'Lucida Handwriting', 'Snell Roundhand', cursive" fontStyle="italic" fontSize="11" fill="#1A3A52" opacity="0.85">
          M. Whitfield
        </text>

        {/* Stamp / seal — uses the symbol defined above, tinted navy */}
        <g color="#1A3A52" opacity="0.65" transform="translate(290 410) rotate(-8)">
          <use href="#seal" width="80" height="80" />
        </g>

        {/* Issued-on caption */}
        <text x="200" y="478" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="5.5" fill="#6B6560" letterSpacing="0.6">
          ISSUED 12 MAY 2026  ·  PAGE 1 OF 1  ·  DOCUMENT ID  T-MS-██████
        </text>
      </g>
    </svg>
  );
}
