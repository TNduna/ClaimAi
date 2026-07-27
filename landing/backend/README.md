# Sales Orchestration Backend

## Overview

FastAPI-based sales research orchestrator for the Synth landing page. Accepts a prospect list, fans out concurrent research tasks, and streams live results with source-backed citations.

## Architecture

### Core Flow

1. **Input** → Normalize prospect list (company, domain, contact name, title)
2. **Fan-out** → Spawn up to `max_concurrency` (default: 10) concurrent subgraph tasks
3. **Per-prospect pipeline:**
   - **Company Snapshot** → Fetch what the company does (website scrape, API)
   - **Trigger Event** → Search news/press/filings for recent events (news API, 90-day window)
   - **Funding/Size** → Extract funding stage or headcount (Crunchbase, Apollo, etc.)
   - **Role Context** → Infer what a job title likely cares about (heuristic)
   - **Join** → Merge the four signals
   - **Draft** → Generate one outreach message per prospect, opening with trigger (if sourced)
   - **Citation Enforcement** → No claim without a source URL
4. **Stream** → Emit progress + results as they complete (SSE)
5. **Aggregation** → Final payload with all briefs

## API Endpoints

### `POST /api/sales/research`

Submit a structured prospect list for research.

**Request:**
```json
{
  "prospects": [
    {
      "company": "Acme Corp",
      "domain": "acme.com",
      "contact_name": "John Smith",
      "title": "VP Sales"
    }
  ]
}
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "count": 1
}
```

### `GET /api/sales/research/{job_id}/stream`

Subscribe to live SSE stream of progress and results.

**Event types:**
- `message` with `type: "progress"` → Research in progress
- `message` with `type: "result"` → Completed prospect brief
- `message` with `type: "done"` → Research complete

**Example result:**
```json
{
  "company": "Acme Corp",
  "domain": "acme.com",
  "snapshot": {
    "summary": "Acme Corp manufactures widgets...",
    "industry": "Manufacturing",
    "website_url": "acme.com",
    "sources": ["https://acme.com", "https://crunchbase.com/acme"]
  },
  "trigger": {
    "event": "Raised $50M Series B",
    "event_date": "2025-06-15",
    "event_type": "funding",
    "sources": ["https://techcrunch.com/2025/06/15/acme-series-b"]
  },
  "funding": {
    "signal": "Series B",
    "funding_stage": "Series B",
    "headcount_range": "100-200",
    "sources": ["https://crunchbase.com/acme"]
  },
  "role_context": {
    "insight": "A VP Sales is likely to care about efficiency, measurable ROI, and fewer manual tasks.",
    "sources": ["https://example.com/role-context"]
  },
  "draft": "Hi John Smith, I noticed Acme Corp raised $50M Series B. I thought this could be relevant and worth a short conversation.",
  "citation_sources": {
    "snapshot": ["https://acme.com"],
    "trigger": ["https://techcrunch.com/2025/06/15/acme-series-b"],
    "funding": ["https://crunchbase.com/acme"],
    "role_context": []
  }
}
```

### `GET /api/sales/research/{job_id}`

Fetch the completed result set.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "results": {
    "briefs": [
      { ...prospect brief... }
    ],
    "summary": "Prepared 1 prospect brief(s) with source-backed findings where available."
  }
}
```

### `POST /api/sales/research/upload`

Upload a CSV or pasted text of prospects.

**Request (multipart/form-data):**
- `file`: CSV or text file
- `source`: "csv" (default) or "text"

**Response:** Same as `POST /api/sales/research`

## Data Fetchers

### Architecture

The orchestrator uses pluggable **fetcher** objects that implement abstract base classes:

- `CompanySnapshotFetcher` → Fetch company profile
- `TriggerEventFetcher` → Search for recent news/events
- `FundingSizeFetcher` → Extract funding/headcount

Each fetcher returns a dict with:
- **Data fields** (specific to the fetcher)
- **`sources`** (list of URLs that back the claim)

### Stub Implementations

All three have stub implementations that return empty/placeholder results:
- `StubCompanySnapshotFetcher`
- `StubTriggerEventFetcher`
- `StubFundingSizeFetcher`

These are the defaults and ensure the orchestrator runs end-to-end without external APIs.

### Real Implementations (Skeleton)

Skeleton classes are provided; populate the `fetch()` methods:

#### `NewsAPITriggerEventFetcher`

Calls [NewsAPI](https://newsapi.org/) to find recent articles about companies.

**TODO:**
1. Set `NEWSAPI_KEY` environment variable
2. Query NewsAPI with company name + date filter (last 90 days)
3. Parse results for funding rounds, leadership changes, product launches
4. Return event + event_date + sources list

**Example:**
```python
from app.data_fetchers import NewsAPITriggerEventFetcher
fetcher = NewsAPITriggerEventFetcher(api_key="your-newsapi-key")
result = await fetcher.fetch("Acme Corp", "acme.com")
# Returns: {"event": "Raised $50M Series B", "event_date": "2025-06-15", "sources": [...]}
```

#### `CrunchbaseCompanyFetcher`

Calls [Crunchbase API](https://www.crunchbase.com/page/api-documentation) for company profiles.

**TODO:**
1. Set `CRUNCHBASE_API_KEY` environment variable
2. Query by domain or company name
3. Extract description, industry, website, last funding date
4. Return summary + sources

#### `CrunchbaseFundingSizeFetcher`

Calls [Crunchbase API](https://www.crunchbase.com/page/api-documentation) for funding details.

**TODO:**
1. Set `CRUNCHBASE_API_KEY` environment variable
2. Query company profile
3. Extract last funding round, total funded, headcount
4. Return signal + sources

### Wiring Custom Fetchers

Pass fetchers to the orchestrator at init time:

```python
from app.sales_orchestrator import SalesOrchestrator
from app.data_fetchers import NewsAPITriggerEventFetcher, CrunchbaseCompanyFetcher

orchestrator = SalesOrchestrator(
    company_fetcher=CrunchbaseCompanyFetcher(api_key="your-key"),
    trigger_fetcher=NewsAPITriggerEventFetcher(api_key="your-key"),
    max_concurrency=15,
)
```

## Citation Enforcement

**Rule:** No factual claim can appear in the draft without a corresponding source URL.

**Implementation:**
- Each node returns `sources: List[str]`
- `draft_node` checks: `if trigger.get("event") and trigger.get("sources")`
- If no trigger event with sources, the opener is neutral: `"I wanted to reach out"`
- All claims in `citation_sources` are included in the result for transparency

**Result:** The draft is only as strong as the research backing it. Empty signals don't get invented.

## Concurrency Control

- Max concurrent prospects: configurable (default: 10–15)
- Implemented via `asyncio.Semaphore(max_concurrency)`
- Each prospect task acquires the semaphore before starting research
- Capped at 15 to avoid overwhelming external APIs

## Running Locally

### Install

```bash
cd backend
pip install -r requirements.txt
```

### Start

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### Test

```bash
# Stream results for a single prospect
curl -N 'http://localhost:8001/api/sales/research/stream' \
  -H 'Content-Type: application/json' \
  -d '{"prospects": [{"company": "Acme Corp", "domain": "acme.com"}]}' \
  -X POST
```

## Next Steps

1. **Wire in real fetchers** — Populate `NewsAPITriggerEventFetcher.fetch()`, `CrunchbaseCompanyFetcher.fetch()`, etc.
2. **Add error handling** — Wrap API calls with retry logic and graceful fallbacks
3. **Add caching layer** — Cache API responses by domain for 24 hours
4. **Rate limiting** — Respect API quotas when fanning out
5. **React frontend** — Build a UI to submit prospect lists and display live results
