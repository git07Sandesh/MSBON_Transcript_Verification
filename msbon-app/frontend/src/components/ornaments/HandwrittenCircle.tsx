/* Imperfect circle/oval — used to "circle" a number or word inline, the way
 * a reviewer might mark something on a printed page with a pen.
 */
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  tone?: "terracotta" | "charcoal";
}

export default function HandwrittenCircle({
  children,
  className = "",
  tone = "terracotta",
}: Props) {
  const color = tone === "terracotta" ? "text-terracotta" : "text-charcoal";
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute -inset-x-2 -inset-y-1 w-[calc(100%+1rem)] h-[calc(100%+0.5rem)] ${color}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 50 4 C 78 4, 96 14, 96 30 C 96 46, 76 56, 50 56 C 22 56, 6 46, 4 30 C 4 14, 24 6, 50 4 Z" />
      </svg>
    </span>
  );
}
