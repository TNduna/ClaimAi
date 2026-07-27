from __future__ import annotations

import os
from typing import Optional


class Config:
    """Environment-based configuration for the sales orchestration backend."""

    # API Keys
    NEWSAPI_KEY: Optional[str] = os.getenv("NEWSAPI_KEY")
    CRUNCHBASE_API_KEY: Optional[str] = os.getenv("CRUNCHBASE_API_KEY")
    APOLLO_API_KEY: Optional[str] = os.getenv("APOLLO_API_KEY")

    # Orchestration
    MAX_CONCURRENCY: int = int(os.getenv("MAX_CONCURRENCY", "10"))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "86400"))  # 24 hours

    # Fetcher Strategy
    # One of: "stub" (default), "newsapi+crunchbase"
    FETCHER_MODE: str = os.getenv("FETCHER_MODE", "stub")

    @classmethod
    def validate(cls) -> None:
        """Validate that required keys are present for the selected fetcher mode."""
        if cls.FETCHER_MODE == "newsapi+crunchbase":
            if not cls.NEWSAPI_KEY:
                raise ValueError("NEWSAPI_KEY is required when FETCHER_MODE='newsapi+crunchbase'")
            if not cls.CRUNCHBASE_API_KEY:
                raise ValueError("CRUNCHBASE_API_KEY is required when FETCHER_MODE='newsapi+crunchbase'")

    @classmethod
    def describe(cls) -> str:
        """Return a human-readable summary of the current configuration."""
        return f"""
Sales Orchestration Config:
  FETCHER_MODE: {cls.FETCHER_MODE}
  MAX_CONCURRENCY: {cls.MAX_CONCURRENCY}
  CACHE_TTL_SECONDS: {cls.CACHE_TTL_SECONDS}
  NEWSAPI_KEY: {"set" if cls.NEWSAPI_KEY else "not set"}
  CRUNCHBASE_API_KEY: {"set" if cls.CRUNCHBASE_API_KEY else "not set"}
  APOLLO_API_KEY: {"set" if cls.APOLLO_API_KEY else "not set"}
"""
