import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* Strip the DOM props that collide with framer-motion's own animation/drag
 * event signatures, motion redefines onAnimationStart/End and onDragStart/End. */
type StrippedButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "children"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDragStart"
  | "onDrag"
  | "onDragEnd"
>;

interface CTAButtonProps extends StrippedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
  loadingLabel?: string;
}

const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(function CTAButton(
  {
    children,
    variant = "primary",
    loading = false,
    loadingLabel = "Sending…",
    className = "",
    disabled,
    type = "button",
    ...rest
  },
  ref
) {
  const base =
    "group relative inline-flex items-center gap-3 px-8 py-4 font-sans text-label uppercase tracking-wider font-medium " +
    "min-h-[44px] transition-colors duration-200 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "bg-terracotta text-cream hover:bg-terracotta-dark"
      : "bg-cream text-terracotta border border-terracotta hover:bg-terracotta-light";

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      disabled={disabled || loading}
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      {/* Arrow slides in from the left on hover. Pushes the label right. */}
      <span
        aria-hidden="true"
        className="overflow-hidden inline-block w-0 group-hover:w-5 transition-[width] duration-200 ease-out"
      >
        <span className="inline-block -translate-x-3 group-hover:translate-x-0 transition-transform duration-200 ease-out">
          →
        </span>
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={loading ? "loading" : "label"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {loading ? loadingLabel : children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
});

export default CTAButton;
