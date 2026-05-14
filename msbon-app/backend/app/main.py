"""FastAPI application factory."""
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.logging_config import configure_logging
from app.database import init_db
from app.exceptions import MSBONBaseException
# Eagerly import every ORM model so SQLAlchemy can resolve cross-table
# back-references (e.g. Transcript.flags -> VerificationFlag) the first
# time any code path opens a session, including background-task workers.
from app.models import orm  # noqa: F401

from app.api.v1 import auth, health, transcripts, reviews, audit, programs, contact, insights, files, reports

configure_logging(settings.log_level)
logger = logging.getLogger(__name__)

if settings.sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        integrations=[FastApiIntegration()],
    )


def create_app() -> FastAPI:
    from app.middleware.correlation import CorrelationIDMiddleware
    from app.middleware.request_logging import RequestLoggingMiddleware

    app = FastAPI(
        title="MSBON Transcript Verification System",
        version=settings.app_version,
        description="AI-assisted nursing transcript verification for MSBON. PoC.",
    )

    app.add_middleware(CorrelationIDMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # Global exception handler for all MSBON custom errors
    @app.exception_handler(MSBONBaseException)
    async def msbon_exception_handler(request: Request, exc: MSBONBaseException):
        return JSONResponse(
            status_code=exc.http_status,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "detail": exc.detail,
                    "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                }
            },
        )

    # Startup: create tables and seed data
    @app.on_event("startup")
    def on_startup():
        init_db()

    # Routers
    prefix = "/api/v1"
    app.include_router(auth.router, prefix=prefix)
    app.include_router(health.router, prefix=prefix)
    app.include_router(transcripts.router, prefix=prefix)
    app.include_router(reviews.router, prefix=prefix)
    app.include_router(audit.router, prefix=prefix)
    app.include_router(programs.router, prefix=prefix)
    app.include_router(contact.router, prefix=prefix)
    app.include_router(insights.router, prefix=prefix)
    app.include_router(files.router, prefix=prefix)
    app.include_router(reports.router, prefix=prefix)

    return app


app = create_app()
