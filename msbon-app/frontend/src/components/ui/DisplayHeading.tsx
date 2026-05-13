import type { ReactNode } from "react";

type Size = "2xl" | "xl" | "lg" | "md";

interface DisplayHeadingProps {
  children: ReactNode;
  size?: Size;
  as?: "h1" | "h2" | "h3" | "h4";
  italic?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  "2xl": "text-display-2xl",
  "xl":  "text-display-xl",
  "lg":  "text-display-lg",
  "md":  "text-display-md",
};

// Fraunces optical-size axis: hero sizes use opsz 144, others use opsz 9.
// Weight: 300 (light) for the two largest sizes — the brief's "light paradox"
// (huge but delicate). 400 for the smaller display sizes.
const SIZE_VARIATIONS: Record<Size, string> = {
  "2xl": '"opsz" 144, "wght" 300',
  "xl":  '"opsz" 144, "wght" 300',
  "lg":  '"opsz" 96, "wght" 400',
  "md":  '"opsz" 36, "wght" 400',
};

export default function DisplayHeading({
  children,
  size = "lg",
  as: Tag = "h2",
  italic = false,
  className = "",
}: DisplayHeadingProps) {
  return (
    <Tag
      className={`font-display text-charcoal ${SIZE_CLASS[size]} ${italic ? "italic" : ""} ${className}`}
      style={{ fontVariationSettings: SIZE_VARIATIONS[size] }}
    >
      {children}
    </Tag>
  );
}
