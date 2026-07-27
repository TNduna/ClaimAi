from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, create_engine
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON

Base = declarative_base()


class Prospect(Base):
    """Prospect record with company and contact info."""

    __tablename__ = "prospects"

    id = Column(String(36), primary_key=True)  # UUID
    job_id = Column(String(36), index=True)  # Source job/list ID
    company_name = Column(String(255), nullable=False, index=True)
    domain = Column(String(255), nullable=True, index=True)
    contact_name = Column(String(255), nullable=True)
    contact_title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    research_results = relationship("ResearchResult", back_populates="prospect", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "job_id": self.job_id,
            "company_name": self.company_name,
            "domain": self.domain,
            "contact_name": self.contact_name,
            "contact_title": self.contact_title,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ResearchResult(Base):
    """Research result for a single prospect with all collected signals and the draft."""

    __tablename__ = "research_results"

    id = Column(String(36), primary_key=True)  # UUID
    prospect_id = Column(String(36), ForeignKey("prospects.id"), nullable=False, index=True)
    
    # Company Snapshot
    snapshot_summary = Column(Text, nullable=True)
    snapshot_sources = Column(JSON, default=list)  # List of URLs
    
    # Trigger Event
    trigger_event = Column(Text, nullable=True)
    trigger_event_date = Column(String(20), nullable=True)  # ISO date
    trigger_event_type = Column(String(50), nullable=True)  # funding, leadership, expansion, launch, etc.
    trigger_sources = Column(JSON, default=list)  # List of URLs
    
    # Funding/Size
    funding_signal = Column(Text, nullable=True)
    funding_stage = Column(String(50), nullable=True)  # Series A, Series B, etc.
    headcount_range = Column(String(50), nullable=True)
    funding_sources = Column(JSON, default=list)  # List of URLs
    
    # Role Context
    role_context = Column(Text, nullable=True)
    role_context_sources = Column(JSON, default=list)  # List of URLs
    
    # Generated Draft
    draft_message = Column(Text, nullable=True)
    draft_sources = Column(JSON, default=list)  # List of URLs backing the draft
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    prospect = relationship("Prospect", back_populates="research_results")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "prospect_id": self.prospect_id,
            "snapshot": {
                "summary": self.snapshot_summary,
                "sources": self.snapshot_sources,
            },
            "trigger": {
                "event": self.trigger_event,
                "event_date": self.trigger_event_date,
                "event_type": self.trigger_event_type,
                "sources": self.trigger_sources,
            },
            "funding": {
                "signal": self.funding_signal,
                "funding_stage": self.funding_stage,
                "headcount_range": self.headcount_range,
                "sources": self.funding_sources,
            },
            "role_context": {
                "insight": self.role_context,
                "sources": self.role_context_sources,
            },
            "draft": {
                "message": self.draft_message,
                "sources": self.draft_sources,
            },
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
