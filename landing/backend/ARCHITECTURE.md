# Backend Architecture

## File Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app, endpoints, orchestration kickoff
│   ├── config.py                  # Environment-based configuration
│   ├── sales_orchestrator.py      # Core orchestration logic (async fan-out, nodes, aggregation)
│   ├── data_fetchers.py           # Abstract fetcher interfaces + stub/real implementations
│   ├── models.py                  # SQLAlchemy ORM models (Prospect, ResearchResult)
│   ├── database.py                # Database engine, session factory, init function
│   └── repository.py              # Data access layer (CRUD operations)
├── requirements.txt               # Python dependencies
├── README.md                      # API reference, how to wire fetchers, running instructions
├── DATA_LAYER.md                  # Database schema, queries, environment setup
└── ARCHITECTURE.md                # This file
```

## Core Responsibilities

### `main.py`
- FastAPI application and endpoint definitions
- Job lifecycle management (in-memory dictionary)
- Request/response models (Pydantic)
- Database session dependency injection
- Orchestrator initialization based on config
- Startup sequence (database init, config logging)

### `config.py`
- Reads environment variables
- Stores configuration state (API keys, max concurrency, fetcher mode)
- Validation and introspection

### `sales_orchestrator.py`
- **Fan-out logic:** Bounded concurrency via `asyncio.Semaphore`
- **Pipeline nodes:**
  - `company_snapshot_node()` → Async call to company fetcher
  - `trigger_event_node()` → Async call to trigger fetcher
  - `funding_size_node()` → Async call to funding fetcher
  - `role_context_node()` → Heuristic (no async call)
  - `join_node()` → Merge four signals
  - `draft_node()` → Generate opening + message with strict citation enforcement
- **Aggregation:** Combine all results
- **Caching:** Domain-based deduplication across prospects in a batch
- **Async processing:** Each prospect runs concurrently up to `max_concurrency`

### `data_fetchers.py`
- Abstract base classes for each fetcher type
- **Stub implementations** (return empty/placeholder data) — for local testing
- **Real implementation skeletons** (with TODO comments):
  - `NewsAPITriggerEventFetcher` → Wire in NewsAPI calls
  - `CrunchbaseCompanyFetcher` → Wire in Crunchbase calls
  - `CrunchbaseFundingSizeFetcher` → Wire in Crunchbase calls

### `models.py`
- SQLAlchemy ORM definitions
- **Prospect:** company, domain, contact, job_id, timestamps
- **ResearchResult:** all signals + draft, linked to Prospect
- Helper methods for serialization (`.to_dict()`)

### `database.py`
- Database engine creation (SQLite by default, PostgreSQL configurable)
- Session factory
- `init_db()` — Create all tables on startup
- `get_db()` — Dependency for injecting sessions into endpoints

### `repository.py`
- Data access layer (repository pattern)
- **ProspectRepository:** CRUD for Prospect records
- **ResearchResultRepository:** CRUD for ResearchResult records
- Queries for common lookups (by job, by domain, by ID)

## Data Flow

### 1. Ingest
```
User submits prospects via POST /api/sales/research
                    ↓
         main.py creates Job record in memory
                    ↓
         Prospects are normalized
                    ↓
         run_sales_research() async task is spawned
```

### 2. Normalize & Persist
```
Async task acquires database session
                    ↓
         For each prospect, create Prospect record in DB
                    ↓
         Store prospect IDs for later linking
```

### 3. Research (Fan-out)
```
Orchestrator creates semaphore with max_concurrency
                    ↓
         For each prospect, spawn async _process_prospect() task
                    ↓
         Each task waits on semaphore (enforces concurrency cap)
                    ↓
         [Concurrently, up to max_concurrency:]
           - Fetch company snapshot (async)
           - Fetch trigger event (async)
           - Fetch funding/size (async)
           - Compute role context (sync heuristic)
           - Join results
           - Generate draft (with citation enforcement)
           - Append to job["messages"] for streaming
                    ↓
         All tasks complete
```

### 4. Persist Results
```
After orchestrator completes, for each brief in results:
                    ↓
         Look up the Prospect record by company name
                    ↓
         Create ResearchResult record linked to Prospect
                    ↓
         Save snapshot, trigger, funding, role context, draft
                    ↓
         Mark job as "completed"
```

### 5. Stream & Retrieve
```
Client subscribes to GET /api/sales/research/{job_id}/stream
                    ↓
         Event stream yields progress messages as they're appended
                    ↓
         When research completes, stream closes
                    ↓
         Client calls GET /api/sales/research/{job_id}
                    ↓
         Response includes all briefs with full data
                    ↓
         Data is also queryable from database for long-term audits
```

## Extension Points

### Add a new fetcher
1. Subclass `CompanySnapshotFetcher`, `TriggerEventFetcher`, or `FundingSizeFetcher`
2. Implement the `fetch()` method to call your data source
3. Return a dict with data + `sources` list
4. Pass instance to `SalesOrchestrator()` at init time

### Change database backend
1. Update `DATABASE_URL` environment variable
2. Database.py handles the switch transparently (SQLAlchemy abstraction)

### Add caching
1. Wrap fetcher calls in a TTL-based cache (Redis, in-memory dict)
2. Check cache before calling fetcher; store results with TTL

### Add rate limiting
1. Track API calls per fetcher
2. Fail gracefully or queue requests if quota is hit

### Persist job queue
1. Replace in-memory `jobs` dict with Redis or database
2. Allows distributed job tracking across multiple workers

## Testing

### Unit test orchestrator
```python
from app.sales_orchestrator import SalesOrchestrator
from app.data_fetchers import StubCompanySnapshotFetcher

orchestrator = SalesOrchestrator(
    company_fetcher=StubCompanySnapshotFetcher(),
)
# Test with mocked data
```

### Integration test with database
```python
from app.database import SessionLocal
from app.repository import ProspectRepository

db = SessionLocal()
prospect = ProspectRepository.create(db, "job-1", "Acme Corp", "acme.com")
assert prospect.id is not None
```

### End-to-end test with API
```bash
curl -X POST http://localhost:8001/api/sales/research \
  -H 'Content-Type: application/json' \
  -d '{
    "prospects": [
      {"company": "Acme Corp", "domain": "acme.com"}
    ]
  }'
```
