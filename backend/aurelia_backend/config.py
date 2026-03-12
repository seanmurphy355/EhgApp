from __future__ import annotations

import json
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

DEFAULT_INSTANCE_ROOT = Path.home() / ".aurelia" / "instances" / "default"


@dataclass(frozen=True)
class InstanceLayout:
    root: Path
    db: Path
    data: Path
    storage: Path
    backups: Path
    logs: Path
    secrets: Path
    env_file: Path
    config_file: Path
    master_key_file: Path


def resolve_instance_root() -> Path:
    configured = os.getenv("AURELIA_INSTANCE_ROOT", "").strip()
    if configured:
        return Path(configured).expanduser().resolve()
    return DEFAULT_INSTANCE_ROOT


def build_instance_layout(root: Path) -> InstanceLayout:
    return InstanceLayout(
        root=root,
        db=root / "db",
        data=root / "data",
        storage=root / "data" / "storage",
        backups=root / "data" / "backups",
        logs=root / "logs",
        secrets=root / "secrets",
        env_file=root / ".env",
        config_file=root / "config.json",
        master_key_file=root / "secrets" / "master.key",
    )


def ensure_instance_layout(layout: InstanceLayout) -> None:
    layout.root.mkdir(parents=True, exist_ok=True)
    layout.db.mkdir(parents=True, exist_ok=True)
    layout.data.mkdir(parents=True, exist_ok=True)
    layout.storage.mkdir(parents=True, exist_ok=True)
    layout.backups.mkdir(parents=True, exist_ok=True)
    layout.logs.mkdir(parents=True, exist_ok=True)
    layout.secrets.mkdir(parents=True, exist_ok=True)


def ensure_instance_files(layout: InstanceLayout) -> None:
    if not layout.master_key_file.exists():
        layout.master_key_file.write_text(f"{secrets.token_hex(32)}\n", encoding="utf-8")

    if not layout.env_file.exists():
        jwt_secret = secrets.token_urlsafe(48)
        layout.env_file.write_text(f"AURELIA_AGENT_JWT_SECRET={jwt_secret}\n", encoding="utf-8")


def load_instance_env(layout: InstanceLayout) -> None:
    load_dotenv(layout.env_file, override=False)


def write_runtime_config(
    *,
    layout: InstanceLayout,
    database_mode: str,
    database_url: str,
    backup_interval_minutes: int,
    backup_retention_days: int,
    app_version: str,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    parsed_url = urlparse(database_url)
    detected_port = parsed_url.port

    payload = {
        "$meta": {
            "version": 1,
            "updatedAt": now,
            "source": "aurelia_backend",
            "appVersion": app_version,
        },
        "database": {
            "mode": database_mode,
            "embeddedPostgresDataDir": str(layout.db),
            "embeddedPostgresPort": detected_port,
            "backup": {
                "enabled": True,
                "intervalMinutes": backup_interval_minutes,
                "retentionDays": backup_retention_days,
                "dir": str(layout.backups),
            },
        },
        "logging": {
            "mode": "file",
            "logDir": str(layout.logs),
        },
        "server": {
            "deploymentMode": "local_trusted",
            "exposure": "private",
            "host": "127.0.0.1",
            "port": 8787,
            "serveUi": False,
        },
        "auth": {
            "mode": "local_trusted",
            "disableSignUp": True,
        },
        "storage": {
            "provider": "local_disk",
            "localDisk": {
                "baseDir": str(layout.storage),
            },
        },
        "secrets": {
            "provider": "local_encrypted",
            "localEncrypted": {
                "keyFilePath": str(layout.master_key_file),
            },
        },
    }

    layout.config_file.write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")


def read_int_env(name: str, default: int, *, minimum: int = 1) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default

    raw = raw.strip()
    if not raw:
        return default

    try:
        value = int(raw)
    except ValueError:
        return default

    return value if value >= minimum else default