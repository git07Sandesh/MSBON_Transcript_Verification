/* Single decorative flourish — used as an inline glyph for category/section
 * tags, end-of-article marker, etc.
 */
interface Props {
  className?: string;
  size?: number;
}

export default function Fleuron({ className = "", size = 14 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* A simple, hand-drawn-feeling flourish */}
      <path d="M12 4 C8 8, 8 16, 12 20 C16 16, 16 8, 12 4 Z" />
      <path d="M4 12 C8 8, 16 8, 20 12 C16 16, 8 16, 4 12 Z" />
      <circle cx="12" cy="12" r="1.4" />
    </svg>
  );
}
