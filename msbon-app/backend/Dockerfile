# syntax=docker/dockerfile:1.6
#
# Two-stage build for the MSBON FastAPI backend. Targets Render Web Service
# but works equally well for Fly.io, Railway, or local docker-compose. The
# image bundles Tesseract OCR and libmagic so the document extractor +
# magic-byte MIME sniffer have everything they need.

# ── Stage 1: Python deps in isolation ────────────────────────────────────
FROM python:3.11-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime image ───────────────────────────────────────────────
FROM python:3.11-slim AS production

# System packages required at runtime:
#  - tesseract-ocr        : OCR for image transcripts
#  - libmagic1            : python-magic shared library for MIME sniffing
#  - libpq5               : libpq runtime for psycopg
#  - curl                 : for the HEALTHCHECK + ad-hoc smoke tests
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       tesseract-ocr \
       libmagic1 \
       libpq5 \
       curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages \
     /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .
RUN mkdir -p data logs uploads

# Render injects PORT (typically 10000); fall back to 8000 for local docker run.
ENV PORT=8000 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# /entrypoint.sh runs Alembic, then exec's uvicorn so signals propagate.
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/v1/health" || exit 1

CMD ["/entrypoint.sh"]
