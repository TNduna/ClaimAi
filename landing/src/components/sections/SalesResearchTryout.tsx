import { useState, useRef } from "react"
import { ChevronDown, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react"

interface Prospect {
  company: string
  domain?: string
  contact_name?: string
  title?: string
}

interface ResearchBrief {
  company: string
  domain?: string
  snapshot?: { summary: string; sources: string[] }
  trigger?: { event?: string; event_date?: string; sources: string[] }
  funding?: { signal?: string; sources: string[] }
  role_context?: { insight: string; sources: string[] }
  draft?: string
  citation_sources?: Record<string, string[]>
}

interface ResultRow {
  status: "queued" | "researching" | "done" | "error"
  brief?: ResearchBrief
  error?: string
}

const RATE_LIMIT_KEY = "synth_research_attempts"
const MAX_FREE_PROSPECTS = 5

function getRateLimitKey(): string {
  const today = new Date().toISOString().split("T")[0]
  return `${RATE_LIMIT_KEY}_${today}`
}

function checkRateLimit(count: number): boolean {
  const key = getRateLimitKey()
  const stored = localStorage.getItem(key)
  const used = parseInt(stored || "0", 10)
  return used + count <= MAX_FREE_PROSPECTS
}

function recordUsage(count: number): void {
  const key = getRateLimitKey()
  const stored = localStorage.getItem(key)
  const used = parseInt(stored || "0", 10)
  localStorage.setItem(key, String(used + count))
}

function getRemainingQuota(): number {
  const key = getRateLimitKey()
  const stored = localStorage.getItem(key)
  const used = parseInt(stored || "0", 10)
  return Math.max(0, MAX_FREE_PROSPECTS - used)
}

export function SalesResearchTryout() {
  const [inputMode, setInputMode] = useState<"csv" | "textarea">("textarea")
  const [textInput, setTextInput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Record<string, ResultRow>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseProspects = (): Prospect[] => {
    if (inputMode === "textarea") {
      return textInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => ({ company: line }))
    }
    return []
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setTextInput(text)
      setInputMode("csv")
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    const prospects = parseProspects()
    if (prospects.length === 0) {
      setErrorMessage("Please enter at least one prospect")
      return
    }

    if (!checkRateLimit(prospects.length)) {
      setErrorMessage(
        `Rate limited: ${getRemainingQuota()} prospects remaining for today. Upgrade for unlimited access.`
      )
      return
    }

    setErrorMessage("")
    recordUsage(prospects.length)
    setIsRunning(true)

    // Initialize result rows
    const initialResults: Record<string, ResultRow> = {}
    prospects.forEach((p) => {
      initialResults[p.company] = { status: "queued" }
    })
    setResults(initialResults)

    try {
      // Submit research request
      const response = await fetch("http://localhost:8001/api/sales/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects }),
      })

      if (!response.ok) {
        throw new Error("Failed to start research")
      }

      const { job_id } = await response.json()

      // Subscribe to SSE stream
      const eventSource = new EventSource(
        `http://localhost:8001/api/sales/research/${job_id}/stream`
      )

      eventSource.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "progress") {
            // Update status to "researching" for the mentioned company
            setResults((prev) => ({
              ...prev,
              [data.message.split(": ")[1]?.split(" ")[0]]: {
                ...prev[data.message.split(": ")[1]?.split(" ")[0]],
                status: "researching",
              },
            }))
          } else if (data.type === "result") {
            // Update with completed result
            const company = data.result.company
            setResults((prev) => ({
              ...prev,
              [company]: {
                status: "done",
                brief: data.result,
              },
            }))
          } else if (data.type === "done") {
            eventSource.close()
            setIsRunning(false)
          }
        } catch (e) {
          console.error("Error parsing SSE message:", e)
        }
      })

      eventSource.onerror = () => {
        eventSource.close()
        setIsRunning(false)
        setErrorMessage("Connection to research engine lost")
      }
    } catch (err) {
      setIsRunning(false)
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred"
      )
    }
  }

  const toggleExpand = (company: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [company]: !prev[company],
    }))
  }

  const statusIcon = (status: ResultRow["status"]) => {
    switch (status) {
      case "queued":
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      case "researching":
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case "done":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-medium text-gray-900 mb-4">
            Try it live
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Upload a prospect list or paste company names. Synth will research each one and generate personalized outreach.
          </p>
          <p className="text-sm text-gray-500">
            <strong>{getRemainingQuota()} prospects</strong> remaining today (free tier)
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          {/* Mode Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMode("textarea")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                inputMode === "textarea"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Paste List
            </button>
            <button
              onClick={() => setInputMode("csv")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                inputMode === "csv"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upload CSV
            </button>
          </div>

          {/* Input Fields */}
          {inputMode === "textarea" ? (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Acme Corp&#10;TechFlow Inc&#10;Global Industries&#10;StartupX&#10;Innovation Labs"
              className="w-full h-40 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Click to upload CSV</p>
              <p className="text-sm text-gray-500">
                Expected columns: company, domain, contact_name, title
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="w-full mt-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              "Research Prospects"
            )}
          </button>
        </div>

        {/* Results Table */}
        {Object.keys(results).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900" />
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([company, row]) => (
                  <tbody key={company}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {company}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {statusIcon(row.status)}
                          <span className="text-sm text-gray-600 capitalize">
                            {row.status === "done" ? "Complete" : row.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.status === "done" && (
                          <button
                            onClick={() => toggleExpand(company)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform ${
                                expandedRows[company] ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows[company] && row.brief && (
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-6">
                          <div className="space-y-6">
                            {/* Snapshot */}
                            {row.brief.snapshot && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Company Overview
                                </h4>
                                <p className="text-sm text-gray-700 mb-2">
                                  {row.brief.snapshot.summary}
                                </p>
                                {row.brief.snapshot.sources?.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    {row.brief.snapshot.sources.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:underline"
                                      >
                                        Source: {url}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Trigger Event */}
                            {row.brief.trigger?.event && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Trigger Event
                                </h4>
                                <p className="text-sm text-gray-700 mb-2">
                                  {row.brief.trigger.event}
                                </p>
                                {row.brief.trigger.event_date && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    {row.brief.trigger.event_date}
                                  </p>
                                )}
                                {row.brief.trigger.sources?.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    {row.brief.trigger.sources.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:underline"
                                      >
                                        {url}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Funding */}
                            {row.brief.funding?.signal && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Funding & Size
                                </h4>
                                <p className="text-sm text-gray-700 mb-2">
                                  {row.brief.funding.signal}
                                </p>
                                {row.brief.funding.sources?.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    {row.brief.funding.sources.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:underline"
                                      >
                                        {url}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Draft Message */}
                            {row.brief.draft && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Suggested Outreach
                                </h4>
                                <p className="text-sm text-gray-700 italic">
                                  "{row.brief.draft}"
                                </p>
                                {row.brief?.citation_sources?.trigger && row.brief.citation_sources.trigger.length > 0 && (
                                  <p className="text-xs text-blue-600 mt-2">
                                    Based on: Trigger event research
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Copy Draft Button */}
                            {row.brief?.draft && (
                              <button
                                onClick={() => navigator.clipboard.writeText(row.brief?.draft || "")}
                                className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Copy Draft to Clipboard
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
