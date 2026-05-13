/* Animated count-up. Used in HomePage Numbers section and DashboardPage KPIs.
 * Honors prefers-reduced-motion by rendering the final number directly.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "../motion/tokens";

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  formatter?: (v: number) => string;
  className?: string;
  style?: CSSProperties;
  durationMs?: number;       // visual duration; the spring sets its own pace anyway
}

export default function StatCounter({
  value,
  suffix = "",
  prefix = "",
  formatter,
  className = "",
  style,
  durationMs = 1400,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = usePrefersReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18, mass: 0.8 });
  const [display, setDisplay] = useState<string>(formatter ? formatter(0) : "0");

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      setDisplay(formatter ? formatter(value) : Math.round(value).toString());
      return;
    }
    if (inView) mv.set(value);
  }, [inView, value, mv, reduced, formatter]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(formatter ? formatter(v) : Math.round(v).toString());
    });
    return unsub;
  }, [spring, formatter]);

  // Surface the same duration hint to consumers if they care.
  void durationMs;

  return (
    <span
      ref={ref}
      className={className}
      style={style}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}
      <span aria-hidden="true">{display}</span>
      {suffix}
    </span>
  );
}
