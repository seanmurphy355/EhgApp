from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


ActivityType = Literal["task.run_requested", "session.created", "system.info"]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str


class HealthOut(BaseModel):
    status: Literal["ok"]
    dbMode: Literal["embedded-postgres", "external-postgres"]
    version: str


class CreateLocalSessionResponse(BaseModel):
    token: str
    user: UserOut


class ActivityItemOut(BaseModel):
    id: str
    type: ActivityType
    detail: str
    metadata: dict[str, Any]
    createdAt: datetime


class RunTaskRequest(BaseModel):
    repo: str = Field(min_length=1, max_length=300)
    prompt: str = Field(min_length=1, max_length=10_000)


class RunTaskResponse(BaseModel):
    activity: ActivityItemOut


class ActivityListResponse(BaseModel):
    items: list[ActivityItemOut]


class ActivitySummaryResponse(BaseModel):
    tasksToday: int
    eventsToday: int
    lastEventAt: datetime | None


class AgentPaidRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2000)
    method: Literal["GET", "POST"] = "GET"
    body: dict[str, Any] | list[Any] | None = None


class AgentPaidResponse(BaseModel):
    status: int
    data: Any


class AgentWalletInfo(BaseModel):
    address: str | None
    configured: bool