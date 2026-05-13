import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens, usePrefersReducedMotion } from "./tokens";

interface FadeUpProps extends Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition"> {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "footer" | "main" | "li" | "p";
  amount?: number;        // 0..1 visibility threshold
  yOffset?: number;       // px upward slide
}

export default function FadeUp({
  children,
  delay = 0,
  as = "div",
  amount = 0.2,
  yOffset = 24,
  ...rest
}: FadeUpProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduced) {
    return <Tag {...rest}>{children}</Tag>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px", amount }}
      transition={{ ...motionTokens.slideUp, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
