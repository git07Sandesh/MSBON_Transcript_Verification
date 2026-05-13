import logging
import logging.handlers
import os
from pythonjsonlogger import jsonlogger


class SensitiveDataFilter(logging.Filter):
    """Redacts sensitive fields from log records."""
    REDACT_KEYS = {"api_key", "token", "password", "authorization", "gemini_api_key"}

    def filter(self, record: logging.LogRecord) -> bool:
        if hasattr(record, "msg") and isinstance(record.msg, dict):
            for key in self.REDACT_KEYS:
                if key in record.msg:
                    record.msg[key] = "[REDACTED]"
        for key in self.REDACT_KEYS:
            if hasattr(record, key):
                setattr(record, key, "[REDACTED]")
        return True


def configure_logging(log_level: str = "INFO") -> None:
    """Configure structured JSON logging with file rotation and sensitive data filtering."""
    os.makedirs("logs", exist_ok=True)
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    sensitive_filter = SensitiveDataFilter()

    file_handler = logging.handlers.RotatingFileHandler(
        "logs/app.log",
        maxBytes=10_000_000,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.addFilter(sensitive_filter)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.addFilter(sensitive_filter)

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    if not root_logger.handlers:
        root_logger.addHandler(file_handler)
        root_logger.addHandler(console_handler)
