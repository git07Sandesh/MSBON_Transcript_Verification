/* Hand-drawn-feeling arrow used as a vertical step connector between the
 * three blocks on HowItWorksPage. Slightly imperfect, deliberately not
 * geometric, to evoke a reviewer's pen mark on a page.
 */
interface Props {
  className?: string;
  direction?: "down" | "right";
  tone?: "terracotta" | "charcoal-muted";
}

export default function HandwrittenArrow({
  className = "",
  direction = "down",
  tone = "terracotta",
}: Props) {
  const color = tone === "terracotta" ? "text-terracotta" : "text-charcoal-muted";

  if (direction === "right") {
    return (
      <svg
        viewBox="0 0 80 24"
        width="80"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${color} ${className}`}
      >
        <path d="M2 12 C20 9, 40 14, 70 11" />
        <path d="M62 5 C66 8, 70 10, 74 11 C70 13, 66 16, 64 19" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 80"
      width="24"
      height="80"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${color} ${className}`}
    >
      <path d="M12 2 C9 20, 14 40, 11 70" />
      <path d="M5 62 C8 66, 10 70, 11 74 C13 70, 16 66, 19 64" />
    </svg>
  );
}
