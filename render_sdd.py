#!/usr/bin/env python3
"""
Render Mermaid diagrams in SDD and produce:
  1. Software_Design_Document_rendered.md  (images inline)
  2. Software_Design_Document.docx         (via pandoc)
  3. Software_Design_Document.pdf          (via pandoc + weasyprint / wkhtmltopdf fallback)
"""

import re
import os
import sys
import subprocess
import tempfile
from pathlib import Path

BASE_DIR = Path("/Users/sandeshbhattarai/Desktop/CSC 424")
SDD_PATH = BASE_DIR / "Software_Design_Document.md"
FIGURES_DIR = BASE_DIR / "sdd_figures"
RENDERED_MD = BASE_DIR / "Software_Design_Document_rendered.md"
DOCX_OUT   = BASE_DIR / "Software_Design_Document.docx"
PDF_OUT    = BASE_DIR / "Software_Design_Document.pdf"
MMDC       = Path.home() / ".npm-global/bin/mmdc"

FIGURES_DIR.mkdir(exist_ok=True)

# ── 1. Read source ─────────────────────────────────────────────────────────────
src = SDD_PATH.read_text(encoding="utf-8")

# ── 2. Extract & render every ```mermaid block ─────────────────────────────────
MERMAID_RE = re.compile(r"```mermaid\n(.*?)```", re.DOTALL)

diagram_labels = {
    "graph TB": [],
    "graph LR": [],
    "flowchart": [],
    "sequenceDiagram": [],
    "classDiagram": [],
    "stateDiagram": [],
    "erDiagram": [],
}

# friendly name counters
counters: dict[str, int] = {}

def diagram_slug(content: str) -> str:
    first_line = content.strip().splitlines()[0].lower()
    for key in ("sequencediagram", "classdiagram", "statediagram", "erdiagram",
                "flowchart", "graph"):
        if key in first_line:
            base = key.replace("diagram", "_diagram")
            counters[base] = counters.get(base, 0) + 1
            return f"{base}_{counters[base]}"
    counters["figure"] = counters.get("figure", 0) + 1
    return f"figure_{counters['figure']}"

replacements: list[tuple[str, str]] = []  # (original_block, markdown_img)

for match in MERMAID_RE.finditer(src):
    diagram_src = match.group(1)
    slug = diagram_slug(diagram_src)
    mmd_file  = FIGURES_DIR / f"{slug}.mmd"
    png_file  = FIGURES_DIR / f"{slug}.png"

    mmd_file.write_text(diagram_src, encoding="utf-8")

    # puppeteer config – point at system Chrome
    puppet_cfg = FIGURES_DIR / "puppeteer-config.json"
    if not puppet_cfg.exists():
        puppet_cfg.write_text(
            '{"executablePath":"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",'
            '"args":["--no-sandbox","--disable-setuid-sandbox"]}',
            encoding="utf-8"
        )

    cmd = [
        str(MMDC),
        "-i", str(mmd_file),
        "-o", str(png_file),
        "-p", str(puppet_cfg),
        "--backgroundColor", "white",
        "--width", "1400",
        "--height", "900",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [WARN] mmdc failed for {slug}: {result.stderr.strip()[:200]}")
        # fallback: keep the mermaid code block as-is
        replacements.append((match.group(0), match.group(0)))
    else:
        # relative path for the markdown image
        rel = f"sdd_figures/{slug}.png"
        caption = slug.replace("_", " ").replace("diagram", "Diagram").title()
        img_md = f"![{caption}]({rel})\n"
        print(f"  [OK]   Rendered {slug}.png")
        replacements.append((match.group(0), img_md))

# ── 3. Build rendered markdown ─────────────────────────────────────────────────
rendered = src
for original, replacement in replacements:
    rendered = rendered.replace(original, replacement, 1)

RENDERED_MD.write_text(rendered, encoding="utf-8")
print(f"\n[OK] Rendered markdown → {RENDERED_MD}")

# ── 4. Convert to DOCX via pandoc ──────────────────────────────────────────────
pandoc_base = [
    "pandoc",
    str(RENDERED_MD),
    "--from", "markdown+pipe_tables+fenced_code_blocks",
    "--standalone",
    "--toc",
    "--toc-depth=3",
    "--resource-path", str(BASE_DIR),
]

docx_cmd = pandoc_base + [
    "--to", "docx",
    "-o", str(DOCX_OUT),
    "--reference-doc", "/dev/null",   # use pandoc default styles
]
# remove --reference-doc if it causes issues
docx_cmd = [c for c in docx_cmd if c != "--reference-doc" and c != "/dev/null"]

result = subprocess.run(docx_cmd, capture_output=True, text=True, cwd=str(BASE_DIR))
if result.returncode == 0:
    print(f"[OK] DOCX → {DOCX_OUT}")
else:
    print(f"[WARN] DOCX pandoc error: {result.stderr.strip()[:400]}")

# ── 5. Convert to PDF ──────────────────────────────────────────────────────────
# Try pandoc HTML → PDF via Chrome (no LaTeX required)
html_tmp = BASE_DIR / "_sdd_tmp.html"
html_cmd = pandoc_base + [
    "--to", "html5",
    "--embed-resources",
    "--standalone",
    "--css", "",   # no external CSS – remove blank
    "-o", str(html_tmp),
]
html_cmd = [c for c in html_cmd if c != "--css" and c != ""]

result_html = subprocess.run(html_cmd, capture_output=True, text=True, cwd=str(BASE_DIR))
if result_html.returncode != 0:
    print(f"[WARN] HTML step error: {result_html.stderr.strip()[:400]}")
else:
    # Use Chrome headless to print to PDF
    chrome_pdf_cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--print-to-pdf={str(PDF_OUT)}",
        "--print-to-pdf-no-header",
        str(html_tmp),
    ]
    result_pdf = subprocess.run(chrome_pdf_cmd, capture_output=True, text=True)
    if result_pdf.returncode == 0 and PDF_OUT.exists():
        print(f"[OK] PDF  → {PDF_OUT}")
    else:
        print(f"[WARN] Chrome PDF error: {result_pdf.stderr.strip()[:400]}")
        # Fallback: pandoc → pdf via weasyprint if available
        wp_cmd = pandoc_base + ["--pdf-engine=weasyprint", "-o", str(PDF_OUT)]
        r = subprocess.run(wp_cmd, capture_output=True, text=True, cwd=str(BASE_DIR))
        if r.returncode == 0:
            print(f"[OK] PDF (weasyprint) → {PDF_OUT}")
        else:
            print(f"[ERR] PDF generation failed: {r.stderr.strip()[:400]}")

# cleanup temp html
if html_tmp.exists():
    html_tmp.unlink()

print("\nDone.")
