import { useEffect, useState } from "react";

export const motionTokens = {
  fade:    { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  slideUp: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  stagger: 0.12,
  hover:   { duration: 0.2, ease: "easeOut" as const },
};

export function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const [reduced, setReduced] = useState(get);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
