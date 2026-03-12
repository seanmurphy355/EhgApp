from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import __version__
from .auth import get_current_user, issue_local_session
from .db import get_db
from .models import ActivityEvent, User
from .runtime import RuntimeState, bootstrap_runtime, shutdown_runtime
from .schemas import (
    ActivityItemOut,
    ActivityListResponse,
    ActivitySummaryResponse,
    CreateLocalSessionResponse,
    HealthOut,
    RunTaskRequest,
    RunTaskResponse,
    UserOut,
)


def _to_activity_item(activity: ActivityEvent) -> ActivityItemOut:
    return ActivityItemOut(
        id=activity.id,
        type=activity.type,
        detail=activity.detail,
        metadata=activity.metadata_json or {},
        createdAt=activity.created_at,
    )


def _record_activity(
    db: Session,
    *,
    user_id: str,
    activity_type: str,
    detail: str,
    metadata: dict[str, object] | None = None,
) -> ActivityEvent:
    event = ActivityEvent(
        id=str(uuid4()),
        user_id=user_id,
        type=activity_type,
        detail=detail,
        metadata_json=metadata or {},
    )
    db.add(event)
    return event


def create_app() -> FastAPI:
    app = FastAPI(title="Aurelia Backend", version=__version__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "tauri://localhost",
            "http://localhost",
            "http://127.0.0.1",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def on_startup() -> None:
        project_root = Path(__file__).resolve().parent.parent
        runtime = bootstrap_runtime(project_root)
        app.state.runtime = runtime
        await runtime.backup_worker.start()

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        runtime: RuntimeState | None = getattr(app.state, "runtime", None)
        if runtime is not None:
            await shutdown_runtime(runtime)

    @app.get("/api/health", response_model=HealthOut)
    def health(request: Request) -> HealthOut:
        runtime: RuntimeState = request.app.state.runtime
        return HealthOut(status="ok", dbMode=runtime.database_mode, version=__version__)

    @app.post("/api/sessions/local", response_model=CreateLocalSessionResponse)
    def create_local_session(db: Session = Depends(get_db)) -> CreateLocalSessionResponse:
        user = db.get(User, "local-board")
        if user is None:
            user = User(id="local-board", name="Board", email="local@aurelia.local")
            db.add(user)
            db.flush()

        token, _session = issue_local_session(db, user)
        _record_activity(
            db,
            user_id=user.id,
            activity_type="session.created",
            detail="Local trusted session created.",
            metadata={"source": "local"},
        )
        db.commit()

        return CreateLocalSessionResponse(token=token, user=UserOut.model_validate(user))

    @app.get("/api/users/me", response_model=UserOut)
    def get_current_user_endpoint(user: User = Depends(get_current_user)) -> UserOut:
        return UserOut.model_validate(user)

    @app.post("/api/tasks/run", response_model=RunTaskResponse)
    def run_task(payload: RunTaskRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> RunTaskResponse:
        repo = payload.repo.strip()
        prompt = payload.prompt.strip()

        event = _record_activity(
            db,
            user_id=user.id,
            activity_type="task.run_requested",
            detail=f"Task requested for {repo}",
            metadata={"repo": repo, "prompt": prompt},
        )

        db.commit()
        db.refresh(event)

        return RunTaskResponse(activity=_to_activity_item(event))

    @app.get("/api/activity", response_model=ActivityListResponse)
    def list_activity(
        limit: int = Query(default=50, ge=1, le=200),
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ) -> ActivityListResponse:
        rows = db.scalars(
            select(ActivityEvent)
            .where(ActivityEvent.user_id == user.id)
            .order_by(ActivityEvent.created_at.desc())
            .limit(limit)
        ).all()

        return ActivityListResponse(items=[_to_activity_item(row) for row in rows])

    @app.get("/api/activity/summary", response_model=ActivitySummaryResponse)
    def get_activity_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ActivitySummaryResponse:
        local_now = datetime.now().astimezone()
        start_of_day = local_now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)

        tasks_today = db.scalar(
            select(func.count(ActivityEvent.id)).where(
                ActivityEvent.user_id == user.id,
                ActivityEvent.type == "task.run_requested",
                ActivityEvent.created_at >= start_of_day,
            )
        )
        events_today = db.scalar(
            select(func.count(ActivityEvent.id)).where(
                ActivityEvent.user_id == user.id,
                ActivityEvent.created_at >= start_of_day,
            )
        )
        last_event_at = db.scalar(
            select(func.max(ActivityEvent.created_at)).where(ActivityEvent.user_id == user.id)
        )

        return ActivitySummaryResponse(
            tasksToday=int(tasks_today or 0),
            eventsToday=int(events_today or 0),
            lastEventAt=last_event_at,
        )

    return app


app = create_app()