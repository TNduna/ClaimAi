from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class CompanySnapshotFetcher(ABC):
    """Fetches a company's basic profile and what they do."""

    @abstractmethod
    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns a dict with:
        - summary: str (what the company does)
        - industry: Optional[str]
        - website_url: Optional[str]
        - sources: List[str] (URLs that back the claim)
        """
        pass


class TriggerEventFetcher(ABC):
    """Searches for recent trigger events (news, funding, leadership changes) from the last ~90 days."""

    @abstractmethod
    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns a dict with:
        - event: str ("No recent trigger event found..." or the actual event)
        - event_date: Optional[str] (ISO date)
        - event_type: Optional[str] (e.g., "funding", "leadership", "expansion", "launch")
        - sources: List[str] (URLs to news articles, press releases, etc.)
        """
        pass


class FundingSizeFetcher(ABC):
    """Fetches funding stage, headcount, or other size signals."""

    @abstractmethod
    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns a dict with:
        - signal: str (e.g., "Series B", "500-1000 employees", or "signal unavailable")
        - funding_stage: Optional[str]
        - headcount_range: Optional[str]
        - sources: List[str]
        """
        pass


class StubCompanySnapshotFetcher(CompanySnapshotFetcher):
    """Placeholder implementation."""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        return {
            "summary": f"{company} appears to operate in a growth-oriented market and likely has a need for sales enablement and workflow automation.",
            "industry": None,
            "website_url": domain,
            "sources": [],
        }


class StubTriggerEventFetcher(TriggerEventFetcher):
    """Placeholder implementation — returns empty trigger."""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        return {
            "event": None,
            "event_date": None,
            "event_type": None,
            "sources": [],
        }


class StubFundingSizeFetcher(FundingSizeFetcher):
    """Placeholder implementation."""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        return {
            "signal": None,
            "funding_stage": None,
            "headcount_range": None,
            "sources": [],
        }


class NewsAPITriggerEventFetcher(TriggerEventFetcher):
    """Real implementation using NewsAPI.

    TODO: Set NEWSAPI_KEY environment variable.
    TODO: Replace stub with real implementation.
    """

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or ""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls NewsAPI to search for recent news about the company.
        
        Expected workflow:
        1. Query NewsAPI with company name and date filter (last 90 days)
        2. Parse results for funding rounds, leadership changes, expansion announcements
        3. Return the most recent / most relevant event with a source URL
        4. If no results, return event=None with empty sources
        """
        # Placeholder: wire in the real call
        return {
            "event": None,
            "event_date": None,
            "event_type": None,
            "sources": [],
        }


class CrunchbaseCompanyFetcher(CompanySnapshotFetcher):
    """Real implementation using Crunchbase API.

    TODO: Set CRUNCHBASE_API_KEY environment variable.
    TODO: Replace stub with real implementation.
    """

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or ""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls Crunchbase API to fetch company profile.
        
        Expected workflow:
        1. Query Crunchbase by domain or company name
        2. Extract: description, industry, website, headcount, last funding date
        3. Return summary + any available metadata
        """
        # Placeholder: wire in the real call
        return {
            "summary": f"{company} profile from Crunchbase",
            "industry": None,
            "website_url": domain,
            "sources": [],
        }


class CrunchbaseFundingSizeFetcher(FundingSizeFetcher):
    """Real implementation using Crunchbase API.

    TODO: Set CRUNCHBASE_API_KEY environment variable.
    TODO: Replace stub with real implementation.
    """

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or ""

    async def fetch(self, company: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls Crunchbase API to fetch funding and headcount info.
        
        Expected workflow:
        1. Query Crunchbase company profile
        2. Extract: last funding stage, total funded amount, headcount
        3. Return the most recent / most relevant signal with a source URL
        """
        # Placeholder: wire in the real call
        return {
            "signal": None,
            "funding_stage": None,
            "headcount_range": None,
            "sources": [],
        }
