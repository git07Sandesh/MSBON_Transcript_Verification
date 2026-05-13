/* Global command palette. Bound to Cmd-K / Ctrl-K / "/".
 * Indexes:
 *   - static nav routes (Dashboard, Upload, Transcripts, Audit, Programs, Glossary)
 *   - transcripts pulled from the React-Query cache
 *   - twelve rule IDs from the glossary
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { listTranscripts } from "../../services/transcriptClient";
import SeverityBadge from "../ui/SeverityBadge";

const NAV_ITEMS: { to: string; label: string; group: string }[] = [
  { to: "/app/dashboard",   label: "Dashboard",       group: "Navigate" },
  { to: "/app/transcripts", label: "Transcripts",     group: "Navigate" },
  { to: "/app/upload",      label: "Upload",          group: "Navigate" },
  { to: "/app/audit",       label: "Audit log",       group: "Navigate" },
  { to: "/app/programs",    label: "Programs",        group: "Navigate" },
  { to: "/app/compare",     label: "Compare two transcripts", group: "Navigate" },
  { to: "/glossary",        label: "Glossary",        group: "Navigate" },
  { to: "/",                label: "Public site (home)", group: "Navigate" },
];

const RULES: { id: string; name: string }[] = [
  { id: "GRAD-001", name: "Missing graduation confirmation" },
  { id: "GRAD-002", name: "Graduation date absent" },
  { id: "ACCR-001", name: "Institution not in MS accredited list" },
  { id: "ACCR-002", name: "Accreditation body not recognized" },
  { id: "COUR-001", name: "Required nursing courses missing" },
  { id: "COUR-002", name: "Insufficient credit hours" },
  { id: "FRAU-001", name: "Program completed too quickly" },
  { id: "FRAU-002", name: "Suspicious grade distribution" },
  { id: "FRAU-003", name: "Institution on fraud watch list" },
  { id: "FORM-001", name: "Required transcript fields missing" },
  { id: "FORM-002", name: "Inconsistent date formatting" },
  { id: "FORM-003", name: "Inconsistent grade formatting" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Fetch a pageful of transcripts so the palette has something to match on.
  // React Query caches it; the palette doesn't re-fire on every keystroke.
  const { data } = useQuery({
    queryKey: ["transcripts", "cmdk"],
    queryFn: () => listTranscripts(0, 50),
    enabled: open,        // only fetch when the palette is actually opened
    staleTime: 30_000,
  });
  const transcripts = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function go(to: string) {
    onOpenChange(false);
    navigate(to);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-charcoal/30 flex items-start justify-center pt-[12vh] px-4"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl bg-cream border border-charcoal-faint shadow-[0_24px_64px_-16px_rgba(30,30,30,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Command palette" loop>
              <div className="border-b border-charcoal-faint">
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search transcripts, jump to a page, or look up a rule…"
                  className="w-full bg-transparent px-6 py-4 font-display text-body-lg text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none"
                  style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
                  autoFocus
                />
              </div>

              <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-12 text-center font-display italic text-body-md text-charcoal-muted" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                  Nothing matches "{query}".
                </Command.Empty>

                <Command.Group
                  heading="Navigate"
                  className="cmdk-group"
                >
                  {NAV_ITEMS.map((item) => (
                    <Command.Item
                      key={item.to}
                      value={`navigate ${item.label} ${item.to}`}
                      onSelect={() => go(item.to)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer aria-selected:bg-terracotta-light aria-selected:text-terracotta transition-colors"
                    >
                      <span aria-hidden="true" className="font-sans text-label uppercase tracking-wider text-charcoal-muted w-8">
                        ↗
                      </span>
                      <span className="font-display text-body-md text-charcoal" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                        {item.label}
                      </span>
                      <span className="ml-auto font-sans text-body-sm text-charcoal-muted">
                        {item.to}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>

                {transcripts.length > 0 && (
                  <Command.Group heading="Transcripts">
                    {transcripts.map((t) => (
                      <Command.Item
                        key={t.id}
                        value={`transcript ${t.filename} ${t.id} ${t.uploaded_by}`}
                        onSelect={() => go(`/app/transcripts/${t.id}`)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer aria-selected:bg-terracotta-light aria-selected:text-terracotta transition-colors"
                      >
                        <span aria-hidden="true" className="font-sans text-label uppercase tracking-wider text-charcoal-muted w-8">
                          ◉
                        </span>
                        <span className="font-display text-body-md text-charcoal truncate" style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}>
                          {t.filename}
                        </span>
                        <span className="ml-auto flex items-center gap-3">
                          <span className="font-sans text-body-sm text-charcoal-muted">
                            {t.id.slice(0, 8)}
                          </span>
                          <SeverityBadge label={t.status} />
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Rules">
                  {RULES.map((r) => (
                    <Command.Item
                      key={r.id}
                      value={`rule ${r.id} ${r.name}`}
                      onSelect={() => go("/glossary#" + r.id.toLowerCase())}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer aria-selected:bg-terracotta-light aria-selected:text-terracotta transition-colors"
                    >
                      <span aria-hidden="true" className="font-display text-body-md text-terracotta w-12 tabular-nums" style={{ fontVariationSettings: '"opsz" 9, "wght" 700' }}>
                        {r.id}
                      </span>
                      <span className="font-sans text-body-md text-charcoal">
                        {r.name}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="border-t border-charcoal-faint px-4 py-3 flex items-center justify-between font-sans text-body-sm text-charcoal-muted">
                <span>
                  <kbd className="px-1.5 py-0.5 border border-charcoal-faint mr-1">↑</kbd>
                  <kbd className="px-1.5 py-0.5 border border-charcoal-faint mr-1">↓</kbd>
                  navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 border border-charcoal-faint mr-1">↵</kbd>
                  select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 border border-charcoal-faint mr-1">Esc</kbd>
                  close
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
