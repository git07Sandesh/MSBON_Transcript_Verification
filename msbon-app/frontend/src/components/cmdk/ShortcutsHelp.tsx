/* ? overlay listing every keyboard shortcut. */
import { AnimatePresence, motion } from "framer-motion";

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: { heading: string; items: { keys: string[]; label: string }[] }[] = [
  {
    heading: "Global",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["/"],      label: "Open command palette" },
      { keys: ["?"],      label: "Toggle this help" },
      { keys: ["Esc"],    label: "Close any open overlay" },
    ],
  },
  {
    heading: "Navigate",
    items: [
      { keys: ["G", "D"], label: "Go to dashboard" },
      { keys: ["G", "T"], label: "Go to transcripts" },
      { keys: ["G", "U"], label: "Go to upload" },
      { keys: ["G", "A"], label: "Go to audit" },
      { keys: ["G", "P"], label: "Go to programs" },
    ],
  },
  {
    heading: "Transcript list",
    items: [
      { keys: ["J"], label: "Next transcript" },
      { keys: ["K"], label: "Previous transcript" },
      { keys: ["↵"], label: "Open selected" },
    ],
  },
  {
    heading: "Verification",
    items: [
      { keys: ["C"], label: "Confirm flag" },
      { keys: ["O"], label: "Override flag" },
      { keys: ["N"], label: "Mark Needs more info" },
      { keys: ["V"], label: "Toggle source PDF view" },
      { keys: ["E"], label: "Export report PDF" },
    ],
  },
];

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] bg-charcoal/40 flex items-center justify-center px-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-cream border border-charcoal-faint p-8 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between mb-8">
              <div>
                <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted">
                  Help
                </p>
                <h2
                  className="font-display text-display-md text-charcoal mt-2"
                  style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
                >
                  Keyboard shortcuts
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors min-h-[44px]"
              >
                Close ×
              </button>
            </header>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
              {GROUPS.map((g) => (
                <div key={g.heading}>
                  <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-4">
                    {g.heading}
                  </p>
                  <dl className="flex flex-col gap-3">
                    {g.items.map((it) => (
                      <div key={it.label} className="flex items-center justify-between gap-6">
                        <dt className="font-sans text-body-md text-charcoal">{it.label}</dt>
                        <dd className="flex items-center gap-1">
                          {it.keys.map((k) => (
                            <kbd
                              key={k}
                              className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 border border-charcoal-faint bg-cream-dark font-sans text-body-sm text-charcoal tabular-nums"
                            >
                              {k}
                            </kbd>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
