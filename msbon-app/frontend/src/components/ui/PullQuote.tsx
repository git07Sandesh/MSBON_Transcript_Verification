import type { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: string;
  className?: string;
}

export default function PullQuote({ children, attribution, className = "" }: PullQuoteProps) {
  return (
    <figure
      className={`border-l-4 border-terracotta pl-8 my-12 ${className}`}
    >
      <blockquote
        className="font-display italic text-display-md text-charcoal leading-tight"
        style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 font-sans text-label uppercase tracking-wider text-charcoal-muted">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
