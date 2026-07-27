import { useState } from "react"

// ─── types ────────────────────────────────────────────────────────────────────
interface ComparisonRow {
  category: string
  feature: string
  trixta: { value: string; supported: "yes" | "no" | "partial" }
  synth:  { value: string; supported: "yes" | "no" | "partial" }
}

// PricingTier removed (unused) to satisfy TypeScript checks

interface SectorRow {
  sector: string
  icon: string
  trixta: string
  synth: string
  winner: "trixta" | "synth" | "both"
}

// ─── comparison data ──────────────────────────────────────────────────────────
const comparisonRows: ComparisonRow[] = [
  // ── What it actually is ──
  {
    category: "Fundamentals",
    feature: "What it actually is",
    trixta: { value: "Infrastructure layer — a 'DeCloud' for building and running agentic systems", supported: "partial" },
    synth:  { value: "agent designed to independently execute end-to-end tasks like multi-source research and web-browsing for real people and businesses", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Who it's built for",
    trixta: { value: "Developers and enterprise engineering teams building agentic systems from scratch", supported: "partial" },
    synth:  { value: "Professionals, business teams, and healthcare operators who need work done now", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Time to first value",
    trixta: { value: "Weeks to months — requires architecture design, development, and deployment", supported: "no" },
    synth:  { value: "Under 3 minutes — connect your tools, start messaging", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Some technical knowledge required",
    trixta: { value: "High — primitives, runtimes, and distributed systems concepts required", supported: "no" },
    synth:  { value: "None — if you can send a WhatsApp message, you can use Synth", supported: "yes" },
  },
  // ── Execution ──
  {
    category: "Execution",
    feature: "Autonomous task execution",
    trixta: { value: "Provides the infrastructure for others to build autonomous execution — not out of the box", supported: "partial" },
    synth:  { value: "Built in — give Synth a task and it executes every step without you", supported: "yes" },
  },
  {
    category: "Execution",
    feature: "Proactive alerts & morning briefing",
    trixta: { value: "Not a feature — would need to be custom-built on top of Trixta's infrastructure", supported: "no" },
    synth:  { value: "Daily briefing delivered to WhatsApp before 7 AM — zero setup required", supported: "yes" },
  },
  {
    category: "Execution",
    feature: "Works in WhatsApp & Telegram",
    trixta: { value: "No — requires custom front-end development to deliver any user-facing output", supported: "no" },
    synth:  { value: "Native — Synth lives in the apps your team already uses every day", supported: "yes" },
  },
  {
    category: "Execution",
    feature: "Long-term memory & personalisation",
    trixta: { value: "Possible to build via Trixta primitives — but requires significant engineering effort", supported: "partial" },
    synth:  { value: "Built in — Synth learns your preferences, patterns, and relationships over time", supported: "yes" },
  },
  // ── Business verticals ──
  {
    category: "Verticals",
    feature: "Marketing workflows",
    trixta: { value: "Infrastructure only — you must build campaign and creative workflows yourself", supported: "partial" },
    synth:  { value: "Pre-built — campaign generation, competitor research, content, and analytics ready to use", supported: "yes" },
  },
  {
    category: "Verticals",
    feature: "Sales automation",
    trixta: { value: "No native sales tools — engineering teams must build from primitives", supported: "no" },
    synth:  { value: "Lead enrichment, outreach drafting, deal briefs, and CRM sync — out of the box", supported: "yes" },
  },
  {
    category: "Verticals",
    feature: "Finance & analysis",
    trixta: { value: "No native financial capabilities — custom development required for each use case", supported: "no" },
    synth:  { value: "Live market data, financial modelling, report collection, and portfolio monitoring", supported: "yes" },
  },
  {
    category: "Verticals",
    feature: "Healthcare admin",
    trixta: { value: "Not designed for healthcare — no ICD-10, payer rules, or clinical workflow support", supported: "no" },
    synth:  { value: "ICD-10/CPT/HCPCS coding, claim denial resolution, scheduling, refill reminders — POPIA-compliant", supported: "yes" },
  },
  {
    category: "Verticals",
    feature: "Personal AI assistant",
    trixta: { value: "Infrastructure only — no personal assistant capabilities without custom development", supported: "no" },
    synth:  { value: "Full personal chief of staff — day planning, scheduling, travel, communications via WhatsApp", supported: "yes" },
  },
  // ── Integrations ──
  {
    category: "Integrations",
    feature: "Business tool connections",
    trixta: { value: "Integrations must be custom-built using Trixta's wrapper and Space primitives", supported: "partial" },
    synth:  { value: "Sage, Xero, HubSpot, Salesforce, Google Workspace, Microsoft 365 — native connectors", supported: "yes" },
  },
  {
    category: "Integrations",
    feature: "South African tools (Sage, GoodX, SARS)",
    trixta: { value: "No local market integrations — global infrastructure, no SA-specific connectors", supported: "no" },
    synth:  { value: "Sage, GoodX, SA medical schemes, SARS eFiling — built for the local market", supported: "yes" },
  },
  {
    category: "Integrations",
    feature: "Custom MCP / API access",
    trixta: { value: "Yes — Trixta's core architecture is built for custom integration and extension", supported: "yes" },
    synth:  { value: "Yes — custom MCP servers and REST API available ", supported: "yes" },
  },
  // ── Pricing & access ──
  {
    category: "Pricing",
    feature: "Entry price",
    trixta: { value: "$60/month for a team of less than 10, $200/month/10-50 heads, all billed  annually", supported: "no" },
    synth:  { value: "$15/month per seat — accessible to individuals, SMEs, and enterprise alike", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Healthcare / enterprise pricing",
    trixta: { value: "Custom enterprise contracts — typically $10,000+ per month at scale", supported: "no" },
    synth:  { value: "$499/facility/month — purpose-built for SA healthcare, POPIA-compliant", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Free tier or trial",
    trixta: { value: "available —  30-minute, guided, AI-driven onboarding and strategy session", supported: "no" },
    synth:  { value: "Free during beta — no credit card required", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Pricing transparency",
    trixta: { value: "  30-minute, guided, AI-driven onboarding and strategy session priced annually, pricing not published on website", supported: "yes" },
    synth:  { value: "$15, $35, $195/month. Healthcare from $499/facility", supported: "yes" },
  },
]

// ─── sector focus ─────────────────────────────────────────────────────────────
const sectors: SectorRow[] = [
  {
    sector: "Marketing & Advertising",
    icon: "📈",
    trixta: "Infrastructure only — no marketing tools. Teams must build campaign workflows from scratch using Trixta primitives.",
    synth: "Campaign generation, competitor intelligence, social content, email sequences, and marketing analytics — ready to use immediately.",
    winner: "synth",
  },
  {
    sector: "Sales",
    icon: "🤝",
    trixta: "No native sales capabilities. CRM integration and outreach automation require custom development.",
    synth: "Lead enrichment, personalised outreach, deal briefs, CRM sync (Salesforce, HubSpot, Pipedrive) — out of the box.",
    winner: "synth",
  },
  {
    sector: "Finance",
    icon: "💹",
    trixta: "No financial tools. Market data, modelling, and reporting workflows must be custom-engineered.",
    synth: "Live market analysis, DCF modelling, report collection for hundreds of firms, portfolio monitoring — delivered autonomously.",
    winner: "synth",
  },
  {
    sector: "Product Management",
    icon: "🧩",
    trixta: "No product tools. PRD generation, competitive mapping, and roadmapping not available without custom builds.",
    synth: "Strategy docs, roadmaps, PRDs, market segmentation, competitive maps — drafted, researched, and kept current.",
    winner: "synth",
  },
  {
    sector: "Healthcare Admin",
    icon: "🏥",
    trixta: "Not designed for healthcare. No ICD-10, CPT, payer rules, EHR integration, or POPIA compliance.",
    synth: "Claim denial resolution, ICD-10/CPT coding, payer rule monitoring, appointment scheduling, refill reminders — POPIA-compliant.",
    winner: "synth",
  },
  {
    sector: "Personal Productivity",
    icon: "🙋",
    trixta: "Not a personal tool. Trixta requires developers to build user-facing applications — individuals cannot use it directly.",
    synth: "Daily briefing, proactive alerts, autonomous task execution, long-term memory — via WhatsApp. No app download.",
    winner: "synth",
  },
  {
    sector: "Developer / Infrastructure",
    icon: "⚙️",
    trixta: "Trixta's home turf. Deep infrastructure primitives, composable runtimes, and the DeCloud architecture are genuinely impressive for engineering-led organisations.",
    synth: "Custom MCP servers and REST API available — but Synth is an application layer, not an infrastructure platform. For pure infrastructure needs, Trixta goes deeper.",
    winner: "trixta",
  },
]

// ─── helper components ────────────────────────────────────────────────────────
function SupportIcon({ level }: { level: "yes" | "no" | "partial" }) {
  if (level === "yes")    return <span className="vt-support vt-support-yes"  aria-label="Yes">✓</span>
  if (level === "no")     return <span className="vt-support vt-support-no"   aria-label="No">✗</span>
  return                         <span className="vt-support vt-support-part" aria-label="Partial">◐</span>
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VsTrixta() {
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
        .vt-page {
          font-family: 'Geist', 'Inter', system-ui, sans-serif;
          background: #F5F7FA;
          color: #0A0D14;
          min-height: 100vh;
        }

        /* ── wrap ── */
        .vt-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .vt-wrap-sm {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── hero ── */
        .vt-hero {
          padding: 88px 24px 72px;
          text-align: center;
          border-bottom: 1px solid rgba(10,13,20,0.07);
          position: relative;
          overflow: hidden;
        }
        .vt-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          pointer-events: none;
        }
        .vt-eyebrow {
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
        .vt-hero-headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(34px, 5.5vw, 62px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #0A0D14;
          max-width: 780px;
          margin: 0 auto 18px;
        }
        .vt-hero-headline em {
          font-style: italic;
          color: #2563EB;
        }
        .vt-hero-sub {
          font-size: 16px;
          color: #445068;
          line-height: 1.7;
          max-width: 580px;
          margin: 0 auto 40px;
        }
        .vt-hero-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 42px;
        }
        .vt-badge {
          font-size: 13px;
          font-weight: 600;
          border-radius: 999px;
          padding: 8px 18px;
          border: 1px solid;
        }
        .vt-badge-trixta {
          background: #1A1A2E;
          border-color: #1A1A2E;
          color: #fff;
        }
        .vt-badge-synth {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .vt-badge-vs {
          font-size: 11px;
          font-weight: 700;
          color: #8E9AB5;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* brand snippets */
        .vt-brand-inline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .vt-brand-inline img { height: 20px; width: auto; display: block; }
        .vt-brand-hero { display:flex; gap:12px; justify-content:center; margin-top:18px }
        .vt-mini-logo { height:50px; width:auto; display:inline-block; vertical-align:middle }
        /* Synth logo – enlarged to stand out */
        .vt-logo-synth { height:120px; width:auto; display:inline-block; vertical-align:middle }

        /* ── TL;DR callout ── */
        .vt-tldr {
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
        .vt-tldr-col h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .vt-tldr-col-trixta h4 { color: #1A1A2E; }
        .vt-tldr-col-synth  h4 { color: #2563EB; }
        .vt-tldr-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .vt-tldr-col li {
          font-size: 13px;
          color: #445068;
          display: flex;
          align-items: flex-start;
          gap: 7px;
          line-height: 1.5;
        }
        .vt-tldr-col li::before {
          content: '·';
          font-weight: 700;
          flex-shrink: 0;
        }
        .vt-tldr-col-trixta li::before { color: #1A1A2E; }
        .vt-tldr-col-synth  li::before { color: #2563EB; }

        /* ── section ── */
        .vt-section {
          padding: 72px 0;
          border-bottom: 1px solid rgba(10,13,20,0.07);
        }
        .vt-section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2563EB;
          text-align: center;
          margin-bottom: 10px;
        }
        .vt-section-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.5px;
          color: #0A0D14;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.15;
        }
        .vt-section-sub {
          font-size: 15px;
          color: #445068;
          text-align: center;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 50px;
        }

        /* ── pricing cards ── */
        .vt-pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 860px;
          margin: 0 auto 28px;
        }
        .vt-pricing-card {
          border-radius: 16px;
          padding: 24px;
          border: 1px solid;
          position: relative;
        }
        .vt-pricing-card-trixta {
          background: #0D0D1A;
          border-color: rgba(255,255,255,0.1);
        }
        .vt-pricing-card-synth {
          background: #fff;
          border-color: rgba(10,13,20,0.08);
        }
        .vt-pricing-card-synth.featured {
          border-color: #2563EB;
          box-shadow: 0 0 0 2px #EFF6FF;
        }
        .vt-pricing-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
          display: inline-block;
          border-radius: 999px;
          padding: 3px 10px;
        }
        .vt-label-trixta {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
        }
        .vt-label-synth {
          background: #EFF6FF;
          color: #2563EB;
        }
        .vt-pricing-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .vt-pricing-card-trixta .vt-pricing-name { color: #fff; }
        .vt-pricing-card-synth  .vt-pricing-name { color: #0A0D14; }
        .vt-pricing-price {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 40px;
          font-weight: 400;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 4px;
        }
        .vt-pricing-card-trixta .vt-pricing-price { color: #fff; }
        .vt-pricing-card-synth  .vt-pricing-price { color: #0A0D14; }
        .vt-pricing-period {
          font-size: 13px;
          font-family: 'Geist', 'Inter', sans-serif;
          font-weight: 400;
        }
        .vt-pricing-card-trixta .vt-pricing-period { color: rgba(255,255,255,0.35); }
        .vt-pricing-card-synth  .vt-pricing-period { color: #8E9AB5; }
        .vt-pricing-note {
          font-size: 12px;
          line-height: 1.6;
          margin: 10px 0 12px;
        }
        .vt-pricing-card-trixta .vt-pricing-note { color: rgba(255,255,255,0.4); }
        .vt-pricing-card-synth  .vt-pricing-note { color: #6B7A99; }
        .vt-pricing-audience {
          font-size: 12px;
          font-weight: 500;
          border-radius: 999px;
          padding: 6px 14px;
          display: inline-block;
        }
        .vt-pricing-card-trixta .vt-pricing-audience {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.45);
        }
        .vt-pricing-card-synth .vt-pricing-audience {
          background: #EFF6FF;
          color: #2563EB;
        }

        /* ── price verdict ── */
        .vt-price-verdict {
          background: #0A0D14;
          border-radius: 14px;
          padding: 24px 28px;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .vt-verdict-icon {
          font-size: 22px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .vt-price-verdict h4 {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
        }
        .vt-price-verdict p {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          margin: 0;
        }
        .vt-price-verdict strong { color: rgba(255,255,255,0.8); }

        /* ── feature table ── */
        .vt-filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .vt-filter-tab {
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
        .vt-filter-tab.active,
        .vt-filter-tab:hover {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .vt-table {
          max-width: 900px;
          margin: 0 auto;
          border-radius: 16px;
          border: 1px solid rgba(10,13,20,0.08);
          overflow: hidden;
        }
        .vt-table-head {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          background: #0A0D14;
        }
        .vt-th {
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .vt-th-feature  { color: rgba(255,255,255,0.35); }
        .vt-th-trixta   { color: rgba(255,255,255,0.5); }
        .vt-th-synth    { color: #60A5FA; }

        .vt-category-row {
          background: #F0F4FA;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8E9AB5;
          border-top: 1px solid rgba(10,13,20,0.06);
        }

        .vt-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          border-top: 1px solid rgba(10,13,20,0.05);
          background: #fff;
          transition: background 0.1s;
        }
        .vt-row:hover { background: #F8FAFF; }
        .vt-cell {
          padding: 13px 18px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }
        .vt-cell-feature { font-weight: 500; color: #0A0D14; }
        .vt-cell-trixta  { color: #6B7A99; }
        .vt-cell-synth   { color: #1E3A5F; }

        .vt-support {
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
        .vt-support-yes  { background: #DCFCE7; color: #16A34A; }
        .vt-support-no   { background: #FEE2E2; color: #DC2626; }
        .vt-support-part { background: #FEF9C3; color: #CA8A04; }

        .vt-show-more {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
        .vt-show-more-btn {
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
        .vt-show-more-btn:hover {
          background: #EFF6FF;
          border-color: #2563EB;
        }

        /* ── sector grid ── */
        .vt-sector-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 900px;
          margin: 0 auto;
        }
        .vt-sector-card {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .vt-sector-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .vt-sector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 0;
        }
        .vt-sector-name {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          font-weight: 600;
          color: #0A0D14;
        }
        .vt-sector-icon { font-size: 18px; }
        .vt-sector-winner {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-radius: 999px;
          padding: 3px 10px;
        }
        .vt-winner-synth   { background: #EFF6FF; color: #2563EB; }
        .vt-winner-trixta  { background: #F0F0FF; color: #4338CA; }
        .vt-winner-both    { background: #F0FDF4; color: #16A34A; }
        .vt-sector-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 12px 18px 16px;
        }
        .vt-sector-col {
          padding: 10px 12px;
          border-radius: 8px;
        }
        .vt-sector-col-trixta { background: #F8F8FC; margin-right: 6px; }
        .vt-sector-col-synth  { background: #F0F7FF; margin-left: 6px; }
        .vt-sector-col-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .vt-sector-col-trixta .vt-sector-col-label { color: #9CA3AF; }
        .vt-sector-col-synth  .vt-sector-col-label { color: #3B82F6; }
        .vt-sector-col-text {
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }
        .vt-sector-col-trixta .vt-sector-col-text { color: #6B7A99; }
        .vt-sector-col-synth  .vt-sector-col-text { color: #1E3A5F; }

        /* ── vc callout ── */
        .vt-vc-box {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 36px;
          max-width: 860px;
          margin: 0 auto;
        }
        .vt-vc-box h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 24px;
          font-weight: 400;
          color: #0A0D14;
          letter-spacing: -0.3px;
          margin-bottom: 14px;
        }
        .vt-vc-points {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .vt-vc-point {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          background: #F5F7FA;
          border-radius: 10px;
        }
        .vt-vc-point-icon {
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
        .vt-vc-point h5 {
          font-size: 13px;
          font-weight: 600;
          color: #0A0D14;
          margin-bottom: 3px;
        }
        .vt-vc-point p {
          font-size: 12px;
          color: #445068;
          line-height: 1.55;
          margin: 0;
        }
        .vt-vc-note {
          font-size: 13px;
          color: #6B7A99;
          line-height: 1.7;
          border-top: 1px solid rgba(10,13,20,0.07);
          padding-top: 20px;
        }
        .vt-vc-note strong { color: #0A0D14; }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .vt-tldr          { grid-template-columns: 1fr; }
          .vt-pricing-grid  { grid-template-columns: 1fr; }
          .vt-table-head,
          .vt-row           { grid-template-columns: 1.4fr 1fr; }
          .vt-th-feature,
          .vt-cell-feature  { display: none; }
          .vt-sector-body   { grid-template-columns: 1fr; }
          .vt-sector-col-trixta { margin-right: 0; margin-bottom: 6px; }
          .vt-sector-col-synth  { margin-left: 0; }
          .vt-vc-points     { grid-template-columns: 1fr; }
          /* On small screens, reduce Synth logo size a bit to avoid overflow */
          .vt-logo-synth { height:90px; }
          .vt-mini-logo { height:40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      <div className="vt-page">

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section className="vt-hero">
          <div className="vt-eyebrow">Honest comparison</div>
          <h1 className="vt-hero-headline">
            Trixta builds the roads.<br />
            <em>Synth drives the car.</em>
          </h1>
          <p className="vt-hero-sub">
            Trixta is impressive infrastructure for engineering teams building agentic systems.
            Synth is the product those teams wish already existed — autonomous execution
            for real business work, available in WhatsApp from day one.
          </p>
          <div className="vt-hero-badges">
            <div className="vt-brand-hero">
              <div className="vt-brand-inline" aria-hidden>
                <img src={encodeURI('/compare images/Trixta.jpg')} alt="Trixta" className="vt-mini-logo" />
              </div>
              <span className="vt-badge-vs">VS</span>
              <div className="vt-brand-inline" aria-hidden>
                <img src="/logo.png" alt="Synth" className="vt-logo-synth" />
              </div>
            </div>
          </div>

          {/* TL;DR */}
          <div className="vt-tldr">
            <div className="vt-tldr-col vt-tldr-col-trixta">
                <h4>
                  <span className="vt-brand-inline">
                    <img src={encodeURI('/compare images/Trixta.jpg')} alt="Trixta" className="vt-mini-logo" />
                    <span>Trixta in plain English</span>
                  </span>
                </h4>
              <ul>
                <li>Enterprise infrastructure for building agentic systems from code</li>
                <li>Targets developers and engineering organisations</li>
                <li>Requires weeks of development before any business value</li>
                <li>No native healthcare, sales, finance, or personal assistant capabilities</li>
                <li>No South African market integrations</li>
              </ul>
            </div>
            <div className="vt-tldr-col vt-tldr-col-synth">
              <h4>Synth in plain English</h4>
              <ul>
                <li>Autonomous AI agent that executes real business tasks end-to-end</li>
                <li>Built for professionals, business teams, and healthcare operators</li>
                <li>From $15/month — transparent, publicly listed pricing</li>
                <li>Live in under 3 minutes — no development required</li>
                <li>Marketing, Sales, Finance, Product, Healthcare, Personal — ready to use</li>
                <li>Built for South Africa — Sage, GoodX, SA medical schemes, SARS eFiling</li>
              </ul>
            </div>
          </div>
        </section>



        {/* ══ SECTOR FOCUS ══════════════════════════════════════════════════════ */}
        <section className="vt-section">
          <div className="vt-wrap">
            <p className="vt-section-eyebrow">Sector by sector</p>
            <h2 className="vt-section-title">
              What each platform actually covers
            </h2>
            <p className="vt-section-sub">
              Trixta focuses on one sector: developer infrastructure.
              Synth was built to serve six — and to serve them without engineering overhead.
            </p>
            <div className="vt-sector-grid">
              {sectors.map((s, i) => (
                <div key={i} className="vt-sector-card">
                  <div className="vt-sector-header">
                    <div className="vt-sector-name">
                      <span className="vt-sector-icon">{s.icon}</span>
                      {s.sector}
                    </div>
                      <span className={`vt-sector-winner ${
                      s.winner === "synth"  ? "vt-winner-synth"  :
                      s.winner === "trixta" ? "vt-winner-trixta" :
                      "vt-winner-both"
                    }`}>
                      {s.winner === "synth"  ? (
                        <span className="vt-brand-inline"><img src="/logo.png" alt="Synth" className="vt-logo-synth"/> Synth wins</span>
                      ) : s.winner === "trixta" ? (
                        <span className="vt-brand-inline"><img src={encodeURI('/compare images/Trixta.jpg')} alt="Trixta" className="vt-mini-logo"/> wins</span>
                      ) : (
                        "Both work"
                      )}
                    </span>
                  </div>
                  <div className="vt-sector-body">
                    <div className="vt-sector-col vt-sector-col-trixta">
                      <p className="vt-sector-col-label vt-brand-inline"><img src={encodeURI('/compare images/Trixta.jpg')} alt="Trixta" className="vt-mini-logo"/> <span>Trixta</span></p>
                      <p className="vt-sector-col-text">{s.trixta}</p>
                    </div>
                    <div className="vt-sector-col vt-sector-col-synth">
                      <p className="vt-sector-col-label vt-brand-inline"><img src="/logo.png" alt="Synth" className="vt-logo-synth"/> <span>Synth</span></p>
                      <p className="vt-sector-col-text">{s.synth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURE TABLE ══════════════════════════════════════════════════════ */}
        <section className="vt-section">
          <div className="vt-wrap">
            <p className="vt-section-eyebrow">Feature comparison</p>
            <h2 className="vt-section-title">
              Feature by feature, honestly
            </h2>
            <p className="vt-section-sub">
              We include the one category where Trixta genuinely wins —
              pure infrastructure depth. Everything else tells a clear story.
            </p>

            {/* Category filter */}
            <div className="vt-filter-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`vt-filter-tab ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => { setActiveCategory(cat); setShowAll(false); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="vt-table">
              <div className="vt-table-head">
                <div className="vt-th vt-th-feature">Feature</div>
                <div className="vt-th vt-th-trixta"><img src={encodeURI('/compare images/Trixta.jpg')} alt="Trixta" className="vt-mini-logo" /></div>
                <div className="vt-th vt-th-synth"><img src="/logo.png" alt="Synth" className="vt-logo-synth" /></div>
              </div>

              {visibleRows.map((row, i) => {
                const prevRow = filteredRows[i - 1]
                const showCategory = !prevRow || prevRow.category !== row.category

                return (
                  <div key={i}>
                    {showCategory && activeCategory === "All" && (
                      <div className="vt-category-row">{row.category}</div>
                    )}
                    <div className="vt-row">
                      <div className="vt-cell vt-cell-feature">{row.feature}</div>
                      <div className="vt-cell vt-cell-trixta">
                        <SupportIcon level={row.trixta.supported} />
                        {row.trixta.value}
                      </div>
                      <div className="vt-cell vt-cell-synth">
                        <SupportIcon level={row.synth.supported} />
                        {row.synth.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!showAll && filteredRows.length > 8 && (
              <div className="vt-show-more">
                <button className="vt-show-more-btn" onClick={() => setShowAll(true)}>
                  Show all {filteredRows.length} features ↓
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ VC CALLOUT ════════════════════════════════════════════════════════ */}
        <section className="vt-section">
          <div className="vt-wrap">
            <p className="vt-section-eyebrow">For investors</p>
            <h2 className="vt-section-title">Why this comparison matters to VCs</h2>
            <p className="vt-section-sub">
              Trixta and Synth are not competitors — they're at different layers
              of the stack. That's the opportunity.
            </p>

            <div className="vt-vc-box">
              <h3>Synth occupies the layer Trixta cannot reach</h3>
              <div className="vt-vc-points">
                <div className="vt-vc-point">
                  <div className="vt-vc-point-icon">🌍</div>
                  <div>
                    <h5>Underserved market</h5>
                    <p>South Africa and sub-Saharan Africa have no native AI orchestration platform. Synth is built for this market — local tools, local compliance, local pricing.</p>
                  </div>
                </div>
                <div className="vt-vc-point">
                  <div className="vt-vc-point-icon">📱</div>
                  <div>
                    <h5>Distribution moat</h5>
                    <p>WhatsApp has 90%+ penetration in South Africa. Synth delivers AI through the channel people already use — Trixta cannot compete here.</p>
                  </div>
                </div>
                <div className="vt-vc-point">
                  <div className="vt-vc-point-icon">🏥</div>
                  <div>
                    <h5>Healthcare vertical</h5>
                    <p>No global AI platform has built a POPIA-compliant healthcare admin layer for SA medical schemes and EHR systems. Synth owns this by default.</p>
                  </div>
                </div>
                <div className="vt-vc-point">
                  <div className="vt-vc-point-icon">💰</div>
                  <div>
                    <h5>Accessible price point</h5>
                    <p>At $15/month, Synth can acquire customers at 100x the volume of enterprise infrastructure platforms. Higher volume, faster growth, stronger network effects.</p>
                  </div>
                </div>
              </div>
              <p className="vt-vc-note">
                <strong>The acquisition thesis:</strong> Trixta is building infrastructure that enterprise
                teams need to build what Synth already is. A strategic acquirer — whether a Salesforce,
                Microsoft, or African telecoms group — looking to own the agentic layer in emerging markets
                will find Synth's distribution, verticals, and local market depth far more valuable than
                another infrastructure play. Synth is the end product. That's where the customer relationships live.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}