import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { getTranscript } from "../services/transcriptClient";
import { downloadVerificationReport } from "../services/reportsClient";
import TranscriptSummary from "../components/verification/TranscriptSummary";
import FlagList from "../components/verification/FlagList";
import SourceHighlightedViewer from "../components/pdf/SourceHighlightedViewer";
import { useUIStore } from "../store/uiStore";
import Section from "../components/layout/Section";

type View = "data" | "source";

export default function VerificationPage() {
  const { id } = useParams<{ id: string }>();
  const staffId = useUIStore((s) => s.staffId);
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("data");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [flashFlagId, setFlashFlagId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["transcript", id],
    queryFn: () => getTranscript(id!),
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && ["FLAGGED", "CLEAR", "REVIEWED", "FAILED"].includes(d.status) ? false : 3000;
    },
  });

  useHotkeys("v", () => data && setView((v) => (v === "data" ? "source" : "data")), { enabled: !!data });
  useHotkeys("e", () => data && handleExport(), { enabled: !!data });

  async function handleExport() {
    if (!id) return;
    setExportError(null);
    setExporting(true);
    try {
      await downloadVerificationReport(id);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Export failed.";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) {
    return (
      <Section bg="cream" padding="xl">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-charcoal-faint border-t-terracotta rounded-full"
          />
        </div>
      </Section>
    );
  }

  if (error || !data) {
    return (
      <Section bg="cream" padding="xl">
        <p className="font-display italic text-display-md text-terracotta" style={{ fontVariationSettings: '"opsz" 36, "wght" 300' }}>
          Transcript not found.
        </p>
        <Link
          to="/app/transcripts"
          className="mt-6 inline-block font-sans text-label uppercase tracking-wider text-terracotta nav-underline"
        >
          ← Back to queue
        </Link>
      </Section>
    );
  }

  const isProcessing = ["UPLOADED", "EXTRACTING", "EXTRACTED", "VERIFYING"].includes(data.status);
  const isPdf = data.filename.toLowerCase().endsWith(".pdf");

  return (
    <Section bg="cream" padding="lg" container="wide">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <Link
          to="/app/transcripts"
          className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta nav-underline transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <span aria-hidden="true">←</span> All transcripts
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/app/audit/${id}`}
            className="font-sans text-label uppercase tracking-wider text-charcoal-muted hover:text-terracotta nav-underline transition-colors min-h-[44px] flex items-center"
          >
            Audit trail →
          </Link>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="ml-3 px-5 py-3 border border-terracotta text-terracotta hover:bg-terracotta-light font-sans text-label uppercase tracking-wider transition-colors min-h-[44px] disabled:opacity-50"
          >
            {exporting ? "Preparing…" : "Export report"}
          </button>
        </div>
      </div>

      {exportError && (
        <p role="alert" className="mb-6 font-sans text-body-sm text-terracotta-dark">
          {exportError}
        </p>
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4 px-6 py-5 bg-cream-dark border-l-4 border-charcoal"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-[1.5px] border-charcoal-faint border-t-charcoal rounded-full flex-shrink-0"
          />
          <div>
            <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-0.5">
              Processing
            </p>
            <p className="font-sans text-body-md text-charcoal">
              Extracting, then running twelve rules. This page updates itself.
            </p>
          </div>
        </motion.div>
      )}

      {/* View toggle */}
      {isPdf && (
        <div className="inline-flex border border-charcoal-faint mb-8" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={view === "data"}
            onClick={() => setView("data")}
            className={`px-5 py-3 font-sans text-label uppercase tracking-wider min-h-[44px] transition-colors ${
              view === "data"
                ? "bg-terracotta text-cream"
                : "bg-cream text-charcoal hover:text-terracotta"
            }`}
          >
            Extracted data
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "source"}
            onClick={() => setView("source")}
            className={`px-5 py-3 font-sans text-label uppercase tracking-wider min-h-[44px] transition-colors border-l border-charcoal-faint ${
              view === "source"
                ? "bg-terracotta text-cream"
                : "bg-cream text-charcoal hover:text-terracotta"
            }`}
          >
            Original document
          </button>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {view === "data" || !isPdf ? (
          <TranscriptSummary transcript={data} />
        ) : (
          <SourceHighlightedViewer
            transcriptId={data.id}
            flags={data.flags}
            onHighlightClick={(flagId) => {
              setFlashFlagId(flagId);
              const el = document.getElementById(`flag-${flagId}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              setTimeout(() => setFlashFlagId(null), 1600);
            }}
          />
        )}
        <FlagList
          flags={data.flags}
          transcriptId={data.id}
          staffId={staffId}
          onReviewSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ["transcript", id] });
          }}
          flashFlagId={flashFlagId}
        />
      </div>
    </Section>
  );
}
