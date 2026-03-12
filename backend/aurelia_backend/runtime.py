from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import psycopg
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

try:
    import pgembed
except Exception:  # pragma: no cover - import failure handled at runtime
    pgembed = None  # type: ignore[assignment]

from . import __version__
from .backup import BackupWorker
from .config import (
    InstanceLayout,
    build_instance_layout,
    ensure_instance_files,
    ensure_instance_layout,
    load_instance_env,
    read_int_env,
    resolve_instance_root,
    write_runtime_config,
)
from .db import create_engine_for_url, create_session_factory, run_migrations
from .models import User

logger = logging.getLogger(__name__)


@dataclass
class RuntimeState:
    project_root: Path
    layout: InstanceLayout
    database_mode: str
    database_url: str
    embedded_server: Any | None
    embedded_pgdata: Path | None
    engine: Engine
    session_factory: sessionmaker[Session]
    backup_worker: BackupWorker


def _configure_logging(layout: InstanceLayout) -> None:
    log_file = layout.logs / "server.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
        force=True,
    )


def _ensure_database_exists(admin_url: str, database_name: str) -> None:
    with psycopg.connect(admin_url, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database_name,))
            if cur.fetchone() is None:
                cur.execute(f'CREATE DATABASE "{database_name}"')


def _resolve_database(layout: InstanceLayout) -> tuple[str, str, Any | None, Path | None]:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        return "external-postgres", database_url, None, None

    if pgembed is None:
        raise RuntimeError("DATABASE_URL is not set and pgembed is unavailable")

    embedded_db_name = os.getenv("AURELIA_DB_NAME", "aurelia").strip() or "aurelia"

    try:
        server = pgembed.get_server(layout.db)
    except Exception as exc:
        raise RuntimeError(
            "Embedded Postgres failed to start. Set DATABASE_URL to use external Postgres."
        ) from exc

    admin_url = server.get_uri("postgres")
    _ensure_database_exists(admin_url, embedded_db_name)
    app_db_url = server.get_uri(embedded_db_name)

    return "embedded-postgres", app_db_url, server, layout.db


def _seed_local_user(session_factory: sessionmaker[Session]) -> None:
    with session_factory() as db:
        user = db.get(User, "local-board")
        if user is None:
            db.add(User(id="local-board", name="Board", email="local@aurelia.local"))
            db.commit()


def bootstrap_runtime(project_root: Path) -> RuntimeState:
    layout = build_instance_layout(resolve_instance_root())
    ensure_instance_layout(layout)
    ensure_instance_files(layout)
    load_instance_env(layout)
    _configure_logging(layout)

    database_mode, database_url, embedded_server, embedded_pgdata = _resolve_database(layout)
    logger.info("Using %s", database_mode)

    run_migrations(database_url, project_root)

    engine = create_engine_for_url(database_url)
    session_factory = create_session_factory(engine)

    _seed_local_user(session_factory)

    backup_interval = read_int_env("AURELIA_BACKUP_INTERVAL_MINUTES", 60)
    backup_retention = read_int_env("AURELIA_BACKUP_RETENTION_DAYS", 30)

    backup_worker = BackupWorker(
        database_mode=database_mode,
        database_url=database_url,
        backups_dir=layout.backups,
        interval_minutes=backup_interval,
        retention_days=backup_retention,
        embedded_pgdata=embedded_pgdata,
    )

    write_runtime_config(
        layout=layout,
        database_mode=database_mode,
        database_url=database_url,
        backup_interval_minutes=backup_interval,
        backup_retention_days=backup_retention,
        app_version=__version__,
    )

    return RuntimeState(
        project_root=project_root,
        layout=layout,
        database_mode=database_mode,
        database_url=database_url,
        embedded_server=embedded_server,
        embedded_pgdata=embedded_pgdata,
        engine=engine,
        session_factory=session_factory,
        backup_worker=backup_worker,
    )


async def shutdown_runtime(runtime: RuntimeState) -> None:
    await runtime.backup_worker.stop()
    runtime.engine.dispose()

    if runtime.embedded_server is not None:
        try:
            runtime.embedded_server.cleanup()
        except Exception as exc:  # pragma: no cover - shutdown side effect
            logger.warning("Failed to cleanup embedded postgres: %s", exc)