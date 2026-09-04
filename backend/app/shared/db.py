"""Shared SQLAlchemy engine and ORM base for all services.

Each service's ORM model is defined in its own logic.py — only the engine factory
and the declarative base live here to avoid any cross-service import coupling.
"""

from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase

# Canonical database path: data/dummy/app.db, resolved relative to repo root.
_DEFAULT_DB_PATH: str = str(
    (Path(__file__).resolve().parents[3] / 'data' / 'dummy' / 'app.db').resolve()
)


def get_db_path() -> str:
    """Return the absolute path to the SQLite database file."""
    return _DEFAULT_DB_PATH


def get_engine(db_path: str | None = None) -> Engine:
    """Create a SQLAlchemy engine for the given SQLite path.

    Args:
        db_path: Absolute path to the SQLite file.  Defaults to the shared
                 ``data/dummy/app.db`` path so every service uses the same DB.

    Returns:
        A synchronous SQLAlchemy ``Engine`` instance.
    """
    path = db_path or _DEFAULT_DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return create_engine(f'sqlite:///{path}', connect_args={'check_same_thread': False})


class Base(DeclarativeBase):
    """Declarative base for all ORM models in this project."""
