import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.database import Base

# Import all models so Alembic sees them
from app.models.orm import (  # noqa: F401
    transcript,
    extracted_data,
    verification_flag,
    staff_review,
    audit_log,
    flagging_rule,
    accredited_program,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# Use the same DATABASE_URL the running app uses. settings comes from
# pydantic-settings, which reads .env at import time, so this works whether
# alembic is invoked manually from a shell or programmatically by init_db().
_DATABASE_URL = settings.database_url


def run_migrations_offline() -> None:
    config.set_main_option("sqlalchemy.url", _DATABASE_URL)
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    config.set_main_option("sqlalchemy.url", _DATABASE_URL)
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
