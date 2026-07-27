# Quick Start — Sales Research Tryout (Full Stack)

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- npm (for frontend dependencies)
- A terminal/command line

## 1. Set Up Backend

### Terminal 1: Backend
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Expected output:
```
Sales Orchestration Config:
  FETCHER_MODE: stub
  MAX_CONCURRENCY: 10
  CACHE_TTL_SECONDS: 86400
  NEWSAPI_KEY: not set
  CRUNCHBASE_API_KEY: not set
  APOLLO_API_KEY: not set

INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete
```

### Verify Backend is Running
```bash
curl http://localhost:8001/health
# Expected: {"status":"ok","fetcher_mode":"stub","max_concurrency":10}
```

## 2. Set Up Frontend

### Terminal 2: Frontend
```bash
# Install frontend dependencies (if not already done)
npm install

# Start Vite dev server
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 3. Access the App

1. Open browser to `http://localhost:5173`
2. Navigate to `/solutions/sales`
3. Scroll to **"Try it live"** section
4. Paste prospect names or upload CSV

## 4. Example Walkthrough

### Input
```
Acme Corp
TechFlow Inc
Global Industries
StartupX
```

### Expected Flow
1. Click "Research Prospects"
2. See 4 rows appear with status: "queued"
3. Watch each transition to "researching" (loading spinner)
4. See completed rows with green checkmark
5. Click ChevronDown on a row to expand and see:
   - Company snapshot
   - (Stub mode: no trigger event)
   - (Stub mode: no funding data)
   - Role context placeholder
   - Generated draft
   - "Copy Draft" button

### Rate Limiting
- First run: 4 prospects researched
- Show: "1 prospects remaining today"
- Try to submit 5 more: error "Rate limited: 1 prospects remaining..."
- Refresh page next day: counter resets to 5

## 5. Troubleshooting

### Backend Not Responding
```
Error: Connection to research engine lost
```
**Solution:** Check that backend is running on port 8001
```bash
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows
```

### CORS Error in Console
```
Access to XMLHttpRequest at 'http://localhost:8001/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```
**Solution:** Backend CORS middleware is configured. Ensure it's running with the correct origin:
```python
allow_origins=["http://localhost:5173", "http://localhost:5174"]
```

### EventSource Not Updating
```
No rows appear after clicking "Research Prospects"
```
**Solution:** 
1. Check browser DevTools > Network tab, look for `/stream` request
2. Should see status 200 and streaming events
3. If not, backend may not be receiving the initial POST request

### Rate Limit Not Resetting
```
Can't research any prospects
```
**Solution:** LocalStorage key includes date. Clear manually:
```javascript
// In browser console
localStorage.removeItem('synth_research_attempts_2026-07-15')
```

## 6. Next Steps (Wiring Real Fetchers)

To move from stub to real data:

### A. Get API Keys
- NewsAPI: https://newsapi.org/
- Crunchbase: https://www.crunchbase.com/page/api-documentation
- Apollo: https://www.apollo.io/ (optional)

### B. Update Environment
```bash
export NEWSAPI_KEY="your-key-here"
export CRUNCHBASE_API_KEY="your-key-here"
export FETCHER_MODE="newsapi+crunchbase"
```

### C. Populate Fetchers
Edit `backend/app/data_fetchers.py`:
- `NewsAPITriggerEventFetcher.fetch()` → Call NewsAPI with company name + date filter
- `CrunchbaseCompanyFetcher.fetch()` → Call Crunchbase API by domain
- `CrunchbaseFundingSizeFetcher.fetch()` → Extract funding round + headcount

### D. Restart Backend
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Data will now flow from real sources into the research results.

## 7. Customization

### Increase Rate Limit (For Testing)
Edit `src/components/sections/SalesResearchTryout.tsx`:
```typescript
const MAX_FREE_PROSPECTS = 50  // Changed from 5
```

### Change API Endpoint (For Production)
Edit `src/components/sections/SalesResearchTryout.tsx`:
```typescript
const API_BASE = process.env.REACT_APP_API_BASE || "http://api.synth.ai"
const response = await fetch(`${API_BASE}/api/sales/research`, ...)
```

### Adjust Concurrency
Edit `backend/app/config.py` or set environment variable:
```bash
export MAX_CONCURRENCY=20
```

## 8. File Structure

```
landing/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI + CORS + endpoints
│   │   ├── sales_orchestrator.py     # Core logic
│   │   ├── data_fetchers.py          # Data sources
│   │   ├── models.py                 # Database schemas
│   │   ├── database.py               # DB connection
│   │   ├── repository.py             # Data access
│   │   └── config.py                 # Configuration
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # Backend docs
├── src/
│   ├── pages/Sales.tsx               # Solution page (imports component)
│   └── components/sections/
│       └── SalesResearchTryout.tsx   # Interactive component (THIS ONE)
├── package.json                      # Frontend dependencies
└── FRONTEND_INTEGRATION.md           # Component documentation
```

## 9. Performance Notes

- **Stub mode:** ~200ms per prospect (synthetic delay)
- **Real mode:** Depends on API response times (typically 2-5s per prospect with news + funding)
- **Concurrency cap:** Default 10, adjust via `MAX_CONCURRENCY` env var
- **Stream latency:** SSE events emit as results complete, not batched

## 10. Database

By default, research results are saved to `synth_sales_research.db` (SQLite).

View results:
```python
from app.database import SessionLocal
from app.repository import ResearchResultRepository

db = SessionLocal()
results = ResearchResultRepository.get_by_job_id(db, job_id="<uuid>")
for r in results:
    print(f"{r.prospect.company_name}: {r.trigger_event}")
```

For production, switch to PostgreSQL:
```bash
export DATABASE_URL="postgresql://user:pass@localhost/synth_sales"
```
