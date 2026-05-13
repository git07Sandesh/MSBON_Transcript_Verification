import logging
import shutil
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


def backup_database(db_path: str, backup_dir: str = "data/backups", max_backups: int = 7) -> None:
    """Copy the SQLite database file to a timestamped backup location.
    Retains only the most recent max_backups copies."""
    backup_path = Path(backup_dir)
    backup_path.mkdir(parents=True, exist_ok=True)

    source = Path(db_path)
    if not source.exists():
        logger.warning("Backup skipped: database file not found", extra={"db_path": db_path})
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = backup_path / f"msbon_{timestamp}.db"
    shutil.copy2(source, dest)
    logger.info("Database backup created", extra={"backup_path": str(dest)})

    # Prune oldest backups beyond max_backups
    existing = sorted(backup_path.glob("msbon_*.db"))
    to_delete = existing[:-max_backups] if len(existing) > max_backups else []
    for old_backup in to_delete:
        old_backup.unlink()
        logger.info("Old backup pruned", extra={"path": str(old_backup)})
