#!/usr/bin/env python3
"""
Render the Software Requirements Document.

Mirrors render_sdd.py but targets the SRD. Replaces every inline ```mermaid```
block with a link to the matching pre-rendered image in srd_figures/, then
runs pandoc to emit Software_Requirements_Document.docx and .pdf.

Diagrams are expected to already exist in srd_figures/ (they are rendered via
the claude-mermaid MCP — see feedback_diagram_tooling.md). This script is
intentionally idempotent: re-running it just rewrites the rendered .md/.docx/.pdf
from the current source.
"""
import re
import subprocess
from pathlib import Path

BASE_DIR = Path("/Users/sandeshbhattarai/Desktop/CSC 424")
SRD_PATH = BASE_DIR / "Software_Requirements_Document.md"
FIGURES_DIR = BASE_DIR / "srd_figures"
RENDERED_MD = BASE_DIR / "Software_Requirements_Document_rendered.md"
DOCX_OUT = BASE_DIR / "Software_Requirements_Document.docx"
PDF_OUT = BASE_DIR / "Software_Requirements_Document.pdf"

# Map mermaid block first-line patterns to figure filenames in srd_figures/.
# Order matters — the Nth match in the document is paired with the Nth entry
# of the same kind in this list.
FIGURE_ORDER = [
    ("graph TB", "srd_context_diagram.png"),
    ("graph LR", "srd_information_architecture.png"),
    ("graph LR", "srd_use_case_diagram.png"),
    ("sequenceDiagram", "srd_sequence_e2e.png"),
    ("erDiagram", "srd_er_diagram.png"),
    ("stateDiagram-v2", "srd_state_machine.png"),
]

MERMAID_RE = re.compile(r"```mermaid\n(.*?)```", re.DOTALL)


def kind_of(block: str) -> str:
    first = block.strip().splitlines()[0].strip()
    for key in ("sequenceDiagram", "classDiagram", "stateDiagram-v2",
                "stateDiagram", "erDiagram", "flowchart", "graph TB",
                "graph LR"):
        if first.startswith(key):
            return key
    return first.split()[0] if first else "unknown"


def main() -> None:
    src = SRD_PATH.read_text(encoding="utf-8")

    rendered = src
    blocks = MERMAID_RE.findall(src)
    if len(blocks) != len(FIGURE_ORDER):
        print(f"[WARN] Found {len(blocks)} mermaid blocks but FIGURE_ORDER has "
              f"{len(FIGURE_ORDER)} entries — image mapping may be off.")

    consumed: dict[str, int] = {}
    for block in blocks:
        k = kind_of(block)
        idx = consumed.get(k, 0)
        # find the (idx-th) FIGURE_ORDER entry whose kind matches k
        match_count = -1
        chosen = None
        for entry_kind, fname in FIGURE_ORDER:
            if entry_kind == k:
                match_count += 1
                if match_count == idx:
                    chosen = fname
                    break
        consumed[k] = idx + 1

        if chosen is None:
            print(f"[WARN] No figure mapping for {k} occurrence #{idx + 1}; "
                  "leaving mermaid block in place.")
            continue

        img_md = f"![{chosen.replace('_', ' ').rsplit('.', 1)[0].title()}](srd_figures/{chosen})\n"
        original = f"```mermaid\n{block}```"
        rendered = rendered.replace(original, img_md, 1)
        print(f"[OK] Inlined srd_figures/{chosen} for {k} #{idx + 1}")

    RENDERED_MD.write_text(rendered, encoding="utf-8")
    print(f"\n[OK] Rendered markdown -> {RENDERED_MD}")

    pandoc_base = [
        "pandoc", str(RENDERED_MD),
        "--from", "markdown+pipe_tables+fenced_code_blocks",
        "--standalone", "--toc", "--toc-depth=3",
        "--resource-path", str(BASE_DIR),
    ]

    docx = subprocess.run(
        pandoc_base + ["--to", "docx", "-o", str(DOCX_OUT)],
        capture_output=True, text=True, cwd=str(BASE_DIR),
    )
    print(f"[{'OK' if docx.returncode == 0 else 'WARN'}] DOCX -> {DOCX_OUT}")
    if docx.returncode:
        print(docx.stderr.strip()[:400])

    html_tmp = BASE_DIR / "_srd_tmp.html"
    html = subprocess.run(
        pandoc_base + ["--to", "html5", "--embed-resources", "-o", str(html_tmp)],
        capture_output=True, text=True, cwd=str(BASE_DIR),
    )
    if html.returncode == 0:
        chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        pdf = subprocess.run(
            [chrome, "--headless=new", "--no-sandbox", "--disable-gpu",
             f"--print-to-pdf={PDF_OUT}", "--print-to-pdf-no-header",
             str(html_tmp)],
            capture_output=True, text=True,
        )
        print(f"[{'OK' if PDF_OUT.exists() else 'WARN'}] PDF  -> {PDF_OUT}")
        if pdf.stderr:
            print(pdf.stderr.strip()[:200])
        html_tmp.unlink(missing_ok=True)
    else:
        print(f"[WARN] HTML step failed: {html.stderr.strip()[:200]}")

    print("\nDone.")


if __name__ == "__main__":
    main()
