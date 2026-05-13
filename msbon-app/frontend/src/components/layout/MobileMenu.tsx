import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface NavItem {
  to: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  ctaTo?: string;
  ctaLabel?: string;
}

export default function MobileMenu({
  open,
  onClose,
  items,
  ctaTo,
  ctaLabel,
}: MobileMenuProps) {
  const { pathname } = useLocation();

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-cream"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="container-editorial flex items-center justify-between py-6 border-b border-charcoal-faint">
            <Link
              to="/"
              onClick={onClose}
              className="font-display text-body-md text-charcoal"
              style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
            >
              MSBON Verification
            </Link>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Close
            </button>
          </div>

          <nav className="container-editorial py-16 flex flex-col gap-10">
            {items.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={item.to}
                  onClick={onClose}
                  data-active={pathname === item.to}
                  className="block font-display text-display-lg text-charcoal data-[active=true]:text-terracotta hover:text-terracotta transition-colors"
                  style={{ fontVariationSettings: '"opsz" 96, "wght" 400' }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            {ctaTo && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + items.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                <Link
                  to={ctaTo}
                  onClick={onClose}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-terracotta text-cream font-sans text-label uppercase tracking-wider font-medium min-h-[44px]"
                >
                  → {ctaLabel}
                </Link>
              </motion.div>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
