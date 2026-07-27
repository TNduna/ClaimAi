# Data Layer

## Schema Overview

Two main tables persist all research data:

### `prospects`
Stores prospect metadata and sourcing information.

| Column | Type | Notes |
|--------|------|-------|
| id | String(36) | UUID primary key |
| job_id | String(36) | Source job/list ID (foreign key to orchestration run) |
| company_name | String(255) | Company name (indexed) |
| domain | String(255) | Company domain/website (indexed, nullable) |
| contact_name | String(255) | Contact person name (nullable) |
| contact_title | String(255) | Contact job title (nullable) |
| created_at | DateTime | Record creation timestamp (indexed) |
| updated_at | DateTime | Record update timestamp |

**Indexes:**
- `job_id` — Fast lookup of all prospects in a job
- `company_name` — Fast lookup of company by name
- `domain` — Fast lookup of company by domain (for deduplication)
- `created_at` — Time-series queries

### `research_results`
Stores all research signals and the generated draft per prospect.

| Column | Type | Notes |
|--------|------|-------|
| id | String(36) | UUID primary key |
| prospect_id | String(36) | Foreign key to Prospect |
| **Snapshot** | | Company profile |
| snapshot_summary | Text | What the company does |
| snapshot_sources | JSON | List of URLs backing snapshot |
| **Trigger Event** | | Recent news/funding/changes |
| trigger_event | Text | Event description (nullable) |
| trigger_event_date | String(20) | ISO date (nullable) |
| trigger_event_type | String(50) | funding, leadership, expansion, launch (nullable) |
| trigger_sources | JSON | List of URLs with trigger event |
| **Funding/Size** | | Funding stage and headcount |
| funding_signal | Text | Human-readable signal |
| funding_stage | String(50) | Series A, Series B, etc. (nullable) |
| headcount_range | String(50) | e.g., "100-500" (nullable) |
| funding_sources | JSON | List of URLs backing funding info |
| **Role Context** | | Inferred role insight |
| role_context | Text | Insight about what role cares about |
| role_context_sources | JSON | List of URLs (usually empty for heuristic) |
| **Draft** | | Generated outreach message |
| draft_message | Text | The email/message draft |
| draft_sources | JSON | List of URLs backing the draft |
| **Metadata** | | |
| timestamp | DateTime | Research completion time (indexed) |
| created_at | DateTime | Record creation time |

**Indexes:**
- `prospect_id` — Fast lookup of results for a prospect
- `timestamp` — Time-series queries

## Queries

### Get all prospects for a job
```python
from app.repository import ProspectRepository
from app.database import SessionLocal

db = SessionLocal()
prospects = ProspectRepository.get_by_job_id(db, job_id="550e8400-e29b-41d4-a716-446655440000")
for p in prospects:
    print(f"{p.company_name} ({p.domain})")
```

### Get research results for a prospect
```python
from app.repository import ResearchResultRepository

result = ResearchResultRepository.get_by_prospect_id(db, prospect_id="...")
if result:
    print(f"Trigger: {result.trigger_event}")
    print(f"Funding: {result.funding_signal}")
    print(f"Draft: {result.draft_message}")
    print(f"Draft sources: {result.draft_sources}")
```

### Get all results for a job
```python
results = ResearchResultRepository.get_by_job_id(db, job_id="...")
for result in results:
    prospect = result.prospect
    print(f"{prospect.company_name}: {result.trigger_event or 'no trigger'}")
```

### Find prospect by domain (deduplication)
```python
existing = ProspectRepository.get_by_domain(db, domain="acme.com")
if existing:
    print(f"Already researched: {existing.company_name}")
else:
    print("New prospect")
```

### Query by raw SQL (if needed)
```python
from sqlalchemy import text

# Get all prospects with no results yet
results = db.execute(text("""
    SELECT p.* FROM prospects p
    LEFT JOIN research_results r ON p.id = r.prospect_id
    WHERE r.id IS NULL
"""))
```

## Environment Setup

### SQLite (default)
No configuration needed. Database is created at `synth_sales_research.db` in the working directory.

### PostgreSQL
Set `DATABASE_URL`:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/synth_sales"
```

### Enable SQL Echo
To log all SQL queries:
```bash
export SQL_ECHO="true"
```

## Migrations

Currently, the database schema is created automatically on startup via `init_db()`:
```python
from app.database import init_db
init_db()
```

For production with schema changes, set up Alembic migrations:
```bash
alembic init migrations
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

## Persistence Guarantees

- **Prospects:** Created atomically when a job is submitted
- **Results:** Saved atomically per prospect after research completes
- **Rollback:** If orchestrator fails mid-research, the prospect record exists but has no result record
- **Deduplication:** Query by domain before creating a new prospect to avoid duplicates

## Performance Notes

- **Indexes:** All foreign keys, job_id, domain, and timestamp columns are indexed
- **JSON fields:** `sources` arrays are stored as native JSON for efficient querying
- **Batch ops:** Use SQLAlchemy's `bulk_insert_mappings()` for inserting 100+ records at once
- **Connection pooling:** FastAPI + SQLAlchemy handles pooling automatically
