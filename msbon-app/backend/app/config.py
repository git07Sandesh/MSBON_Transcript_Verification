from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    sentry_dsn: str = ""

    @field_validator("gemini_api_key")
    @classmethod
    def validate_gemini_key(cls, v: str) -> str:
        if not v or len(v) < 10:
            raise ValueError(
                "GEMINI_API_KEY must be set and be at least 10 characters. "
                "Set GEMINI_API_KEY in your .env file."
            )
        return v

    gemini_model: str = "gemini-2.0-flash"

    database_url: str = "sqlite:///./data/msbon.db"

    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10
    file_retention_hours: int = 24

    database_pool_size: int = 10
    database_max_overflow: int = 20
    encryption_key: str = ""  # Will be required via validator later

    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"
    app_version: str = "1.0.0-poc"

    # Legacy local-JWT secret (kept for transition; new login flow uses Supabase).
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    environment: str = "development"

    # ── Supabase ─────────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    @property
    def supabase_configured(self) -> bool:
        """True when every Supabase credential is present."""
        return bool(
            self.supabase_url
            and self.supabase_anon_key
            and self.supabase_service_role_key
            and self.supabase_jwt_secret
        )

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
