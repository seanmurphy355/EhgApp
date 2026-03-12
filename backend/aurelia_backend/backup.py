from __future__ import annotations

import asyncio
import logging
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    import pgembed
except Exception:  # pragma: no cover - import failure handled at runtime
    pgembed = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)


class BackupWorker:
    def __init__(
        self,
        *,
        database_mode: str,
        database_url: str,
        backups_dir: Path,
        interval_minutes: int,
        retention_days: int,
        embedded_pgdata: Path | None,
    ) -> None:
        self.database_mode = database_mode
        self.database_url = database_url
        self.backups_dir = backups_dir
        self.interval_minutes = interval_minutes
        self.retention_days = retention_days
        self.embedded_pgdata = embedded_pgdata
        self._task: asyncio.Task[None] | None = None

    async def start(self) -> None:
        if self._task is not None:
            return
        self._task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        if self._task is None:
            return

        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        finally:
            self._task = None

    async def _run_loop(self) -> None:
        while True:
            try:
                await asyncio.to_thread(self.run_once)
            except Exception as exc:  # pragma: no cover - log side effect
                logger.warning("Backup job failed: %s", exc)
            await asyncio.sleep(self.interval_minutes * 60)

    def run_once(self) -> None:
        self.backups_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        backup_file = self.backups_dir / f"aurelia-{ts}.sql"

        if self.database_mode == "embedded-postgres" and self.embedded_pgdata is not None:
            if pgembed is None:
                raise RuntimeError("pgembed is required for embedded backup mode")

            pgembed.pg_dump(
                [
                    "--dbname",
                    self.database_url,
                    "--format=plain",
                    "--no-owner",
                    "--no-privileges",
                    "--file",
                    str(backup_file),
                ],
                pgdata=self.embedded_pgdata,
            )
        else:
            subprocess.run(
                [
                    "pg_dump",
                    "--dbname",
                    self.database_url,
                    "--format=plain",
                    "--no-owner",
                    "--no-privileges",
                    "--file",
                    str(backup_file),
                ],
                check=True,
                capture_output=True,
                text=True,
            )

        self._prune_old_backups()

    def _prune_old_backups(self) -> None:
        cutoff = datetime.now(timezone.utc) - timedelta(days=self.retention_days)
        for path in self.backups_dir.glob("*.sql"):
            modified = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
            if modified < cutoff:
                path.unlink(missing_ok=True)