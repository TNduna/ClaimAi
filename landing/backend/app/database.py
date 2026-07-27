from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session

from app.models import Base


# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./synth_sales_research.db"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize the database, creating all tables."""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DATABASE_URL}")


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
