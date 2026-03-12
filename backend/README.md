# Aurelia Backend

Local-first Python backend for Aurelia, mirroring Paperclip-style storage under `%USERPROFILE%\\.aurelia\\instances\\default`.

## Quick Start

1. `cd backend`
2. `uv sync`
3. `uv run uvicorn aurelia_backend.main:app --host 127.0.0.1 --port 8787 --reload`

## Environment

- `DATABASE_URL` (optional): use external Postgres instead of embedded Postgres.
- `AURELIA_INSTANCE_ROOT` (optional): override default instance directory.
- `AURELIA_BACKUP_INTERVAL_MINUTES` (optional, default `60`).
- `AURELIA_BACKUP_RETENTION_DAYS` (optional, default `30`).