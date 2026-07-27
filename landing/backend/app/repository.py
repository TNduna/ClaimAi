from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

from sqlalchemy.orm import Session

from app.models import Prospect, ResearchResult


class ProspectRepository:
    """Repository for Prospect CRUD operations."""

    @staticmethod
    def create(
        db: Session,
        job_id: str,
        company_name: str,
        domain: Optional[str] = None,
        contact_name: Optional[str] = None,
        contact_title: Optional[str] = None,
    ) -> Prospect:
        """Create and save a new prospect."""
        prospect = Prospect(
            id=str(uuid.uuid4()),
            job_id=job_id,
            company_name=company_name,
            domain=domain,
            contact_name=contact_name,
            contact_title=contact_title,
        )
        db.add(prospect)
        db.commit()
        db.refresh(prospect)
        return prospect

    @staticmethod
    def get_by_id(db: Session, prospect_id: str) -> Optional[Prospect]:
        """Fetch a prospect by ID."""
        return db.query(Prospect).filter(Prospect.id == prospect_id).first()

    @staticmethod
    def get_by_job_id(db: Session, job_id: str) -> List[Prospect]:
        """Fetch all prospects for a given job."""
        return db.query(Prospect).filter(Prospect.job_id == job_id).all()

    @staticmethod
    def get_by_domain(db: Session, domain: str) -> Optional[Prospect]:
        """Fetch a prospect by domain (useful for deduplication)."""
        return db.query(Prospect).filter(Prospect.domain == domain).first()


class ResearchResultRepository:
    """Repository for ResearchResult CRUD operations."""

    @staticmethod
    def create(
        db: Session,
        prospect_id: str,
        snapshot: Dict[str, Any],
        trigger: Dict[str, Any],
        funding: Dict[str, Any],
        role_context: Dict[str, Any],
        draft: Dict[str, Any],
    ) -> ResearchResult:
        """Create and save a new research result."""
        result = ResearchResult(
            id=str(uuid.uuid4()),
            prospect_id=prospect_id,
            snapshot_summary=snapshot.get("summary"),
            snapshot_sources=snapshot.get("sources", []),
            trigger_event=trigger.get("event"),
            trigger_event_date=trigger.get("event_date"),
            trigger_event_type=trigger.get("event_type"),
            trigger_sources=trigger.get("sources", []),
            funding_signal=funding.get("signal"),
            funding_stage=funding.get("funding_stage"),
            headcount_range=funding.get("headcount_range"),
            funding_sources=funding.get("sources", []),
            role_context=role_context.get("insight"),
            role_context_sources=role_context.get("sources", []),
            draft_message=draft.get("draft"),
            draft_sources=draft.get("sources", []),
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result

    @staticmethod
    def get_by_id(db: Session, result_id: str) -> Optional[ResearchResult]:
        """Fetch a research result by ID."""
        return db.query(ResearchResult).filter(ResearchResult.id == result_id).first()

    @staticmethod
    def get_by_prospect_id(db: Session, prospect_id: str) -> Optional[ResearchResult]:
        """Fetch the most recent research result for a prospect."""
        return (
            db.query(ResearchResult)
            .filter(ResearchResult.prospect_id == prospect_id)
            .order_by(ResearchResult.created_at.desc())
            .first()
        )

    @staticmethod
    def get_by_job_id(db: Session, job_id: str) -> List[ResearchResult]:
        """Fetch all research results for a job (by joining to prospects)."""
        return (
            db.query(ResearchResult)
            .join(Prospect, ResearchResult.prospect_id == Prospect.id)
            .filter(Prospect.job_id == job_id)
            .order_by(ResearchResult.created_at)
            .all()
        )
