/* Inline PDF viewer with rule source-excerpt highlights.
 *
 * Backed by react-pdf-highlighter-extended (which renders pdf.js). On load we
 * scan the document's text content for every flag's source_excerpt and
 * compute a `usePdfCoordinates: true` ScaledPosition for each match. The
 * positions render as terracotta TextHighlight rectangles overlaid on the
 * PDF. Clicking a highlight invokes the optional onHighlightClick callback
 * so the parent VerificationPage can flash the corresponding flag card.
 */
import { useEffect, useMemo, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
// pdfjs worker URL — Vite resolves this and serves the asset.
// The ?url suffix is a Vite trick.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  PdfHighlighter,
  PdfLoader,
  TextHighlight,
  useHighlightContainerContext,
} from "react-pdf-highlighter-extended";
import type { Highlight, ScaledPosition } from "react-pdf-highlighter-extended";
import type { Flag } from "../../types";
import { useUIStore } from "../../store/uiStore";
import "react-pdf-highlighter-extended/dist/esm/style/AreaHighlight.css";
import "react-pdf-highlighter-extended/dist/esm/style/TextHighlight.css";
import "react-pdf-highlighter-extended/dist/esm/style/PdfHighlighter.css";
import "react-pdf-highlighter-extended/dist/esm/style/MouseSelection.css";
import "react-pdf-highlighter-extended/dist/esm/style/pdf_viewer.css";

GlobalWorkerOptions.workerSrc = workerUrl;

interface FlagHighlight extends Highlight {
  flagId: string;
  ruleId: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

interface Props {
  transcriptId: string;
  flags: Flag[];
  onHighlightClick?: (flagId: string) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  HIGH:   "rgba(184, 74, 50, 0.32)",   // terracotta @ 32%
  MEDIUM: "rgba(30, 30, 30, 0.20)",
  LOW:    "rgba(107, 101, 96, 0.18)",
};

/* Build ScaledPositions in PDF user space (usePdfCoordinates: true) for every
 * flag whose source_excerpt can be located in the document's text content. */
async function buildHighlights(
  pdf: PDFDocumentProxy,
  flags: Flag[]
): Promise<FlagHighlight[]> {
  const out: FlagHighlight[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const text = await page.getTextContent();
    const items = (text.items as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>).filter((it) => it && typeof it.str === "string");

    // Stringify each item's text so we can scan via simple substring matches.
    for (const flag of flags) {
      if (!flag.source_excerpt) continue;
      const needle = flag.source_excerpt.trim().toLowerCase();
      if (needle.length < 3) continue;

      // Look for a contiguous run of items whose joined .str contains needle.
      for (let i = 0; i < items.length; i++) {
        const start = items[i];
        let acc = (start.str || "").toLowerCase();
        let j = i;
        while (acc.length < needle.length + 20 && j + 1 < items.length) {
          j++;
          acc += " " + (items[j].str || "").toLowerCase();
        }
        if (!acc.includes(needle)) continue;

        // Use the union rect of items[i..j] in PDF user space.
        const sx = start.transform[4];
        const sy = start.transform[5];
        const ex = items[j].transform[4] + items[j].width;
        const ey = items[j].transform[5] + items[j].height;
        const pageWidth  = viewport.width;
        const pageHeight = viewport.height;

        const rect = {
          x1: Math.min(sx, ex) - 1,
          y1: Math.min(sy, ey) - 1,
          x2: Math.max(sx, ex) + 1,
          y2: Math.max(sy, ey) + Math.max(start.height, items[j].height) + 1,
          width: pageWidth,
          height: pageHeight,
          pageNumber,
        };

        const position: ScaledPosition = {
          boundingRect: rect,
          rects: [rect],
          usePdfCoordinates: true,
        };

        out.push({
          id: `flag-${flag.id}`,
          type: "text",
          position,
          content: { text: flag.source_excerpt },
          flagId: flag.id,
          ruleId: flag.rule_id,
          severity: flag.severity,
        });
        // Only the first match per flag per page
        break;
      }
    }
  }

  return out;
}

/* Custom highlight container — renders a TextHighlight with severity colour. */
function HighlightContainer({ onClick }: { onClick?: (flagId: string) => void }) {
  const ctx = useHighlightContainerContext<FlagHighlight>();
  const highlight = ctx.highlight;
  const isScrolledTo = ctx.isScrolledTo;

  return (
    <TextHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
      style={{ background: SEVERITY_COLOR[highlight.severity] ?? SEVERITY_COLOR.LOW }}
      onClick={() => onClick?.(highlight.flagId)}
    />
  );
}

export default function SourceHighlightedViewer({
  transcriptId,
  flags,
  onHighlightClick,
}: Props) {
  const token = useUIStore((s) => s.token);
  const [highlights, setHighlights] = useState<FlagHighlight[]>([]);
  const [errored, setErrored] = useState<string | null>(null);

  const docConfig = useMemo(() => ({
    url: `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/transcripts/${transcriptId}/file`,
    httpHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
  }), [transcriptId, token]);

  // Independently load the document via pdfjs to compute highlights, so
  // PdfHighlighter can render the array immediately on first paint.
  useEffect(() => {
    let cancelled = false;
    setHighlights([]);
    setErrored(null);
    (async () => {
      try {
        const task = getDocument(docConfig);
        const doc = await task.promise;
        const result = await buildHighlights(doc, flags);
        if (!cancelled) setHighlights(result);
      } catch (err) {
        if (!cancelled) {
          setErrored((err as Error).message || "Could not load PDF.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [docConfig, flags]);

  if (errored) {
    return (
      <div className="border border-charcoal-faint bg-cream-dark px-6 py-10">
        <p className="font-sans text-label uppercase tracking-wider text-charcoal-muted mb-2">
          Source unavailable
        </p>
        <p className="font-sans text-body-md text-charcoal-muted">
          {errored}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative border border-charcoal-faint bg-cream"
      style={{ height: "min(78vh, 900px)" }}
    >
      <PdfLoader document={docConfig}>
        {(pdfDocument) => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            highlights={highlights}
            enableAreaSelection={() => false}
            utilsRef={() => { /* we don't use these utilities */ }}
          >
            <HighlightContainer onClick={onHighlightClick} />
          </PdfHighlighter>
        )}
      </PdfLoader>

      {highlights.length === 0 && (
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-cream border border-charcoal-faint font-sans text-label uppercase tracking-wider text-charcoal-muted pointer-events-none">
          No source matches highlighted
        </div>
      )}
      {highlights.length > 0 && (
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-cream border border-charcoal-faint font-sans text-label uppercase tracking-wider text-charcoal pointer-events-none">
          {highlights.length} highlight{highlights.length === 1 ? "" : "s"} · click to focus
        </div>
      )}
    </div>
  );
}
