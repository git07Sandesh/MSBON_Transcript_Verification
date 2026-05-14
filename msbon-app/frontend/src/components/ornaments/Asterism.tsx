/* Three-star editorial break ⁂, used between major prose sections.
 * Renders as semantic <hr> with aria-label for screen readers.
 */
interface Props {
  className?: string;
  tone?: "terracotta" | "charcoal-muted";
}

export default function Asterism({ className = "", tone = "charcoal-muted" }: Props) {
  const color = tone === "terracotta" ? "text-terracotta" : "text-charcoal-muted";
  return (
    <div
      role="separator"
      aria-label="Section break"
      className={`flex items-center justify-center my-12 md:my-16 ${color} ${className}`}
    >
      <span
        className="font-display select-none"
        style={{
          fontVariationSettings: '"opsz" 36, "wght" 400',
          fontSize: "1.5rem",
          letterSpacing: "0.5em",
        }}
        aria-hidden="true"
      >
        ✶ ✶ ✶
      </span>
    </div>
  );
}
