from __future__ import annotations

import asyncio
import json
import uuid
from typing import Any, Callable, Dict, List, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.sales_orchestrator import SalesOrchestrator
from app.config import Config
from app.data_fetchers import (
    NewsAPITriggerEventFetcher,
    CrunchbaseCompanyFetcher,
    CrunchbaseFundingSizeFetcher,
)
from app.database import init_db, get_db
from app.models import Prospect, ResearchResult
from app.repository import ProspectRepository, ResearchResultRepository


app = FastAPI(title="Sales Orchestration API", version="0.1.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "https://*.synth.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fetchers based on config
if Config.FETCHER_MODE == "newsapi+crunchbase":
    trigger_fetcher = NewsAPITriggerEventFetcher(api_key=Config.NEWSAPI_KEY)
    company_fetcher = CrunchbaseCompanyFetcher(api_key=Config.CRUNCHBASE_API_KEY)
    funding_fetcher = CrunchbaseFundingSizeFetcher(api_key=Config.CRUNCHBASE_API_KEY)
else:
    # Default: stub mode (no external API calls)
    trigger_fetcher = None
    company_fetcher = None
    funding_fetcher = None

orchestrator = SalesOrchestrator(
    max_concurrency=Config.MAX_CONCURRENCY,
    trigger_fetcher=trigger_fetcher,
    company_fetcher=company_fetcher,
    funding_fetcher=funding_fetcher,
)

# In-memory job tracking (can be moved to Redis for distributed deployments)
jobs: Dict[str, Dict[str, Any]] = {}


class ProspectPayload(BaseModel):
    company: str
    domain: Optional[str] = None
    contact_name: Optional[str] = None
    title: Optional[str] = None


class ResearchRequest(BaseModel):
    prospects: List[ProspectPayload]


async def run_sales_research(job_id: str, prospects: List[Dict[str, Any]], db: Session) -> None:
    job = jobs[job_id]

    async def report_progress(message: str) -> None:
        job["messages"].append({"type": "progress", "message": message})

    # Create prospect records in the database
    prospect_records = {}
    for prospect_data in prospects:
        prospect = ProspectRepository.create(
            db,
            job_id=job_id,
            company_name=prospect_data["company"],
            domain=prospect_data.get("domain"),
            contact_name=prospect_data.get("contact_name"),
            contact_title=prospect_data.get("title"),
        )
        prospect_records[prospect_data["company"]] = prospect

    # Run the orchestrator
    await orchestrator.run_research(prospects, job, report_progress)

    # Save research results to the database
    if "briefs" in job["results"]:
        for brief in job["results"]["briefs"]:
            company = brief["company"]
            prospect = prospect_records.get(company)
            if prospect:
                ResearchResultRepository.create(
                    db,
                    prospect_id=prospect.id,
                    snapshot=brief.get("snapshot", {}),
                    trigger=brief.get("trigger", {}),
                    funding=brief.get("funding", {}),
                    role_context=brief.get("role_context", {}),
                    draft={"draft": brief.get("draft"), "sources": brief.get("citation_sources", {}).get("trigger", [])},
                )


@app.post("/api/sales/research")
async def create_sales_research(payload: ResearchRequest, db: Session = Depends(get_db)):
    prospects = orchestrator.normalize_prospects([p.model_dump() for p in payload.prospects])
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "queued",
        "results": {},
        "messages": [],
        "prospects": prospects,
    }
    asyncio.create_task(run_sales_research(job_id, prospects, db))
    return {"job_id": job_id, "status": "queued", "count": len(prospects)}


@app.post("/api/sales/research/upload")
async def upload_sales_research(file: UploadFile = File(...), source: str = Form(default="csv"), db: Session = Depends(get_db)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    rows: List[Dict[str, Any]] = []
    if source.lower() == "csv":
        lines = [line for line in text.splitlines() if line.strip()]
        if lines:
            header = [h.strip().lower() for h in lines[0].split(",")]
            for line in lines[1:]:
                values = [v.strip() for v in line.split(",")]
                if len(values) < len(header):
                    values.extend([""] * (len(header) - len(values)))
                row = {header[i]: values[i] if i < len(values) else "" for i in range(len(header))}
                rows.append(row)
    else:
        rows = [{"company": line.strip()} for line in text.splitlines() if line.strip()]

    prospects = orchestrator.normalize_prospects(rows)
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "queued",
        "results": {},
        "messages": [],
        "prospects": prospects,
    }
    asyncio.create_task(run_sales_research(job_id, prospects, db))
    return {"job_id": job_id, "status": "queued", "count": len(prospects)}


@app.get("/api/sales/research/{job_id}/stream")
async def read_sales_research_stream(job_id: str):
    async def event_stream():
        while True:
            job = jobs.get(job_id)
            if not job:
                yield "event: error\ndata: job not found\n\n"
                break

            if job["messages"]:
                message = job["messages"].pop(0)
                payload = json.dumps(message)
                yield f"event: message\ndata: {payload}\n\n"

            if job["status"] in {"completed", "failed"} and not job["messages"]:
                break

            await asyncio.sleep(0.1)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/sales/research/{job_id}")
async def get_sales_research_result(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return {
        "job_id": job_id,
        "status": job["status"],
        "results": job["results"],
    }


@app.get("/health")
async def health():
    return {"status": "ok", "fetcher_mode": Config.FETCHER_MODE, "max_concurrency": Config.MAX_CONCURRENCY}


@app.on_event("startup")
async def startup():
    init_db()
    print(Config.describe())

