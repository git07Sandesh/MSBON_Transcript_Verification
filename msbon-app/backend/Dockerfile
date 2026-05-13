# Stage 1: Install Python dependencies in isolation
FROM python:3.11-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim AS production
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages \
     /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .
RUN mkdir -p data logs
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
