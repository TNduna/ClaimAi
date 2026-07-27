# Sales Research Tryout — Frontend Integration

## Component Overview

`SalesResearchTryout` is a React component that provides a live, interactive research experience on the Sales solution page.

### Features

- **Input modes:** Paste company names or upload CSV
- **Live streaming:** SSE integration with backend for real-time progress
- **Expandable results table:** Click to reveal full brief, draft, and source links
- **Rate limiting:** 5 prospects free per day (localStorage-based, easy to upgrade)
- **Copy-to-clipboard:** Draft generation copies to clipboard with one click
- **Visual feedback:** Status badges (queued → researching → done)

## Architecture

### Component State

```typescript
interface Prospect {
  company: string
  domain?: string
  contact_name?: string
  title?: string
}

interface ResearchBrief {
  company: string
  snapshot?: { summary: string; sources: string[] }
  trigger?: { event?: string; sources: string[] }
  funding?: { signal?: string; sources: string[] }
  role_context?: { insight: string; sources: string[] }
  draft?: string
  citation_sources?: Record<string, string[]>
}

interface ResultRow {
  status: "queued" | "researching" | "done" | "error"
  brief?: ResearchBrief
}
```

### Rate Limiting

- **Key:** `synth_research_attempts_YYYY-MM-DD` (localStorage)
- **Limit:** 5 prospects per day (free tier)
- **Reset:** Daily at UTC midnight
- **Upgrade path:** Easy flag to remove/increase limit for authenticated users

```typescript
// Check if user can submit (blocking)
if (!checkRateLimit(prospects.length)) {
  // Show error message with remaining quota
}

// Record usage after successful submission
recordUsage(prospects.length)

// Get remaining quota for UI display
getRemainingQuota() // Returns 0-5
```

## Data Flow

### 1. User Submission
```
User fills textarea or uploads CSV
                ↓
         parseProspects() normalizes to array of {company, domain?, contact_name?, title?}
                ↓
         checkRateLimit() validates user hasn't exceeded 5 prospects
                ↓
         recordUsage() increments daily counter in localStorage
```

### 2. Backend Request
```
POST /api/sales/research { prospects: [...] }
                ↓
Backend returns { job_id, status: "queued", count: N }
                ↓
Frontend subscribes to EventSource(GET /api/sales/research/{job_id}/stream)
```

### 3. Live Streaming
```
EventSource stream emits three event types:
  - message(type: "progress") → Update status to "researching" for company
  - message(type: "result") → Populate full brief for company, status: "done"
  - message(type: "done") → Close event stream, set isRunning = false
                ↓
Results accumulate in state as they arrive
                ↓
Table re-renders with live updates
```

### 4. Expansion & Details
```
User clicks ChevronDown icon on a completed row
                ↓
Expanded row shows:
  - Company snapshot + sources
  - Trigger event + date + sources
  - Funding/size signal + sources
  - Role context + sources
  - Generated draft (in blue box)
  - "Copy Draft" button (clipboard API)
```

## Integration with Sales.tsx

The component is imported and included after `SolutionPageLayout`:

```typescript
export default function Sales() {
  return (
    <>
      <SolutionPageLayout {...props} />
      <SalesResearchTryout />
    </>
  )
}
```

The component renders full-width with its own padding and background.

## API Endpoints Required

The component expects the backend to be running on `http://localhost:8001`:

- `POST /api/sales/research` — Submit prospects
- `GET /api/sales/research/{job_id}/stream` — SSE stream
- CORS headers allowing `http://localhost:5173` and `http://localhost:5174`

### Localhost Assumptions

- Frontend: `http://localhost:5173` or `http://localhost:5174` (Vite dev server)
- Backend: `http://localhost:8001` (Uvicorn)

For production, update the hardcoded URLs in `SalesResearchTryout.tsx` to use environment variables or relative paths.

## Testing Locally

### Prerequisites

1. Backend running on port 8001:
   ```bash
   cd backend
   uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

2. Frontend running on port 5173 or 5174:
   ```bash
   npm run dev
   ```

### Manual Test Flow

1. Navigate to `/solutions/sales`
2. Scroll to "Try it live" section
3. Paste prospect names (e.g., "Acme Corp\nTechFlow Inc")
4. Click "Research Prospects"
5. Watch table populate with status updates
6. Click ChevronDown on completed rows to expand
7. Click "Copy Draft to Clipboard" to copy outreach message

### Edge Cases

- **No backend:** Error message shown: "Connection to research engine lost"
- **Rate limit exceeded:** Error shows remaining quota and upgrade CTA
- **Empty input:** "Please enter at least one prospect"
- **CSV parsing:** Expects columns: company, domain, contact_name, title (case-insensitive)

## Future Enhancements

### 1. Authentication
- Remove rate limit for authenticated users
- Show user's research history
- Save drafts to account

### 2. Backend URL Configuration
```typescript
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8001"
const stream_url = `${API_BASE}/api/sales/research/${job_id}/stream`
```

### 3. Error Recovery
- Retry failed research on individual prospects
- Resume interrupted streams

### 4. Export Options
- Download results as CSV
- Export drafts as email template
- Integrate with Salesforce/HubSpot

### 5. Analytics
- Track usage patterns
- A/B test different draft formats
- Monitor backend performance

## Component Code Structure

```
SalesResearchTryout.tsx
├── Rate limiting helpers (checkRateLimit, recordUsage, etc.)
├── Type definitions (Prospect, ResearchBrief, ResultRow)
├── Main component (SalesResearchTryout)
│   ├── Input section (tabs: paste vs. upload)
│   ├── Submit button (disabled during research)
│   ├── Results table
│   │   ├── Table header
│   │   ├── Body rows (status + company)
│   │   └── Expanded row details
│   └── Error message display
└── Styling (Tailwind classes)
```

## Styling Notes

- Uses Tailwind CSS classes (already configured in project)
- Responsive design (mobile-first)
- Icons from lucide-react (already in project)
- Consistent with existing Sales page aesthetic (gray/blue palette)
- Expandable rows use smooth transitions and hover states
