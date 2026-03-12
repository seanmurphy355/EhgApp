from __future__ import annotations

from pathlib import Path
from typing import Generator

from alembic import command
from alembic.config import Config
from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


def create_engine_for_url(database_url: str) -> Engine:
    return create_engine(database_url, future=True, pool_pre_ping=True)


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


def run_migrations(database_url: str, project_root: Path) -> None:
    alembic_cfg = Config(str(project_root / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(project_root / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(alembic_cfg, "head")


def get_db(request: Request) -> Generator[Session, None, None]:
    runtime = request.app.state.runtime
    db = runtime.session_factory()
    try:
        yield db
    finally:
        db.close()