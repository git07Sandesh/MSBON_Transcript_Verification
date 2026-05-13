import type { ReactNode } from "react";

type Bg = "cream" | "cream-dark";
type Padding = "xl" | "lg" | "md" | "none";
type Container = "editorial" | "prose" | "wide" | "full";

interface SectionProps {
  children: ReactNode;
  bg?: Bg;
  padding?: Padding;
  container?: Container;
  className?: string;
  innerClassName?: string;
  as?: "section" | "div" | "article" | "header" | "footer" | "main";
  id?: string;
}

const BG_CLASS: Record<Bg, string> = {
  "cream":      "bg-cream",
  "cream-dark": "bg-cream-dark",
};

const PADDING_CLASS: Record<Padding, string> = {
  xl:   "section-xl",
  lg:   "section-lg",
  md:   "section-md",
  none: "",
};

const CONTAINER_CLASS: Record<Container, string> = {
  editorial: "container-editorial",
  prose:     "container-prose",
  wide:      "container-wide",
  full:      "",
};

export default function Section({
  children,
  bg = "cream",
  padding = "lg",
  container = "editorial",
  className = "",
  innerClassName = "",
  as: Tag = "section",
  id,
}: SectionProps) {
  return (
    <Tag id={id} className={`${BG_CLASS[bg]} ${PADDING_CLASS[padding]} ${className}`}>
      <div className={`${CONTAINER_CLASS[container]} ${innerClassName}`}>
        {children}
      </div>
    </Tag>
  );
}
