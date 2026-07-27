# System Architecture — Sales Research Orchestration

## High-Level Overview

```
┌─────────────────┐                    ┌──────────────────┐
│   React App     │                    │   FastAPI        │
│  (localhost     │◄──── POST /api/sales/research ────┤  Backend        │
│   5173)         │                    │  (localhost      │
│                 │                    │   8001)          │
├─────────────────┤                    ├──────────────────┤
│ SalesResearch   │                    │ app.main         │
│ Tryout          │───── SSE Event ──►│ Orchestrator     │
│ Component       │     Stream         │ Sales Database   │
└─────────────────┘                    └──────────────────┘
        │                                      │
        │                                      ▼
        │                           ┌──────────────────┐
        │                           │ External APIs    │
        │                           ├──────────────────┤
        │                           │ • NewsAPI        │
        │                           │ • Crunchbase     │
        └──────────────────────────►│ • Apollo         │
     localStorage (rate limit)      └──────────────────┘
     Copy-to-clipboard
```

## Layer Breakdown

### 1. Frontend (React/TypeScript)

**Location:** `src/components/sections/SalesResearchTryout.tsx`

**Responsibilities:**
- Accept user input (CSV upload or textarea)
- Submit prospects to backend
- Subscribe to SSE stream for live results
- Render results table with expandable rows
- Enforce rate limiting (localStorage-based)
- Copy-to-clipboard functionality

**Technologies:**
- React Hooks (useState, useRef)
- EventSource API (browser SSE client)
- Fetch API
- Tailwind CSS
- lucide-react icons

**State Management:**
```typescript
- inputMode: "csv" | "textarea"
- textInput: string (raw CSV/list)
- isRunning: boolean (during research)
- results: Record<string, ResultRow> (keyed by company name)
- expandedRows: Record<string, boolean> (which rows are expanded)
- errorMessage: string (validation/API errors)
```

### 2. Backend API (FastAPI)

**Location:** `backend/app/main.py`

**Endpoints:**
- `POST /api/sales/research` — Submit structured prospect list
- `POST /api/sales/research/upload` — Upload CSV file
- `GET /api/sales/research/{job_id}/stream` — SSE stream of results
- `GET /api/sales/research/{job_id}` — Fetch completed job
- `GET /health` — Health check

**Middleware:**
- CORS (allows localhost:5173, localhost:5174)

**Responsibilities:**
- Validate prospect input
- Create job record (in-memory)
- Spawn async research tasks
- Return job_id immediately (non-blocking)
- Stream results as they complete

**Technologies:**
- FastAPI (async web framework)
- Pydantic (request/response models)
- StreamingResponse (SSE)
- asyncio (concurrency)

### 3. Orchestration Engine (Core Logic)

**Location:** `backend/app/sales_orchestrator.py`

**Responsibilities:**
- Fan-out concurrent research tasks (capped at 10-15)
- Normalize prospect data
- Execute research pipeline per prospect:
  1. Fetch company snapshot (async)
  2. Search for trigger events (async)
  3. Fetch funding/size info (async)
  4. Infer role context (sync heuristic)
  5. Join signals into brief
  6. Generate draft with citation enforcement
- Aggregate results
- Cache results by domain (deduplication)

**Pipeline:**
```
Prospect Input
    ↓
[Async Semaphore: max_concurrency=10]
    ↓
┌─ Per Prospect ─────────────────────┐
│                                    │
│  company_snapshot_node()           │ (fetch company profile)
│  trigger_event_node()              │ (search recent news)
│  funding_size_node()               │ (pull funding/headcount)
│  role_context_node()               │ (heuristic)
│  join_node()                        │ (merge)
│  draft_node()                       │ (generate + enforce citations)
│                                    │
└────────────────────────────────────┘
    ↓
aggregation_node()  (collect all briefs)
    ↓
Results + Citations
```

**Citation Enforcement Rule:**
- No claim (trigger event, funding, etc.) appears in draft without sources
- If no sources, opener is neutral: "I wanted to reach out"
- All claims tracked in `citation_sources` dict

### 4. Data Fetchers (Pluggable Sources)

**Location:** `backend/app/data_fetchers.py`

**Abstract Interfaces:**
- `CompanySnapshotFetcher` → What does company do?
- `TriggerEventFetcher` → Recent news/funding/changes (90 days)
- `FundingSizeFetcher` → Funding stage + headcount

**Implementations:**
- `StubXxxFetcher` — Placeholder (returns empty/fake data)
- `CrunchbaseXxxFetcher` — Real Crunchbase API
- `NewsAPITriggerEventFetcher` — Real news API

**Contract (each fetcher returns):**
```python
{
  "summary/event/signal": str or None,
  "sources": [str, str, ...],  # URLs backing the claim
  # other fields specific to fetcher
}
```

### 5. Data Persistence (Database)

**Location:** `backend/app/models.py`, `database.py`, `repository.py`

**Tables:**
- `prospects` — Company name, domain, contact, source job_id
- `research_results` — All signals (snapshot, trigger, funding, role, draft) + sources + timestamp

**ORM:** SQLAlchemy

**Storage:** SQLite (local dev) or PostgreSQL (production)

**Repository Pattern:**
- `ProspectRepository` — CRUD for prospects
- `ResearchResultRepository` — CRUD for results
- Automatic relationships via foreign keys

### 6. Configuration Management

**Location:** `backend/app/config.py`

**Environment Variables:**
- `DATABASE_URL` — Database connection string
- `FETCHER_MODE` — "stub" or "newsapi+crunchbase"
- `NEWSAPI_KEY`, `CRUNCHBASE_API_KEY` — API credentials
- `MAX_CONCURRENCY` — Bounded concurrency (default: 10)
- `CACHE_TTL_SECONDS` — Cache expiry (default: 24h)

**Validation:**
```python
Config.validate()  # Raises if required keys are missing
Config.describe()  # Logs configuration on startup
```

## Request/Response Flow

### 1. User Submits Prospects
```
Frontend: POST /api/sales/research
{
  "prospects": [
    {"company": "Acme Corp", "domain": "acme.com", "contact_name": "John", "title": "VP Sales"},
    ...
  ]
}

Backend: 200 OK
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "count": 5
}
```

### 2. Frontend Subscribes to Stream
```
EventSource(GET /api/sales/research/{job_id}/stream)

Incoming events:
  event: message
  data: {"type": "progress", "message": "Researching 1/5: Acme Corp"}
  
  event: message
  data: {"type": "result", "result": {...full brief...}}
  
  event: message
  data: {"type": "done", "message": "Research complete"}
```

### 3. Results Saved to Database
```
After orchestrator completes:

1. For each brief, insert Prospect record (if new)
2. For each brief, insert ResearchResult record
3. ResearchResult.prospect_id links to Prospect
4. ResearchResult includes all signals + citation_sources
```

## Data Model

### Prospect Record
```
id: UUID
job_id: UUID (source research job)
company_name: string
domain: string (nullable)
contact_name: string (nullable)
contact_title: string (nullable)
created_at: timestamp
updated_at: timestamp
```

### ResearchResult Record
```
id: UUID
prospect_id: UUID (FK to Prospect)

// Snapshot
snapshot_summary: text
snapshot_sources: JSON array

// Trigger Event
trigger_event: text (nullable)
trigger_event_date: string ISO (nullable)
trigger_event_type: string (nullable)
trigger_sources: JSON array

// Funding
funding_signal: text (nullable)
funding_stage: string (nullable)
headcount_range: string (nullable)
funding_sources: JSON array

// Role Context
role_context: text
role_context_sources: JSON array

// Draft
draft_message: text
draft_sources: JSON array

timestamp: timestamp (research completion)
created_at: timestamp
```

## Caching & Deduplication

**Domain-based caching** (in-memory, per orchestrator instance):
```
cache = {
  "acme.com": {
    "snapshot": {...},
    "trigger": {...},
    "funding": {...},
    "role_context": {...}
  }
}
```

**Usage:**
- First prospect with acme.com: fetch all signals
- Second prospect with acme.com: reuse cached signals
- Result: 4 API calls saved per duplicate

**Benefit:** 
- Reduces external API load
- Faster research for duplicate companies
- Maintains full citation traceability (each result still gets sources)

## Rate Limiting (Frontend)

**Mechanism:** localStorage key with daily timestamp
```
"synth_research_attempts_2026-07-15": "4" (number of prospects researched)
```

**Logic:**
```
if (used + new_count > MAX_FREE_PROSPECTS) {
  reject with "Rate limited"
}
recordUsage(new_count)
```

**Advantages:**
- Client-side, no backend call needed
- Transparent to user (shows remaining quota)
- Easy to upgrade: just remove/bypass check for authenticated users
- Daily reset: key changes at UTC midnight

## Extension Points

### 1. Add Custom Data Fetcher
```python
class MyCompanyFetcher(CompanySnapshotFetcher):
    async def fetch(self, company, domain):
        # Call your data source
        return {
            "summary": "...",
            "industry": "...",
            "sources": ["https://..."]
        }

orchestrator = SalesOrchestrator(
    company_fetcher=MyCompanyFetcher()
)
```

### 2. Add Custom Analytics
```python
# In orchestrator, after draft_node
analytics.log("draft_generated", {
    "company": company,
    "trigger_found": bool(trigger),
    "draft_length": len(draft)
})
```

### 3. Switch Database Backend
```bash
export DATABASE_URL="postgresql://user:pass@localhost/synth"
```
SQLAlchemy handles it transparently.

### 4. Add Queue Persistence
Replace in-memory `jobs` dict with Redis:
```python
jobs[job_id] = await redis.hgetall(f"job:{job_id}")
```

## Performance Characteristics

### Stub Mode (Local Testing)
- Per prospect: ~200-300ms (includes 200ms synthetic delay)
- 5 prospects, max_concurrency=10: ~1-1.5s total
- Bottleneck: Sequential API calls inside each prospect task

### Real Mode (With APIs)
- NewsAPI: ~500-1000ms
- Crunchbase: ~1000-2000ms
- Total per prospect: ~2-3s (parallelized)
- 5 prospects at 10 concurrency: ~1-2s total (mostly parallelized)
- Bottleneck: External API response times

### Database Writes
- Prospect record: ~5-10ms
- ResearchResult record: ~5-10ms
- Batch of 5: ~50-100ms total

## Deployment (Future)

### Development
- Frontend: `npm run dev` on localhost:5173
- Backend: `uvicorn ... --reload` on localhost:8001
- Database: SQLite (synth_sales_research.db)

### Production
- Frontend: Deploy to Netlify/Vercel
- Backend: Deploy to Heroku/AWS Lambda/Railway
- Database: PostgreSQL on AWS RDS or managed service
- APIs: Upgrade credentials, set rate limits at provider level
- Rate limiting: Move to Redis or API gateway

### Key Production Changes
1. Update `API_BASE` in frontend to production backend domain
2. Set `DATABASE_URL` to PostgreSQL
3. Set `FETCHER_MODE` to "newsapi+crunchbase"
4. Set all API keys as secrets
5. Add authentication + session management
6. Move rate limiting to backend (authenticated users tracked)
7. Add observability (logging, tracing, metrics)
