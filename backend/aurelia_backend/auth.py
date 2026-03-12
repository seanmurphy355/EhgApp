from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import SessionRecord, User

SESSION_TTL_DAYS = 7

bearer_scheme = HTTPBearer(auto_error=False)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_local_session(db: Session, user: User) -> tuple[str, SessionRecord]:
    token = secrets.token_urlsafe(48)
    record = SessionRecord(
        id=str(uuid4()),
        user_id=user.id,
        token_hash=hash_token(token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS),
    )
    db.add(record)
    return token, record


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token_hash = hash_token(credentials.credentials)
    now = datetime.now(timezone.utc)

    user = db.scalar(
        select(User)
        .join(SessionRecord, SessionRecord.user_id == User.id)
        .where(SessionRecord.token_hash == token_hash, SessionRecord.expires_at > now)
        .limit(1)
    )

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    return user