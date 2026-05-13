import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}

export default function SectionLabel({
  children,
  className = "",
  as: Tag = "p",
}: SectionLabelProps) {
  return (
    <Tag
      className={`font-sans text-label uppercase tracking-wider text-charcoal-muted ${className}`}
    >
      {children}
    </Tag>
  );
}
