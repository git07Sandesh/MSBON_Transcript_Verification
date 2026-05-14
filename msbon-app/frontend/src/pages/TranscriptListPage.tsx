import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listTranscripts } from "../services/transcriptClient";
import Section from "../components/layout/Section";
import SectionLabel from "../components/ui/SectionLabel";
import DisplayHeading from "../components/ui/DisplayHeading";
import SeverityBadge from "../components/ui/SeverityBadge";
import CTAButton from "../components/ui/CTAButton";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "",         label: "All" },
  { value: "FLAGGED",  label: "Flagged" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CLEAR",    label: "Cleared" },
  { value: "FAILED",   label: "Failed" },
];

export default function TranscriptListPage() {
  const [page, setPage]       = useState(0);
  const [filter, setFilter]   = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const limit = 20;
  const navigate = useNavigate();

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];   // keep the most recent two
      return [...prev, id];
    });
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["transcripts", page, filter],
    queryFn: () => listTranscripts(page * limit, limit, filter || undefined),
    refetchInterval: 5000,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Section bg="cream" padding="lg" container="wide">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <SectionLabel>Queue</SectionLabel>
          <DisplayHeading as="h1" size="lg">
            Transcripts.
          </DisplayHeading>
          <p className="font-sans text-body-md text-charcoal-muted">
            {total} record{total === 1 ? "" : "s"} on file.
          </p>
        </div>
        <Link to="/app/upload">
          <CTAButton>Upload new</CTAButton>
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {STATUS_FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => { setFilter(f.value); setPage(0); }}
              className={`px-4 py-2 border font-sans text-label uppercase tracking-wider transition-colors duration-200 min-h-[44px]
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta
                ${active
                  ? "bg-terracotta text-cream border-terracotta"
                  : "bg-cream text-charcoal border-charcoal-faint hover:border-terracotta hover:text-terracotta"
                }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      ) : error ? (
        <p className="text-center py-20 font-sans text-body-md text-terracotta">
          Failed to load transcripts.
        </p>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-charcoal-faint bg-cream-dark py-20 text-center"
        >
          <p className="font-display italic text-display-md text-charcoal" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
            No transcripts yet.
          </p>
          <Link
            to="/app/upload"
            className="mt-6 inline-block font-sans text-label uppercase tracking-wider text-terracotta nav-underline hover:text-terracotta-dark transition-colors"
          >
            Upload the first one
          </Link>
        </motion.div>
      ) : (
        <div className="border-t border-b border-charcoal-faint">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-faint">
                <th className="py-4 pr-2 w-10" />
                <th className="text-left py-4 pr-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium">
                  Filename
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium">
                  Status
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium hidden md:table-cell">
                  Uploaded
                </th>
                <th className="text-left py-4 px-4 font-sans text-label uppercase tracking-wider text-charcoal-muted font-medium hidden lg:table-cell">
                  By
                </th>
                <th className="py-4" />
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => {
                const isSelected = selected.includes(t.id);
                return (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`group border-b border-charcoal-faint last:border-b-0 hover:bg-terracotta-light transition-colors duration-200 ${isSelected ? "bg-terracotta-light" : ""}`}
                >
                  <td className="py-5 pl-2 pr-2 w-10">
                    <label
                      className="inline-flex items-center justify-center cursor-pointer min-h-[24px] min-w-[24px]"
                      aria-label={`Select transcript ${t.filename} for comparison`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(t.id)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 border-2 border-charcoal-faint group-hover:border-terracotta peer-checked:bg-terracotta peer-checked:border-terracotta peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta transition-colors flex items-center justify-center"
                      >
                        {isSelected && (
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-cream" fill="none">
                            <path d="M2 6.5L5 9l5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </label>
                  </td>
                  <td className="py-5 pr-4">
                    <Link
                      to={`/app/transcripts/${t.id}`}
                      className="font-display text-body-md text-charcoal group-hover:text-terracotta transition-colors"
                      style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
                    >
                      {t.filename}
                    </Link>
                  </td>
                  <td className="py-5 px-4">
                    <SeverityBadge label={t.status} />
                  </td>
                  <td className="py-5 px-4 hidden md:table-cell font-sans text-body-sm text-charcoal-muted whitespace-nowrap">
                    {new Date(t.uploaded_at).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="py-5 px-4 hidden lg:table-cell font-sans text-body-sm text-charcoal-muted">
                    {t.uploaded_by}
                  </td>
                  <td className="py-5 pl-4 text-right">
                    <Link
                      to={`/app/transcripts/${t.id}`}
                      className="font-sans text-label uppercase tracking-wider text-charcoal-muted group-hover:text-terracotta transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Compare action bar, slides in when two are selected */}
      <AnimatePresence>
        {selected.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-3 bg-charcoal text-cream shadow-[0_12px_32px_-8px_rgba(30,30,30,0.4)]"
          >
            <span className="font-sans text-label uppercase tracking-wider">
              {selected.length} of 2 selected
            </span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="font-sans text-label uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={selected.length < 2}
              onClick={() => navigate(`/app/compare?a=${selected[0]}&b=${selected[1]}`)}
              className="ml-2 px-5 py-2 bg-terracotta text-cream font-sans text-label uppercase tracking-wider hover:bg-terracotta-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[36px]"
            >
              Compare selected →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {total > limit && (
        <div className="flex items-center justify-between mt-10 font-sans text-body-sm text-charcoal-muted">
          <span>
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-5 py-3 border border-charcoal-faint text-charcoal font-sans text-label uppercase tracking-wider hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-charcoal-faint disabled:hover:text-charcoal disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="px-5 py-3 border border-charcoal-faint text-charcoal font-sans text-label uppercase tracking-wider hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-charcoal-faint disabled:hover:text-charcoal disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
