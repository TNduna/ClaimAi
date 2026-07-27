import { useState } from "react"

// ─── types ────────────────────────────────────────────────────────────────────
interface ComparisonRow {
  category: string
  feature: string
  openclaw: { value: string; supported: "yes" | "no" | "partial" }
  synth:  { value: string; supported: "yes" | "no" | "partial" }
}

// ─── comparison data ──────────────────────────────────────────────────────────
const comparisonRows: ComparisonRow[] = [
  // ── Architecture Philosophy ──
  {
    category: "Architecture Philosophy",
    feature: "Core concept",
    openclaw: { value: "A personal, always-on AI assistant that monitors systems and alerts you", supported: "yes" },
    synth:  { value: "An autonomous employee that executes complex, multi-step enterprise workflows across apps", supported: "yes" },
  },
  {
    category: "Architecture Philosophy",
    feature: "Primary loop",
    openclaw: { value: "Heartbeat → probe → policy → escalate → notify", supported: "yes" },
    synth:  { value: "Heartbeat → probe → policy → escalate → execute full agent task (plan, use tools, verify, deliver)", supported: "yes" },
  },
  {
    category: "Architecture Philosophy",
    feature: "Execution depth",
    openclaw: { value: "Notifies a human; does not autonomously complete end-to-end business tasks", supported: "no" },
    synth:  { value: "End-to-end execution: plans, calls tools (browser, desktop, WhatsApp, APIs), verifies output, and delivers a finished result", supported: "yes" },
  },
  {
    category: "Architecture Philosophy",
    feature: "Multi-agent orchestration",
    openclaw: { value: "Single-agent, user-centred", supported: "no" },
    synth:  { value: "Multi-agent orchestration (Planner-Executor-Verifier, plus specialised sub-agents)", supported: "yes" },
  },
  // ── Target Users ──
  {
    category: "Target Users",
    feature: "Primary user",
    openclaw: { value: "Technical individuals (developers, hobbyists) comfortable configuring servers, YAML, and API keys", supported: "yes" },
    synth:  { value: "Business professionals in regulated enterprises—lawyers, healthcare administrators, procurement officers—who never touch a terminal", supported: "yes" },
  },
  {
    category: "Target Users",
    feature: "Buyer",
    openclaw: { value: "The user themselves (free, self-hosted)", supported: "yes" },
    synth:  { value: "The enterprise (paid subscription, with compliance and support)", supported: "yes" },
  },
  {
    category: "Target Users",
    feature: "User experience",
    openclaw: { value: "CLI, config files, and a multi-messenger chat interface", supported: "yes" },
    synth:  { value: "Clean dashboard with task submission, live streaming, heartbeat configuration, memory explorer, and cost dashboards", supported: "yes" },
  },
  // ── Proactive Heartbeat ──
  {
    category: "Proactive Heartbeat",
    feature: "Scheduler",
    openclaw: { value: "Configurable intervals and active hours", supported: "yes" },
    synth:  { value: "Same, plus per-user scheduling (e.g., each lawyer sets their own morning briefing time)", supported: "yes" },
  },
  {
    category: "Proactive Heartbeat",
    feature: "Deterministic probes",
    openclaw: { value: "HTTP, file-system, shell commands", supported: "yes" },
    synth:  { value: "Same, plus queue depth, API status, database checks; extensible probe registry", supported: "yes" },
  },
  {
    category: "Proactive Heartbeat",
    feature: "Policy engine",
    openclaw: { value: "YAML-based rules; deterministic evaluation", supported: "yes" },
    synth:  { value: "Same, plus integration with an Authorised Actions policy that governs what the agent is allowed to do autonomously—not just when to alert", supported: "yes" },
  },
  {
    category: "Proactive Heartbeat",
    feature: "Escalation gate",
    openclaw: { value: "LLM called only when necessary (cheap-checks-first)", supported: "yes" },
    synth:  { value: "Same, but the gate can choose between a cheap verification model (DeepSeek) and a powerful reasoning model (Kimi K2.6) depending on severity", supported: "yes" },
  },
  {
    category: "Proactive Heartbeat",
    feature: "Action dispatcher",
    openclaw: { value: "Sends an alert to a messaging channel (Slack, WhatsApp, etc.)", supported: "partial" },
    synth:  { value: "Creates a full autonomous task (research, draft, file, notify) and pushes it onto the same agent loop that handles user requests", supported: "yes" },
  },
  // ── Memory and Context ──
  {
    category: "Memory and Context",
    feature: "Memory type",
    openclaw: { value: "Conversation history and basic file-based persistence", supported: "partial" },
    synth:  { value: "Dual-store memory: vector search (Qdrant) for semantic recall + knowledge graph (KuzuDB) for structured entity relationships", supported: "yes" },
  },
  {
    category: "Memory and Context",
    feature: "Temporal awareness",
    openclaw: { value: "No built-in temporal tagging", supported: "no" },
    synth:  { value: "Graphiti integration: every fact has a valid-time interval, enabling time-travel queries", supported: "yes" },
  },
  {
    category: "Memory and Context",
    feature: "Cross-session persistence",
    openclaw: { value: "Maintains context across chat sessions on the same messaging platform", supported: "partial" },
    synth:  { value: "Channel-unified memory: interactions from WhatsApp, dashboard, browser, and desktop all feed the same knowledge graph", supported: "yes" },
  },
  {
    category: "Memory and Context",
    feature: "Vertical knowledge graphs",
    openclaw: { value: "None", supported: "no" },
    synth:  { value: "Pre-built entity schemas for healthcare admin, procurement, and personal assistance—no manual configuration required", supported: "yes" },
  },
  // ── Tools and Channels ──
  {
    category: "Tools and Channels",
    feature: "Browser automation",
    openclaw: { value: "None built-in", supported: "no" },
    synth:  { value: "Full browser automation via Playwright (or browser-use library), with deterministic primitives to minimise token cost", supported: "yes" },
  },
  {
    category: "Tools and Channels",
    feature: "Desktop GUI control",
    openclaw: { value: "None", supported: "no" },
    synth:  { value: "VNC-based observe-propose-act loop (PyAutoGUI/xdotool), running inside isolated Firecracker microVMs", supported: "yes" },
  },
  {
    category: "Tools and Channels",
    feature: "WhatsApp integration",
    openclaw: { value: "Native, as an alert/chat surface", supported: "partial" },
    synth:  { value: "Native, as both an alert/chat surface and an execution channel—the agent can send structured briefings, receive task updates, and manage conversations", supported: "yes" },
  },
  {
    category: "Tools and Channels",
    feature: "MCP (Model Context Protocol)",
    openclaw: { value: "Not supported", supported: "no" },
    synth:  { value: "Full MCP integration: connect to any MCP server and the agent automatically discovers and uses those tools", supported: "yes" },
  },
  {
    category: "Tools and Channels",
    feature: "Custom APIs",
    openclaw: { value: "Users must write custom probe scripts", supported: "no" },
    synth:  { value: "Users can provide an OpenAPI spec and Synth generates an MCP server that exposes those endpoints as tools—no code required", supported: "yes" },
  },
  // ── Enterprise Readiness ──
  {
    category: "Enterprise Readiness",
    feature: "Deployment",
    openclaw: { value: "Self-hosted on a VPS; requires manual setup of environment variables, API keys, and config files", supported: "partial" },
    synth:  { value: "Self-hosted via Docker Compose or Kubernetes (Helm charts); one-command deployment", supported: "yes" },
  },
  {
    category: "Enterprise Readiness",
    feature: "Multi-tenancy",
    openclaw: { value: "None", supported: "no" },
    synth:  { value: "Workspace-based isolation, RBAC (Admin, Operator, Viewer), and ethical walls for multi-client scenarios", supported: "yes" },
  },
  {
    category: "Enterprise Readiness",
    feature: "Compliance",
    openclaw: { value: "None", supported: "no" },
    synth:  { value: "SOC 2 Type II roadmap, POPIA-aligned data handling, Bring Your Own Key, open-source code for full auditability", supported: "yes" },
  },
  {
    category: "Enterprise Readiness",
    feature: "Dashboard",
    openclaw: { value: "No dashboard; interaction via messaging apps and CLI", supported: "no" },
    synth:  { value: "Full React dashboard with real-time task streaming, heartbeat monitor, memory explorer, cost analytics, and audit logs", supported: "yes" },
  },
  {
    category: "Enterprise Readiness",
    feature: "Support",
    openclaw: { value: "Community (GitHub issues)", supported: "partial" },
    synth:  { value: "Enterprise support with SLA, dedicated onboarding, and professional services", supported: "yes" },
  },
  // ── Scalability ──
  {
    category: "Scalability",
    feature: "Execution model",
    openclaw: { value: "Single-process daemon", supported: "no" },
    synth:  { value: "Containerised microservices; agent tasks run in isolated Firecracker microVMs on Kubernetes", supported: "yes" },
  },
  {
    category: "Scalability",
    feature: "Horizontal scaling",
    openclaw: { value: "Limited—personal tool", supported: "no" },
    synth:  { value: "Scale to thousands of concurrent tasks; the heartbeat, memory, and execution layers scale independently", supported: "yes" },
  },
  {
    category: "Scalability",
    feature: "Model-agnostic architecture",
    openclaw: { value: "Tied to specific LLM providers (configurable)", supported: "partial" },
    synth:  { value: "Model-agnostic ModelRouter can hot-swap between API providers (Kimi, DeepSeek) and self-hosted open-source models (vLLM, Ollama) without code changes", supported: "yes" },
  },
]

// ─── helper components ────────────────────────────────────────────────────────
function SupportIcon({ level }: { level: "yes" | "no" | "partial" }) {
  if (level === "yes")    return <span className="voc-support voc-support-yes"  aria-label="Yes">✓</span>
  if (level === "no")     return <span className="voc-support voc-support-no"   aria-label="No">✗</span>
  return                         <span className="voc-support voc-support-part" aria-label="Partial">◐</span>
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VsOpenClaw() {
  const [showAll, setShowAll] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const categories = ["All", ...Array.from(new Set(comparisonRows.map(r => r.category)))]

  const filteredRows = comparisonRows.filter(
    r => activeCategory === "All" || r.category === activeCategory
  )
  const visibleRows = showAll ? filteredRows : filteredRows.slice(0, 8)

  return (
    <>
      <style>{`
        /* ── page ── */
        .voc-page {
          font-family: 'Geist', 'Inter', system-ui, sans-serif;
          background: #F5F7FA;
          color: #0A0D14;
          min-height: 100vh;
        }

        /* ── wrap ── */
        .voc-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .voc-wrap-sm {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── hero ── */
        .voc-hero {
          padding: 88px 24px 72px;
          text-align: center;
          border-bottom: 1px solid rgba(10,13,20,0.07);
          position: relative;
          overflow: hidden;
        }
        .voc-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          pointer-events: none;
        }
        .voc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #EFF6FF;
          border: 1px solid rgba(37,99,235,0.2);
          color: #2563EB;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 999px;
          padding: 5px 14px;
          margin-bottom: 28px;
        }
        .voc-hero-headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -1.2px;
          color: #0A0D14;
          max-width: 800px;
          margin: 0 auto 18px;
        }
        .voc-hero-headline em {
          font-style: italic;
          color: #2563EB;
        }
        .voc-hero-sub {
          font-size: 16px;
          color: #445068;
          line-height: 1.7;
          max-width: 620px;
          margin: 0 auto 40px;
        }
        .voc-hero-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .voc-badge {
          font-size: 13px;
          font-weight: 600;
          border-radius: 999px;
          padding: 8px 18px;
          border: 1px solid;
        }
        .voc-badge-openclaw {
          background: #1A1A2E;
          border-color: #1A1A2E;
          color: #fff;
        }
        .voc-badge-synth {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .voc-badge-vs {
          font-size: 11px;
          font-weight: 700;
          color: #8E9AB5;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* brand snippets — logos everywhere, 20px default */
        .voc-brand-inline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .voc-brand-inline img { height: 20px; width: auto; display: block; border-radius: 4px; }
        .voc-brand-hero { display:flex; gap:16px; justify-content:center; align-items:center; margin-top:18px }
        .voc-mini-logo { height:40px; width:auto; display:inline-block; vertical-align:middle; border-radius:4px; }
        .voc-logo-synth { height:40px; width:auto; display:inline-block; vertical-align:middle; border-radius:4px; }
        /* Hero logos slightly larger for visibility */
        .voc-hero .voc-mini-logo { height:56px; }
        .voc-hero .voc-logo-synth { height:56px; }

        /* ── stack callout ── */
        .voc-stack-callout {
          background: #0A0D14;
          border-radius: 16px;
          padding: 32px;
          max-width: 760px;
          margin: 0 auto 48px;
          text-align: left;
        }
        .voc-stack-callout h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 22px;
          font-weight: 400;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 12px;
        }
        .voc-stack-callout p {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0;
        }
        .voc-stack-callout strong {
          color: rgba(255,255,255,0.85);
        }

        /* ── TL;DR callout ── */
        .voc-tldr {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 28px 32px;
          margin: 0 auto;
          max-width: 760px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .voc-tldr-col h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .voc-tldr-col-openclaw h4 { color: #1A1A2E; }
        .voc-tldr-col-synth  h4 { color: #2563EB; }
        .voc-tldr-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 0;
          margin: 0;
        }
        .voc-tldr-col li {
          font-size: 13px;
          color: #445068;
          display: flex;
          align-items: flex-start;
          gap: 7px;
          line-height: 1.5;
        }
        .voc-tldr-col li::before {
          content: '·';
          font-weight: 700;
          flex-shrink: 0;
        }
        .voc-tldr-col-openclaw li::before { color: #1A1A2E; }
        .voc-tldr-col-synth  li::before { color: #2563EB; }

        /* ── section ── */
        .voc-section {
          padding: 72px 0;
          border-bottom: 1px solid rgba(10,13,20,0.07);
        }
        .voc-section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2563EB;
          text-align: center;
          margin-bottom: 10px;
        }
        .voc-section-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.5px;
          color: #0A0D14;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.15;
        }
        .voc-section-sub {
          font-size: 15px;
          color: #445068;
          text-align: center;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 44px;
        }

        /* ── feature table ── */
        .voc-filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .voc-filter-tab {
          font-size: 13px;
          font-weight: 500;
          border-radius: 999px;
          padding: 6px 16px;
          border: 1px solid rgba(10,13,20,0.12);
          background: #fff;
          color: #445068;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .voc-filter-tab.active,
        .voc-filter-tab:hover {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .voc-table {
          max-width: 900px;
          margin: 0 auto;
          border-radius: 16px;
          border: 1px solid rgba(10,13,20,0.08);
          overflow: hidden;
        }
        .voc-table-head {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          background: #0A0D14;
        }
        .voc-th {
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .voc-th-feature  { color: rgba(255,255,255,0.35); }
        .voc-th-openclaw { color: rgba(255,255,255,0.5); }
        .voc-th-synth    { color: #60A5FA; }

        .voc-category-row {
          background: #F0F4FA;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8E9AB5;
          border-top: 1px solid rgba(10,13,20,0.06);
        }

        .voc-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          border-top: 1px solid rgba(10,13,20,0.05);
          background: #fff;
          transition: background 0.1s;
        }
        .voc-row:hover { background: #F8FAFF; }
        .voc-cell {
          padding: 13px 18px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }
        .voc-cell-feature { font-weight: 500; color: #0A0D14; }
        .voc-cell-openclaw { color: #6B7A99; }
        .voc-cell-synth   { color: #1E3A5F; }

        .voc-support {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .voc-support-yes  { background: #DCFCE7; color: #16A34A; }
        .voc-support-no   { background: #FEE2E2; color: #DC2626; }
        .voc-support-part { background: #FEF9C3; color: #CA8A04; }

        .voc-show-more {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
        .voc-show-more-btn {
          font-size: 14px;
          font-weight: 500;
          color: #2563EB;
          background: none;
          border: 1px solid rgba(37,99,235,0.25);
          border-radius: 999px;
          padding: 8px 22px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .voc-show-more-btn:hover {
          background: #EFF6FF;
          border-color: #2563EB;
        }

        /* ── key difference quote ── */
        .voc-quote-box {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 32px;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .voc-quote-box blockquote {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 20px;
          font-weight: 400;
          color: #0A0D14;
          line-height: 1.5;
          margin: 0 0 16px;
          letter-spacing: -0.3px;
        }
        .voc-quote-box blockquote em {
          color: #2563EB;
          font-style: italic;
        }
        .voc-quote-box .voc-quote-attrib {
          font-size: 12px;
          color: #8E9AB5;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ── detailed category cards ── */
        .voc-cat-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 900px;
          margin: 0 auto;
        }
        .voc-cat-card {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .voc-cat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: #F8FAFF;
          border-bottom: 1px solid rgba(10,13,20,0.06);
        }
        .voc-cat-header h3 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0A0D14;
          margin: 0;
        }
        .voc-cat-body {
          padding: 0;
        }
        .voc-cat-row {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr;
          border-top: 1px solid rgba(10,13,20,0.05);
        }
        .voc-cat-row:first-child { border-top: none; }
        .voc-cat-cell {
          padding: 14px 18px;
          font-size: 13px;
          line-height: 1.6;
        }
        .voc-cat-cell-feature {
          font-weight: 500;
          color: #0A0D14;
          border-right: 1px solid rgba(10,13,20,0.05);
        }
        .voc-cat-cell-openclaw {
          color: #6B7A99;
          border-right: 1px solid rgba(10,13,20,0.05);
          background: #FAFAFC;
        }
        .voc-cat-cell-synth {
          color: #1E3A5F;
          background: #F0F7FF;
        }
        .voc-cat-cell-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .voc-cat-cell-openclaw .voc-cat-cell-label { color: #9CA3AF; }
        .voc-cat-cell-synth .voc-cat-cell-label { color: #3B82F6; }

        /* ── vc callout ── */
        .voc-vc-box {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 36px;
          max-width: 860px;
          margin: 0 auto;
        }
        .voc-vc-box h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 24px;
          font-weight: 400;
          color: #0A0D14;
          letter-spacing: -0.3px;
          margin-bottom: 14px;
        }
        .voc-vc-points {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .voc-vc-point {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          background: #F5F7FA;
          border-radius: 10px;
        }
        .voc-vc-point-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #EFF6FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .voc-vc-point h5 {
          font-size: 13px;
          font-weight: 600;
          color: #0A0D14;
          margin-bottom: 3px;
        }
        .voc-vc-point p {
          font-size: 12px;
          color: #445068;
          line-height: 1.55;
          margin: 0;
        }
        .voc-vc-note {
          font-size: 13px;
          color: #6B7A99;
          line-height: 1.7;
          border-top: 1px solid rgba(10,13,20,0.07);
          padding-top: 20px;
        }
        .voc-vc-note strong { color: #0A0D14; }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .voc-tldr          { grid-template-columns: 1fr; }
          .voc-table-head,
          .voc-row           { grid-template-columns: 1.4fr 1fr; }
          .voc-th-feature,
          .voc-cell-feature  { display: none; }
          .voc-cat-row       { grid-template-columns: 1fr; }
          .voc-cat-cell-feature { border-right: none; border-bottom: 1px solid rgba(10,13,20,0.05); }
          .voc-cat-cell-openclaw { border-right: none; border-bottom: 1px solid rgba(10,13,20,0.05); }
          .voc-vc-points     { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      <div className="voc-page">

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section className="voc-hero">
          <div className="voc-eyebrow">Platform comparison</div>
          <h1 className="voc-hero-headline">
            OpenClaw proved proactive AI<br />is the future.<br />
            <em>Synth is the enterprise platform<br />that makes it real.</em>
          </h1>
          <p className="voc-hero-sub">
            OpenClaw is an impressive open-source proof-of-concept — a personal, always-on
            monitoring assistant that alerts you when systems change. Synth took that same
            heartbeat philosophy and built a governed, multi-agent enterprise platform that
            does not just alert — it executes end-to-end business workflows autonomously.
          </p>
          <div className="voc-hero-badges">
            <div className="voc-brand-hero">
              <div className="voc-brand-inline" aria-hidden>
                <img src={encodeURI('/compare images/Openclaw.jpg')}/>
              </div>
              <span className="voc-badge-vs">VS</span>
              <div className="voc-brand-inline" aria-hidden>
                <img src="/logo.png" alt="Synth" className="voc-logo-synth" />
              </div>
            </div>
          </div>

          {/* Stack positioning callout */}
          <div className="voc-stack-callout">
            <h3>
              <span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span> says "Hey, something changed — you should look at this."
            </h3>
            <p style={{marginBottom: '16px'}}>
              <span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span style={{color:'rgba(255,255,255,0.85)', fontWeight:600}}>Synth</span></span> says "Something changed. I have already investigated, drafted a summary, updated the case file, and sent the memo to the partner."
            </p>
            <p>
              That is the difference between a <strong>notification layer</strong> and an <strong>execution layer</strong>.
              OpenClaw is the proof-of-concept. Synth is the production platform.
            </p>
          </div>

          {/* TL;DR */}
          <div className="voc-tldr">
            <div className="voc-tldr-col voc-tldr-col-openclaw">
              <h4>
                <span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw — Proof of Concept</span></span>
              </h4>
              <ul>
                <li>Personal, always-on monitoring assistant</li>
                <li>Alerts you when systems change — does not execute</li>
                <li>Single-agent, user-centred architecture</li>
                <li>CLI, config files, and chat interface</li>
                <li>Self-hosted on a VPS; manual setup required</li>
                <li>Community support (GitHub issues)</li>
                <li>Free, self-hosted — the user is the buyer</li>
              </ul>
            </div>
            <div className="voc-tldr-col voc-tldr-col-synth">
              <h4>
                <span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth — Enterprise Platform</span></span>
              </h4>
              <ul>
                <li>Autonomous employee executing multi-step enterprise workflows</li>
                <li>End-to-end execution: plans, uses tools, verifies, delivers</li>
                <li>Multi-agent orchestration (Planner-Executor-Verifier)</li>
                <li>Full React dashboard + WhatsApp execution channel</li>
                <li>Docker Compose / Kubernetes; one-command deployment</li>
                <li>Enterprise support with SLA</li>
                <li>Paid subscription — the enterprise is the buyer</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ══ KEY DIFFERENCE QUOTE ════════════════════════════════════════════════ */}
        <section className="voc-section">
          <div className="voc-wrap-sm">
            <p className="voc-section-eyebrow">The heartbeat difference</p>
            <h2 className="voc-section-title">From alert to action</h2>
            <p className="voc-section-sub">
              Both systems share the same philosophical origin — proactive AI that watches
              and responds. But what happens after the probe fires is where they diverge completely.
            </p>
            <div className="voc-quote-box">
              <blockquote>
                "OpenClaw's heartbeat says <em>'Hey, something changed — you should look at this.'</em><br />
                Synth's heartbeat says <em>'Something changed. I have already investigated, drafted a summary, updated the case file, and sent the memo to the partner.'</em>"
              </blockquote>
              <p className="voc-quote-attrib">The architectural gap in a single sentence</p>
            </div>
          </div>
        </section>

        {/* ══ FEATURE TABLE ══════════════════════════════════════════════════════ */}
        <section className="voc-section">
          <div className="voc-wrap">
            <p className="voc-section-eyebrow">Feature comparison</p>
            <h2 className="voc-section-title">
              Seven dimensions, side by side
            </h2>
            <p className="voc-section-sub">
              We describe OpenClaw accurately — it is genuinely impressive open-source work.
              The gap is not in quality; it is in scope, governance, and execution depth.
            </p>

            {/* Category filter */}
            <div className="voc-filter-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`voc-filter-tab ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => { setActiveCategory(cat); setShowAll(false); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="voc-table">
              <div className="voc-table-head">
                <div className="voc-th voc-th-feature">Feature</div>
                <div className="voc-th voc-th-openclaw">
                  <span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span>
                </div>
                <div className="voc-th voc-th-synth">
                  <span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span>
                </div>
              </div>

              {visibleRows.map((row, i) => {
                const prevRow = filteredRows[i - 1]
                const showCategory = !prevRow || prevRow.category !== row.category

                return (
                  <div key={i}>
                    {showCategory && activeCategory === "All" && (
                      <div className="voc-category-row">{row.category}</div>
                    )}
                    <div className="voc-row">
                      <div className="voc-cell voc-cell-feature">{row.feature}</div>
                      <div className="voc-cell voc-cell-openclaw">
                        <SupportIcon level={row.openclaw.supported} />
                        {row.openclaw.value}
                      </div>
                      <div className="voc-cell voc-cell-synth">
                        <SupportIcon level={row.synth.supported} />
                        {row.synth.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!showAll && filteredRows.length > 8 && (
              <div className="voc-show-more">
                <button className="voc-show-more-btn" onClick={() => setShowAll(true)}>
                  Show all {filteredRows.length} features ↓
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ DETAILED CATEGORY CARDS ═══════════════════════════════════════════ */}
        <section className="voc-section">
          <div className="voc-wrap">
            <p className="voc-section-eyebrow">Deep dive</p>
            <h2 className="voc-section-title">Category by category</h2>
            <p className="voc-section-sub">
              The same seven dimensions, unpacked with the full technical detail that
              engineering teams and VCs need to evaluate.
            </p>

            <div className="voc-cat-grid">
              {/* Architecture Philosophy */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>🏗️</span>
                  <h3>Architecture Philosophy</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Core concept</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      A personal, always-on AI assistant that monitors systems and alerts you or the team.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      An autonomous employee that executes complex, multi-step enterprise workflows across apps.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Primary loop</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Heartbeat → probe → policy → escalate → <strong>notify</strong>.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Heartbeat → probe → policy → escalate → <strong>execute full agent task</strong> (plan, use tools, verify, deliver).
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Multi-agent</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Single-agent, user-centred.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Multi-agent orchestration: Planner-Executor-Verifier, plus specialised sub-agents.
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Users */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>👤</span>
                  <h3>Target Users</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Primary user</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      Technical individuals — developers, hobbyists — comfortable with YAML, API keys, and server config.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      Business professionals in regulated enterprises — lawyers, healthcare administrators, procurement officers — who never touch a terminal.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Buyer</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      The user themselves. Free, self-hosted.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      The enterprise. Paid subscription with compliance and support.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Experience</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      CLI, config files, and a multi-messenger chat interface.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Clean dashboard with task submission, live streaming, heartbeat configuration, memory explorer, and cost dashboards.
                    </div>
                  </div>
                </div>
              </div>

              {/* Proactive Heartbeat */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>💓</span>
                  <h3>Proactive Heartbeat</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Scheduler</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      Configurable intervals and active hours.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      Same, plus per-user scheduling (e.g., each lawyer sets their own morning briefing time).
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Deterministic probes</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      HTTP, file-system, shell commands.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Same, plus queue depth, API status, database checks; extensible probe registry.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Policy engine</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      YAML-based rules; deterministic evaluation.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Same, plus integration with an Authorised Actions policy that governs what the agent is allowed to do autonomously — not just when to alert.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Escalation gate</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      LLM called only when necessary (cheap-checks-first).
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Same, but the gate can choose between a cheap verification model (DeepSeek) and a powerful reasoning model (Kimi K2.6) depending on severity.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Action dispatcher</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Sends an alert to a messaging channel (Slack, WhatsApp, etc.).
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Creates a full autonomous task (research, draft, file, notify) and pushes it onto the same agent loop that handles user requests.
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory and Context */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>🧠</span>
                  <h3>Memory and Context</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Memory type</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')}/> <span>OpenClaw</span></span></div>
                      Conversation history and basic file-based persistence.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth"/> <span>Synth</span></span></div>
                      Dual-store memory: vector search (Qdrant) for semantic recall + knowledge graph (KuzuDB) for structured entity relationships.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Temporal awareness</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      No built-in temporal tagging.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Graphiti integration: every fact has a valid-time interval, enabling "what was the status of this supplier last week?" queries.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Cross-session persistence</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Maintains context across chat sessions on the same messaging platform.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Channel-unified memory: interactions from WhatsApp, dashboard, browser, and desktop all feed the same knowledge graph.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Vertical knowledge graphs</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      None.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Pre-built entity schemas for healthcare admin, procurement, and personal assistance — no manual configuration required.
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools and Channels */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>🛠️</span>
                  <h3>Tools and Channels</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Browser automation</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      None built-in.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      Full browser automation via Playwright (or browser-use library), with deterministic primitives to minimise token cost.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Desktop GUI control</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      None.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      VNC-based observe-propose-act loop (PyAutoGUI/xdotool), running inside isolated Firecracker microVMs.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">WhatsApp integration</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Native, as an alert/chat surface.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Native, as both an alert/chat surface and an execution channel — the agent can send structured briefings, receive task updates, and manage conversations.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">MCP (Model Context Protocol)</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Not supported.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Full MCP integration: connect to any MCP server (filesystem, GitHub, Postgres, custom APIs) and the agent automatically discovers and uses those tools.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Custom APIs</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Users must write custom probe scripts.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Users can provide an OpenAPI spec and Synth generates an MCP server that exposes those endpoints as tools — no code required.
                    </div>
                  </div>
                </div>
              </div>

              {/* Enterprise Readiness */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>🏢</span>
                  <h3>Enterprise Readiness</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Deployment</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      Self-hosted on a VPS; requires manual setup of environment variables, API keys, and config files.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      Self-hosted via Docker Compose or Kubernetes (Helm charts); one-command deployment.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Multi-tenancy</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      None.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Workspace-based isolation, RBAC (Admin, Operator, Viewer), and ethical walls for multi-client scenarios.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Compliance</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      None.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      SOC 2 Type II roadmap, POPIA-aligned data handling, Bring Your Own Key, open-source code for full auditability.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Dashboard</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      No dashboard; interaction via messaging apps and CLI.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Full React dashboard with real-time task streaming, heartbeat monitor, memory explorer, cost analytics, and audit logs.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Support</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Community (GitHub issues).
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Enterprise support with SLA, dedicated onboarding, and professional services.
                    </div>
                  </div>
                </div>
              </div>

              {/* Scalability */}
              <div className="voc-cat-card">
                <div className="voc-cat-header">
                  <span style={{fontSize:'18px'}}>⚡</span>
                  <h3>Scalability</h3>
                </div>
                <div className="voc-cat-body">
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Execution model</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span></div>
                      Single-process daemon.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      <div className="voc-cat-cell-label"><span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span></div>
                      Containerised microservices; agent tasks run in isolated Firecracker microVMs on Kubernetes.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Horizontal scaling</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Limited — personal tool.
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Scale to thousands of concurrent tasks; the heartbeat, memory, and execution layers scale independently.
                    </div>
                  </div>
                  <div className="voc-cat-row">
                    <div className="voc-cat-cell voc-cat-cell-feature">Model-agnostic</div>
                    <div className="voc-cat-cell voc-cat-cell-openclaw">
                      Tied to specific LLM providers (configurable).
                    </div>
                    <div className="voc-cat-cell voc-cat-cell-synth">
                      Model-agnostic ModelRouter can hot-swap between API providers (Kimi, DeepSeek) and self-hosted open-source models (vLLM, Ollama) without code changes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ VC CALLOUT ════════════════════════════════════════════════════════ */}
        <section className="voc-section">
          <div className="voc-wrap">
            <p className="voc-section-eyebrow">For investors</p>
            <h2 className="voc-section-title">Why this comparison matters to VCs</h2>
            <p className="voc-section-sub">
              OpenClaw is the proof-of-concept that proactive AI is the future.
              Synth is the enterprise platform that makes that future safe, governable, and profitable.
            </p>

            <div className="voc-vc-box">
              <h3>
                <span className="voc-brand-inline"><img src={encodeURI('/compare images/Openclaw.jpg')} /> <span>OpenClaw</span></span> proved the market.
                <span className="voc-brand-inline"><img src="/logo.png" alt="Synth" className="voc-logo-synth" /> <span>Synth</span></span> owns it.
              </h3>
              <div className="voc-vc-points">
                <div className="voc-vc-point">
                  <div className="voc-vc-point-icon">🚀</div>
                  <div>
                    <h5>From PoC to platform</h5>
                    <p>OpenClaw validated that proactive heartbeat AI is valuable. Synth took that validation and built the enterprise-grade infrastructure — governance, compliance, multi-tenancy, and end-to-end execution — that makes it deployable in regulated industries.</p>
                  </div>
                </div>
                <div className="voc-vc-point">
                  <div className="voc-vc-point-icon">🏢</div>
                  <div>
                    <h5>Enterprise buyer, enterprise budget</h5>
                    <p>OpenClaw's buyer is a hobbyist with a VPS. Synth's buyer is a law firm, hospital, or bank with a procurement process and a compliance team. The revenue per customer is orders of magnitude larger.</p>
                  </div>
                </div>
                <div className="voc-vc-point">
                  <div className="voc-vc-point-icon">🔒</div>
                  <div>
                    <h5>Governance as a moat</h5>
                    <p>OpenClaw has no compliance story. Synth has SOC 2 Type II roadmap, POPIA alignment, RBAC, ethical walls, and Bring Your Own Key. In regulated industries, governance is not a feature — it is the price of entry.</p>
                  </div>
                </div>
                <div className="voc-vc-point">
                  <div className="voc-vc-point-icon">📈</div>
                  <div>
                    <h5>Execution depth = retention</h5>
                    <p>An alert tool can be replaced. An autonomous employee that has already filed the claim, drafted the brief, and updated the CRM cannot be ripped out without operational disruption. Synth's execution depth creates switching costs OpenClaw cannot match.</p>
                  </div>
                </div>
              </div>
              <p className="voc-vc-note">
                <strong>The acquisition thesis:</strong> OpenClaw is the open-source inspiration
                that proved proactive AI is the future. Synth is the enterprise platform that makes
                that future safe, governable, and deeply integrated into the workflows of regulated
                industries. A strategic acquirer — whether a Salesforce, Microsoft, or African telecoms
                group — looking to own the agentic layer in emerging markets will find Synth's
                compliance, multi-tenancy, and execution depth far more valuable than a personal
                monitoring daemon. Synth is the platform. That is where the enterprise
                relationships and recurring revenue live.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}