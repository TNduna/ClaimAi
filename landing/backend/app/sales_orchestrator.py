from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional

from app.data_fetchers import (
    CompanySnapshotFetcher,
    TriggerEventFetcher,
    FundingSizeFetcher,
    StubCompanySnapshotFetcher,
    StubTriggerEventFetcher,
    StubFundingSizeFetcher,
)


class SalesOrchestrator:
    def __init__(
        self,
        max_concurrency: int = 10,
        company_fetcher: Optional[CompanySnapshotFetcher] = None,
        trigger_fetcher: Optional[TriggerEventFetcher] = None,
        funding_fetcher: Optional[FundingSizeFetcher] = None,
    ) -> None:
        self.max_concurrency = max_concurrency
        self.company_fetcher = company_fetcher or StubCompanySnapshotFetcher()
        self.trigger_fetcher = trigger_fetcher or StubTriggerEventFetcher()
        self.funding_fetcher = funding_fetcher or StubFundingSizeFetcher()
        self.cache: Dict[str, Dict[str, Any]] = {}

    def normalize_prospects(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        for item in raw:
            company = (item.get("company") or "").strip()
            if not company:
                continue
            normalized.append(
                {
                    "company": company,
                    "domain": (item.get("domain") or "").strip() or None,
                    "contact_name": (item.get("contact_name") or "").strip() or None,
                    "title": (item.get("title") or "").strip() or None,
                }
            )
        return normalized

    def _cache_key(self, prospect: Dict[str, Any]) -> Optional[str]:
        domain = prospect.get("domain")
        if domain:
            return domain.lower()
        company = prospect.get("company", "").strip().lower()
        return company or None

    async def company_snapshot_node(self, prospect: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = self._cache_key(prospect)
        if cache_key and cache_key in self.cache:
            return self.cache[cache_key]["snapshot"]

        result = await self.company_fetcher.fetch(prospect["company"], prospect.get("domain"))
        if cache_key:
            self.cache[cache_key] = {"snapshot": result}
        return result

    async def trigger_event_node(self, prospect: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = self._cache_key(prospect)
        if cache_key and cache_key in self.cache:
            return self.cache[cache_key]["trigger"]

        result = await self.trigger_fetcher.fetch(prospect["company"], prospect.get("domain"))
        
        # If no event found, explicitly return the "not found" message
        if not result.get("event"):
            result["event"] = None
            result.setdefault("sources", [])
        
        if cache_key:
            self.cache[cache_key] = {**self.cache.get(cache_key, {}), "trigger": result}
        return result

    async def funding_size_node(self, prospect: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = self._cache_key(prospect)
        if cache_key and cache_key in self.cache:
            return self.cache[cache_key]["funding"]

        result = await self.funding_fetcher.fetch(prospect["company"], prospect.get("domain"))
        if cache_key:
            self.cache[cache_key] = {**self.cache.get(cache_key, {}), "funding": result}
        return result

    def role_context_node(self, prospect: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = self._cache_key(prospect)
        if cache_key and cache_key in self.cache:
            return self.cache[cache_key]["role_context"]

        title = prospect.get("title")
        if title:
            result = {
                "insight": f"A {title} is likely to care about efficiency, measurable ROI, and fewer manual tasks.",
                "sources": ["https://example.com/role-context"],
            }
        else:
            result = {
                "insight": "Role context could not be inferred without a contact title.",
                "sources": [],
            }
        if cache_key:
            self.cache[cache_key] = {**self.cache.get(cache_key, {}), "role_context": result}
        return result

    def join_node(self, prospect: Dict[str, Any], snapshot: Dict[str, Any], trigger: Dict[str, Any], funding: Dict[str, Any], role_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "company": prospect["company"],
            "domain": prospect.get("domain"),
            "snapshot": snapshot,
            "trigger": trigger,
            "funding": funding,
            "role_context": role_context,
        }

    def draft_node(self, prospect: Dict[str, Any], merged: Dict[str, Any]) -> Dict[str, Any]:
        trigger = merged["trigger"]
        
        # STRICT CITATION ENFORCEMENT: Only include a trigger if it has both event AND sources
        if trigger.get("event") and trigger.get("sources"):
            opening = f"I noticed {trigger['event']}"
            citation_sources = trigger.get("sources", [])
        else:
            # No trigger event with sources found — be honest and plain
            opening = "I wanted to reach out"
            citation_sources = []

        draft = (
            f"Hi {prospect.get('contact_name') or 'there'}, {opening}. I thought this could be relevant for {prospect['company']} and worth a short conversation."
        )
        return {"draft": draft, "sources": citation_sources}

    def aggregation_node(self, briefs: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "briefs": briefs,
            "summary": f"Prepared {len(briefs)} prospect brief(s) with source-backed findings where available.",
        }

    async def _process_prospect(self, prospect: Dict[str, Any], index: int, total: int, job: Dict[str, Any], report_progress, semaphore: asyncio.Semaphore) -> Dict[str, Any]:
        async with semaphore:
            await asyncio.sleep(0.2)
            await report_progress(f"Researching {index}/{total}: {prospect['company']}")

            snapshot = await self.company_snapshot_node(prospect)
            trigger = await self.trigger_event_node(prospect)
            funding = await self.funding_size_node(prospect)
            role_context = self.role_context_node(prospect)
            merged = self.join_node(prospect, snapshot, trigger, funding, role_context)
            draft = self.draft_node(prospect, merged)
            merged["draft"] = draft["draft"]
            merged["citation_sources"] = {
                "snapshot": snapshot.get("sources", []),
                "trigger": trigger.get("sources", []),
                "funding": funding.get("sources", []),
                "role_context": role_context.get("sources", []),
            }
            job["messages"].append({"type": "result", "result": merged})
            return merged

    async def run_research(self, prospects: List[Dict[str, Any]], job: Dict[str, Any], report_progress) -> None:
        job["status"] = "running"
        job["messages"] = []
        total = len(prospects)
        semaphore = asyncio.Semaphore(self.max_concurrency)

        tasks = [
            self._process_prospect(prospect, index, total, job, report_progress, semaphore)
            for index, prospect in enumerate(prospects, start=1)
        ]
        results = await asyncio.gather(*tasks)

        final_payload = self.aggregation_node(results)
        job["results"] = final_payload
        job["status"] = "completed"
        job["messages"].append({"type": "done", "message": "Research complete"})
