import { useState } from "react"

// ─── types ────────────────────────────────────────────────────────────────────
interface ComparisonRow {
  category: string
  feature: string
  nyla: { value: string; supported: "yes" | "no" | "partial" }
  synth:  { value: string; supported: "yes" | "no" | "partial" }
}

interface SectorRow {
  sector: string
  icon: string
  nyla: string
  synth: string
  winner: "nyla" | "synth" | "both"
}

// ─── comparison data ──────────────────────────────────────────────────────────
const comparisonRows: ComparisonRow[] = [
  // ── What it actually is ──
  {
    category: "Fundamentals",
    feature: "What it actually is",
    nyla: { value: "Consumer health app — symptom checker, doctor finder, medication tracker for patients", supported: "yes" },
    synth:  { value: "B2B AI operations platform — autonomous task execution across six business verticals", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Who it serves",
    nyla: { value: "Individual patients seeking healthcare information and appointments", supported: "yes" },
    synth:  { value: "Healthcare administrators, finance teams, sales teams, marketing teams, and individual professionals", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Primary interface",
    nyla: { value: "Mobile app (Google Play Store) — patient-facing consumer experience", supported: "yes" },
    synth:  { value: "WhatsApp & Telegram — works inside the apps teams already use every day", supported: "yes" },
  },
  {
    category: "Fundamentals",
    feature: "Time to first value",
    nyla: { value: "Minutes to download, but requires patient adoption before institutional value materialises", supported: "partial" },
    synth:  { value: "Under 3 minutes — connect your tools, start messaging, see immediate operational impact", supported: "yes" },
  },
  // ── Healthcare ──
  {
    category: "Healthcare",
    feature: "Patient symptom checking & doctor booking",
    nyla: { value: "Core feature — AI-powered symptom checker, appointment booking, medication ordering", supported: "yes" },
    synth:  { value: "Not a consumer feature — Synth serves the operations side, not the patient front door", supported: "no" },
  },
  {
    category: "Healthcare",
    feature: "Medical billing & claim denial resolution",
    nyla: { value: "Not available — Nyla AI is patient-facing; no claim coding, submission, or appeal workflows", supported: "no" },
    synth:  { value: "Built in — ICD-10/CPT/HCPCS coding, claim submission, denial tracking, and appeals — POPIA-compliant", supported: "yes" },
  },
  {
    category: "Healthcare",
    feature: "Revenue recovery for hospitals",
    nyla: { value: "No institutional revenue recovery tools — consumer adoption must come first", supported: "no" },
    synth:  { value: "Direct revenue impact — built to recover the R2.3 billion lost annually to unresolved claim denials in SA hospitals", supported: "yes" },
  },
  {
    category: "Healthcare",
    feature: "EMR & hospital dashboard",
    nyla: { value: "Beta feature — AI-powered EMR and patient/staff management dashboards for hospitals", supported: "partial" },
    synth:  { value: "Not an EMR — Synth integrates with existing EHR systems and adds an intelligent operations layer on top", supported: "partial" },
  },
  {
    category: "Healthcare",
    feature: "POPIA compliance",
    nyla: { value: "Not explicitly stated — consumer health data handling standards unclear", supported: "partial" },
    synth:  { value: "Built for South African compliance from day one — POPIA-aligned data handling and audit trails", supported: "yes" },
  },
  // ── Beyond Healthcare ──
  {
    category: "Beyond Healthcare",
    feature: "Marketing workflows",
    nyla: { value: "No marketing tools — healthcare-only scope", supported: "no" },
    synth:  { value: "Pre-built — campaign generation, competitor research, content, and analytics ready to use", supported: "yes" },
  },
  {
    category: "Beyond Healthcare",
    feature: "Sales automation",
    nyla: { value: "No sales capabilities — patient acquisition is organic, not systematic outreach", supported: "no" },
    synth:  { value: "Lead enrichment, outreach drafting, deal briefs, and CRM sync — out of the box", supported: "yes" },
  },
  {
    category: "Beyond Healthcare",
    feature: "Finance & analysis",
    nyla: { value: "No financial tools — no market data, modelling, or business reporting", supported: "no" },
    synth:  { value: "Live market data, financial modelling, report collection, and portfolio monitoring", supported: "yes" },
  },
  {
    category: "Beyond Healthcare",
    feature: "Personal AI assistant",
    nyla: { value: "Personal health assistant only — no general productivity or scheduling support", supported: "partial" },
    synth:  { value: "Full personal chief of staff — day planning, scheduling, travel, communications via WhatsApp", supported: "yes" },
  },
  // ── Integrations ──
  {
    category: "Integrations",
    feature: "South African healthcare tools",
    nyla: { value: "Hospital and pharmacy network — ecosystem approach within healthcare", supported: "partial" },
    synth:  { value: "Sage, GoodX, SA medical schemes, SARS eFiling — built for the local market across all verticals", supported: "yes" },
  },
  {
    category: "Integrations",
    feature: "Business tool connections",
    nyla: { value: "Healthcare-specific only — no general business tool connectors", supported: "no" },
    synth:  { value: "Sage, Xero, HubSpot, Salesforce, Google Workspace, Microsoft 365 — native connectors", supported: "yes" },
  },
  {
    category: "Integrations",
    feature: "Custom MCP / API access",
    nyla: { value: "Not mentioned — closed ecosystem approach", supported: "no" },
    synth:  { value: "Yes — custom MCP servers and REST API available for enterprise integration", supported: "yes" },
  },
  // ── Pricing & access ──
  {
    category: "Pricing",
    feature: "Entry price",
    nyla: { value: "Subscription plans for individuals, hospitals, and pharmacies — pricing not publicly listed", supported: "partial" },
    synth:  { value: "$15/month per seat — transparent, publicly listed pricing", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Healthcare / enterprise pricing",
    nyla: { value: "Custom hospital/pharmacy plans — pricing not disclosed", supported: "partial" },
    synth:  { value: "$499/facility/month — purpose-built for SA healthcare, POPIA-compliant", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Free tier or trial",
    nyla: { value: "Beta available on Google Play Store — subscription required for full features", supported: "partial" },
    synth:  { value: "Free during beta — no credit card required", supported: "yes" },
  },
  {
    category: "Pricing",
    feature: "Pricing transparency",
    nyla: { value: "Pricing not published on website — contact sales for hospital/pharmacy plans", supported: "no" },
    synth:  { value: "$15, $35, $195/month. Healthcare from $499/facility — all listed publicly", supported: "yes" },
  },
]

// ─── sector focus ─────────────────────────────────────────────────────────────
const sectors: SectorRow[] = [
  {
    sector: "Patient Health & Wellness",
    icon: "🩺",
    nyla: "Nyla AI's core strength. AI symptom checking, doctor booking, medication tracking, and wellness tools — built for the individual patient.",
    synth: "Not a consumer health app. Synth does not compete here — it serves the operations layer that hospitals use after the patient leaves.",
    winner: "nyla",
  },
  {
    sector: "Healthcare Admin & Revenue",
    icon: "🏥",
    nyla: "No claim denial resolution, no ICD-10/CPT coding, no revenue recovery. Nyla AI is the front door; it does not handle what happens after the patient walks out.",
    synth: "Claim denial resolution, ICD-10/CPT/HCPCS coding, payer rule monitoring, appointment scheduling, refill reminders — POPIA-compliant. Built to recover the R2.3 billion lost annually to unresolved claim denials.",
    winner: "synth",
  },
  {
    sector: "Marketing",
    icon: "📈",
    nyla: "No marketing tools. Nyla AI is healthcare-only and does not serve marketing teams.",
    synth: "Campaign generation, competitor intelligence, social content, email sequences, and marketing analytics — ready to use immediately.",
    winner: "synth",
  },
  {
    sector: "Sales",
    icon: "🤝",
    nyla: "No sales capabilities. CRM integration and outreach automation are outside Nyla AI's scope.",
    synth: "Lead enrichment, personalised outreach, deal briefs, CRM sync (Salesforce, HubSpot, Pipedrive) — out of the box.",
    winner: "synth",
  },
  {
    sector: "Finance",
    icon: "💹",
    nyla: "No financial tools. Market data, modelling, and reporting are not part of the Nyla AI ecosystem.",
    synth: "Live market analysis, DCF modelling, report collection for hundreds of firms, portfolio monitoring — delivered autonomously.",
    winner: "synth",
  },
  {
    sector: "Personal Productivity",
    icon: "🙋",
    nyla: "Personal health tracking only — symptom journals, medication reminders, wellness goals. No general productivity support.",
    synth: "Daily briefing, proactive alerts, autonomous task execution, long-term memory — via WhatsApp. No app download. A true personal chief of staff.",
    winner: "synth",
  },
]

// ─── helper components ────────────────────────────────────────────────────────
function SupportIcon({ level }: { level: "yes" | "no" | "partial" }) {
  if (level === "yes")    return <span className="vn-support vn-support-yes"  aria-label="Yes">✓</span>
  if (level === "no")     return <span className="vn-support vn-support-no"   aria-label="No">✗</span>
  return                         <span className="vn-support vn-support-part" aria-label="Partial">◐</span>
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VsNuvoAI() {
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
        .vn-page {
          font-family: 'Geist', 'Inter', system-ui, sans-serif;
          background: #F5F7FA;
          color: #0A0D14;
          min-height: 100vh;
        }

        /* ── wrap ── */
        .vn-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .vn-wrap-sm {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── hero ── */
        .vn-hero {
          padding: 88px 24px 72px;
          text-align: center;
          border-bottom: 1px solid rgba(10,13,20,0.07);
          position: relative;
          overflow: hidden;
        }
        .vn-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          pointer-events: none;
        }
        .vn-eyebrow {
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
        .vn-hero-headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -1.2px;
          color: #0A0D14;
          max-width: 800px;
          margin: 0 auto 18px;
        }
        .vn-hero-headline em {
          font-style: italic;
          color: #2563EB;
        }
        .vn-hero-sub {
          font-size: 16px;
          color: #445068;
          line-height: 1.7;
          max-width: 620px;
          margin: 0 auto 40px;
        }
        .vn-hero-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .vn-badge {
          font-size: 13px;
          font-weight: 600;
          border-radius: 999px;
          padding: 8px 18px;
          border: 1px solid;
        }
        .vn-badge-nyla {
          background: #0D1B2A;
          border-color: #0D1B2A;
          color: #fff;
        }
        .vn-badge-synth {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .vn-badge-vs {
          font-size: 11px;
          font-weight: 700;
          color: #8E9AB5;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* brand snippets */
        .vn-brand-inline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .vn-brand-inline img { height: 20px; width: auto; display: block; }
        .vn-brand-hero { display:flex; gap:16px; justify-content:center; align-items:center; margin-top:18px }
        .vn-mini-logo { height:50px; width:auto; display:inline-block; vertical-align:middle; border-radius:8px; }
        .vn-logo-synth { height:120px; width:auto; display:inline-block; vertical-align:middle; border-radius:8px; }

        /* ── stack callout ── */
        .vn-stack-callout {
          background: #0A0D14;
          border-radius: 16px;
          padding: 32px;
          max-width: 760px;
          margin: 0 auto 48px;
          text-align: left;
        }
        .vn-stack-callout h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 22px;
          font-weight: 400;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 12px;
        }
        .vn-stack-callout p {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0;
        }
        .vn-stack-callout strong {
          color: rgba(255,255,255,0.85);
        }

        /* ── TL;DR callout ── */
        .vn-tldr {
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
        .vn-tldr-col h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .vn-tldr-col-nyla h4 { color: #0D1B2A; }
        .vn-tldr-col-synth  h4 { color: #2563EB; }
        .vn-tldr-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .vn-tldr-col li {
          font-size: 13px;
          color: #445068;
          display: flex;
          align-items: flex-start;
          gap: 7px;
          line-height: 1.5;
        }
        .vn-tldr-col li::before {
          content: '·';
          font-weight: 700;
          flex-shrink: 0;
        }
        .vn-tldr-col-nyla li::before { color: #0D1B2A; }
        .vn-tldr-col-synth  li::before { color: #2563EB; }

        /* ── section ── */
        .vn-section {
          padding: 72px 0;
          border-bottom: 1px solid rgba(10,13,20,0.07);
        }
        .vn-section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2563EB;
          text-align: center;
          margin-bottom: 10px;
        }
        .vn-section-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.5px;
          color: #0A0D14;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.15;
        }
        .vn-section-sub {
          font-size: 15px;
          color: #445068;
          text-align: center;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 44px;
        }

        /* ── handoff section ── */
        .vn-handoff {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 36px;
          max-width: 860px;
          margin: 0 auto;
        }
        .vn-handoff h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: #0A0D14;
          letter-spacing: -0.3px;
          margin-bottom: 8px;
          text-align: center;
        }
        .vn-handoff-sub {
          font-size: 14px;
          color: #6B7A99;
          text-align: center;
          margin-bottom: 32px;
        }
        .vn-handoff-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          position: relative;
        }
        .vn-handoff-grid::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(10,13,20,0.08);
        }
        .vn-handoff-col {
          padding: 0 28px;
        }
        .vn-handoff-col-nyla { text-align: right; }
        .vn-handoff-col-synth { text-align: left; }
        .vn-handoff-col h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .vn-handoff-col-nyla h4 { color: #0D1B2A; }
        .vn-handoff-col-synth h4 { color: #2563EB; }
        .vn-handoff-step {
          margin-bottom: 18px;
        }
        .vn-handoff-step-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #8E9AB5;
          margin-bottom: 4px;
        }
        .vn-handoff-step-text {
          font-size: 13px;
          color: #445068;
          line-height: 1.6;
          margin: 0;
        }
        .vn-handoff-arrow {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          background: #2563EB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          z-index: 2;
        }
        .vn-handoff-cta {
          text-align: center;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(10,13,20,0.07);
        }
        .vn-handoff-cta p {
          font-size: 14px;
          color: #445068;
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }
        .vn-handoff-cta strong {
          color: #0A0D14;
        }

        /* ── feature table ── */
        .vn-filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .vn-filter-tab {
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
        .vn-filter-tab.active,
        .vn-filter-tab:hover {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .vn-table {
          max-width: 900px;
          margin: 0 auto;
          border-radius: 16px;
          border: 1px solid rgba(10,13,20,0.08);
          overflow: hidden;
        }
        .vn-table-head {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          background: #0A0D14;
        }
        .vn-th {
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .vn-th-feature  { color: rgba(255,255,255,0.35); }
        .vn-th-nyla     { color: rgba(255,255,255,0.5); }
        .vn-th-synth    { color: #60A5FA; }

        .vn-category-row {
          background: #F0F4FA;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8E9AB5;
          border-top: 1px solid rgba(10,13,20,0.06);
        }

        .vn-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr;
          border-top: 1px solid rgba(10,13,20,0.05);
          background: #fff;
          transition: background 0.1s;
        }
        .vn-row:hover { background: #F8FAFF; }
        .vn-cell {
          padding: 13px 18px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }
        .vn-cell-feature { font-weight: 500; color: #0A0D14; }
        .vn-cell-nyla    { color: #6B7A99; }
        .vn-cell-synth   { color: #1E3A5F; }

        .vn-support {
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
        .vn-support-yes  { background: #DCFCE7; color: #16A34A; }
        .vn-support-no   { background: #FEE2E2; color: #DC2626; }
        .vn-support-part { background: #FEF9C3; color: #CA8A04; }

        .vn-show-more {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
        .vn-show-more-btn {
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
        .vn-show-more-btn:hover {
          background: #EFF6FF;
          border-color: #2563EB;
        }

        /* ── sector grid ── */
        .vn-sector-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 900px;
          margin: 0 auto;
        }
        .vn-sector-card {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .vn-sector-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .vn-sector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 0;
        }
        .vn-sector-name {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          font-weight: 600;
          color: #0A0D14;
        }
        .vn-sector-icon { font-size: 18px; }
        .vn-sector-winner {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-radius: 999px;
          padding: 3px 10px;
        }
        .vn-winner-synth   { background: #EFF6FF; color: #2563EB; }
        .vn-winner-nyla    { background: #F0F0FF; color: #4338CA; }
        .vn-winner-both    { background: #F0FDF4; color: #16A34A; }
        .vn-sector-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 12px 18px 16px;
        }
        .vn-sector-col {
          padding: 10px 12px;
          border-radius: 8px;
        }
        .vn-sector-col-nyla { background: #F8F8FC; margin-right: 6px; }
        .vn-sector-col-synth  { background: #F0F7FF; margin-left: 6px; }
        .vn-sector-col-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .vn-sector-col-nyla .vn-sector-col-label { color: #9CA3AF; }
        .vn-sector-col-synth  .vn-sector-col-label { color: #3B82F6; }
        .vn-sector-col-text {
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }
        .vn-sector-col-nyla .vn-sector-col-text { color: #6B7A99; }
        .vn-sector-col-synth  .vn-sector-col-text { color: #1E3A5F; }

        /* ── platform superpower callout ── */
        .vn-superpower {
          background: #0A0D14;
          border-radius: 16px;
          padding: 36px;
          max-width: 860px;
          margin: 0 auto;
        }
        .vn-superpower h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 8px;
          text-align: center;
        }
        .vn-superpower-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          text-align: center;
          margin-bottom: 28px;
        }
        .vn-superpower-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .vn-superpower-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .vn-superpower-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .vn-superpower-card h5 {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }
        .vn-superpower-card p {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
          margin: 0;
        }
        .vn-superpower-note {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          text-align: center;
        }
        .vn-superpower-note p {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          margin: 0;
        }
        .vn-superpower-note strong {
          color: rgba(255,255,255,0.8);
        }

        /* ── vc callout ── */
        .vn-vc-box {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 16px;
          padding: 36px;
          max-width: 860px;
          margin: 0 auto;
        }
        .vn-vc-box h3 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 24px;
          font-weight: 400;
          color: #0A0D14;
          letter-spacing: -0.3px;
          margin-bottom: 14px;
        }
        .vn-vc-points {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .vn-vc-point {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          background: #F5F7FA;
          border-radius: 10px;
        }
        .vn-vc-point-icon {
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
        .vn-vc-point h5 {
          font-size: 13px;
          font-weight: 600;
          color: #0A0D14;
          margin-bottom: 3px;
        }
        .vn-vc-point p {
          font-size: 12px;
          color: #445068;
          line-height: 1.55;
          margin: 0;
        }
        .vn-vc-note {
          font-size: 13px;
          color: #6B7A99;
          line-height: 1.7;
          border-top: 1px solid rgba(10,13,20,0.07);
          padding-top: 20px;
        }
        .vn-vc-note strong { color: #0A0D14; }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .vn-tldr          { grid-template-columns: 1fr; }
          .vn-table-head,
          .vn-row           { grid-template-columns: 1.4fr 1fr; }
          .vn-th-feature,
          .vn-cell-feature  { display: none; }
          .vn-sector-body   { grid-template-columns: 1fr; }
          .vn-sector-col-nyla { margin-right: 0; margin-bottom: 6px; }
          .vn-sector-col-synth  { margin-left: 0; }
          .vn-handoff-grid  { grid-template-columns: 1fr; }
          .vn-handoff-grid::before { display: none; }
          .vn-handoff-col-nyla { text-align: left; padding: 0; margin-bottom: 20px; }
          .vn-handoff-col-synth { padding: 0; }
          .vn-handoff-arrow { display: none; }
          .vn-superpower-grid { grid-template-columns: 1fr; }
          .vn-vc-points     { grid-template-columns: 1fr; }
          .vn-logo-synth { height:90px; }
          .vn-mini-logo { height:40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      <div className="vn-page">

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section className="vn-hero">
          <div className="vn-eyebrow">Platform comparison</div>
          <h1 className="vn-hero-headline">
            Nyla AI built the front door<br />to African healthcare.<br />
            <em>Synth built what runs behind it.</em>
          </h1>
          <p className="vn-hero-sub">
            Nyla AI is a genuinely useful consumer health app — symptom checking, doctor booking,
            medication tracking. It is closer to a better Zocdoc than it is to an autonomous operations platform.
            Synth is the B2B infrastructure layer that makes products like Nyla AI possible —
            and covers five other verticals where Nyla AI does not compete at all.
          </p>
          <div className="vn-hero-badges">
            <div className="vn-brand-hero">
              <div className="vn-brand-inline" aria-hidden>
                <img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" />
              </div>
              <span className="vn-badge-vs">VS</span>
              <div className="vn-brand-inline" aria-hidden>
                <img src="/logo.png" alt="Synth" className="vn-logo-synth" />
              </div>
            </div>
          </div>

          {/* Stack positioning callout */}
          <div className="vn-stack-callout">
            <h3>This is not a competition. It is a stack.</h3>
            <p>
              Nyla AI operates at the <strong>consumer layer</strong> — the front door patients walk through.
              Synth operates at the <strong>operations layer</strong> — the engine that processes claims,
              manages denials, codes procedures, and ensures revenue actually flows. These are not two
              companies solving "different problems." They are two companies operating at completely
              different layers of the same healthcare value chain. Synth is the infrastructure that
              makes the front door financially sustainable.
            </p>
          </div>

          {/* TL;DR */}
          <div className="vn-tldr">
            <div className="vn-tldr-col vn-tldr-col-nyla">
              <h4>
              <span className="vn-brand-inline">
                <img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" />
                <span>Nyla AI — Consumer Health App</span>
              </span>
            </h4>
              <ul>
                <li>Patient-facing symptom checker and doctor finder</li>
                <li>Medication tracking and wellness tools</li>
                <li>Appointment booking for individuals</li>
                <li>Hospital EMR dashboards (beta)</li>
                <li>One vertical: healthcare only</li>
                <li>Requires consumer adoption before institutional value</li>
              </ul>
            </div>
            <div className="vn-tldr-col vn-tldr-col-synth">
              <h4>
              <span className="vn-brand-inline">
                <img src="/logo.png" alt="Synth" className="vn-logo-synth" />
                <span>Synth — B2B AI Operations Platform</span>
              </span>
            </h4>
              <ul>
                <li>Autonomous task execution across six business verticals</li>
                <li>Healthcare admin: claim denials, ICD-10/CPT coding, revenue recovery</li>
                <li>Marketing, Sales, Finance, Product, Personal — all ready to use</li>
                <li>Live in under 3 minutes via WhatsApp — no app download</li>
                <li>Built for South Africa: Sage, GoodX, SA medical schemes, SARS eFiling</li>
                <li>POPIA-compliant from day one</li>
                <li>From $15/month — transparent, publicly listed pricing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ══ WHAT HAPPENS AFTER THE PATIENT LEAVES ═══════════════════════════ */}
        <section className="vn-section">
          <div className="vn-wrap">
            <p className="vn-section-eyebrow">The invisible handoff</p>
            <h2 className="vn-section-title">
              What happens after the patient leaves?
            </h2>
            <p className="vn-section-sub">
              Nyla AI's job ends when the patient walks out of the clinic.
              Synth's job starts. That handoff is where billions in revenue are lost — and recovered.
            </p>

            <div className="vn-handoff">
              <h3>The moment of value creation</h3>
              <p className="vn-handoff-sub">Nyla AI books the appointment. Synth ensures the hospital gets paid.</p>
              <div className="vn-handoff-grid">
                <div className="vn-handoff-col vn-handoff-col-nyla">
                  <h4><span className="vn-brand-inline"><img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" /> <span>Nyla AI — Before the visit</span></span></h4>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 1</p>
                    <p className="vn-handoff-step-text">Patient checks symptoms using AI-powered chat</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 2</p>
                    <p className="vn-handoff-step-text">Patient books appointment with a doctor through the app</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 3</p>
                    <p className="vn-handoff-step-text">Patient arrives at clinic, receives care</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 4</p>
                    <p className="vn-handoff-step-text">Patient walks out. Nyla AI's job is done.</p>
                  </div>
                </div>
                <div className="vn-handoff-arrow">→</div>
                <div className="vn-handoff-col vn-handoff-col-synth">
                  <h4><span className="vn-brand-inline"><img src="/logo.png" alt="Synth" className="vn-logo-synth" /> <span>Synth — After the visit</span></span></h4>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 1</p>
                    <p className="vn-handoff-step-text">Procedure is automatically coded (ICD-10/CPT/HCPCS)</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 2</p>
                    <p className="vn-handoff-step-text">Claim is submitted to the medical scheme electronically</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 3</p>
                    <p className="vn-handoff-step-text">Claim is tracked; denials are flagged automatically</p>
                  </div>
                  <div className="vn-handoff-step">
                    <p className="vn-handoff-step-label">Step 4</p>
                    <p className="vn-handoff-step-text">Denied claims are appealed with corrected coding — revenue recovered</p>
                  </div>
                </div>
              </div>
              <div className="vn-handoff-cta">
                <p>
                  <strong>South African hospitals lose an estimated R2.3 billion annually</strong> to unresolved claim denials.
                  Nyla AI cannot touch that problem — its entire product philosophy is consumer-facing.
                  Synth's healthcare module is built specifically to recover that revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTOR FOCUS ══════════════════════════════════════════════════════ */}
        <section className="vn-section">
          <div className="vn-wrap">
            <p className="vn-section-eyebrow">Sector by sector</p>
            <h2 className="vn-section-title">
              One vertical vs. six. That is the real gap.
            </h2>
            <p className="vn-section-sub">
              Nyla AI does one thing well: patient health. Synth does that same hospital's
              admin, plus its marketing, sales, finance, and procurement — all through WhatsApp.
            </p>
            <div className="vn-sector-grid">
              {sectors.map((s, i) => (
                <div key={i} className="vn-sector-card">
                  <div className="vn-sector-header">
                    <div className="vn-sector-name">
                      <span className="vn-sector-icon">{s.icon}</span>
                      {s.sector}
                    </div>
                    <span className={`vn-sector-winner ${
                      s.winner === "synth" ? "vn-winner-synth" :
                      s.winner === "nyla"  ? "vn-winner-nyla" :
                      "vn-winner-both"
                    }`}>
                      {s.winner === "synth" ? <span className="vn-brand-inline"><img src="/logo.png" alt="Synth" className="vn-logo-synth" /> <span>Synth wins</span></span> :
                       s.winner === "nyla"  ? <span className="vn-brand-inline"><img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" /> <span>Nyla AI wins</span></span> :
                       "Both work"}
                    </span>
                  </div>
                  <div className="vn-sector-body">
                    <div className="vn-sector-col vn-sector-col-nyla">
                      <p className="vn-sector-col-label vn-brand-inline"><img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" /> <span>Nyla AI</span></p>
                      <p className="vn-sector-col-text">{s.nyla}</p>
                    </div>
                    <div className="vn-sector-col vn-sector-col-synth">
                      <p className="vn-sector-col-label vn-brand-inline"><img src="/logo.png" alt="Synth" className="vn-logo-synth" /> <span>Synth</span></p>
                      <p className="vn-sector-col-text">{s.synth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PLATFORM SUPERPOWER ═════════════════════════════════════════════ */}
        <section className="vn-section">
          <div className="vn-wrap">
            <p className="vn-section-eyebrow">The lock-in story</p>
            <h2 className="vn-section-title">
              Healthcare is just one of six verticals
            </h2>
            <p className="vn-section-sub">
              A hospital administrator who buys Synth for claim denials also gets a personal assistant,
              a finance analysis tool, and a sales automation engine for their procurement team.
              Nyla AI gives that same administrator nothing outside of healthcare.
            </p>

            <div className="vn-superpower">
              <h3>Synth's six verticals</h3>
              <p className="vn-superpower-sub">One platform. Six business functions. Zero engineering required.</p>
              <div className="vn-superpower-grid">
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">🏥</div>
                  <h5>Healthcare Admin</h5>
                  <p>Claim denials, ICD-10/CPT coding, payer rules, scheduling, refill reminders</p>
                </div>
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">📈</div>
                  <h5>Marketing</h5>
                  <p>Campaign generation, competitor research, content, email sequences, analytics</p>
                </div>
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">🤝</div>
                  <h5>Sales</h5>
                  <p>Lead enrichment, outreach drafting, deal briefs, CRM sync</p>
                </div>
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">💹</div>
                  <h5>Finance</h5>
                  <p>Live market data, DCF modelling, report collection, portfolio monitoring</p>
                </div>
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">🧩</div>
                  <h5>Product</h5>
                  <p>Strategy docs, roadmaps, PRDs, market segmentation, competitive maps</p>
                </div>
                <div className="vn-superpower-card">
                  <div className="vn-superpower-icon">🙋</div>
                  <h5>Personal</h5>
                  <p>Daily briefing, proactive alerts, scheduling, travel, communications</p>
                </div>
              </div>
              <div className="vn-superpower-note">
                <p>
                  <strong>This is the platform advantage.</strong> Nyla AI is a point solution.
                  Synth is a platform that compounds value with every new vertical a customer adopts.
                  That is why platforms get acquired at higher multiples than point solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURE TABLE ══════════════════════════════════════════════════════ */}
        <section className="vn-section">
          <div className="vn-wrap">
            <p className="vn-section-eyebrow">Feature comparison</p>
            <h2 className="vn-section-title">
              Feature by feature, honestly
            </h2>
            <p className="vn-section-sub">
              We describe Nyla AI accurately and generously — because accurate description
              is the only respect a competitor deserves on a comparison page.
            </p>

            {/* Category filter */}
            <div className="vn-filter-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`vn-filter-tab ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => { setActiveCategory(cat); setShowAll(false); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="vn-table">
              <div className="vn-table-head">
                <div className="vn-th vn-th-feature">Feature</div>
                <div className="vn-th vn-th-nyla"><img src="/Nyla-AI.png" alt="Nyla AI" className="vn-mini-logo" /></div>
                <div className="vn-th vn-th-synth"><img src="/logo.png" alt="Synth" className="vn-logo-synth" /></div>
              </div>

              {visibleRows.map((row, i) => {
                const prevRow = filteredRows[i - 1]
                const showCategory = !prevRow || prevRow.category !== row.category

                return (
                  <div key={i}>
                    {showCategory && activeCategory === "All" && (
                      <div className="vn-category-row">{row.category}</div>
                    )}
                    <div className="vn-row">
                      <div className="vn-cell vn-cell-feature">{row.feature}</div>
                      <div className="vn-cell vn-cell-nyla">
                        <SupportIcon level={row.nyla.supported} />
                        {row.nyla.value}
                      </div>
                      <div className="vn-cell vn-cell-synth">
                        <SupportIcon level={row.synth.supported} />
                        {row.synth.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!showAll && filteredRows.length > 8 && (
              <div className="vn-show-more">
                <button className="vn-show-more-btn" onClick={() => setShowAll(true)}>
                  Show all {filteredRows.length} features ↓
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ VC CALLOUT ════════════════════════════════════════════════════════ */}
        <section className="vn-section">
          <div className="vn-wrap">
            <p className="vn-section-eyebrow">For investors</p>
            <h2 className="vn-section-title">Why this comparison matters to VCs</h2>
            <p className="vn-section-sub">
              Nyla AI and Synth are not competitors. They are adjacent layers in the same stack.
              That adjacency is the opportunity.
            </p>

            <div className="vn-vc-box">
              <h3>Synth occupies the layer Nyla AI cannot reach</h3>
              <div className="vn-vc-points">
                <div className="vn-vc-point">
                  <div className="vn-vc-point-icon">🏥</div>
                  <div>
                    <h5>Institutional revenue recovery</h5>
                    <p>Claim denials represent billions in uncollected revenue across SA hospitals. Nyla AI has no answer. Synth is built specifically to recover it.</p>
                  </div>
                </div>
                <div className="vn-vc-point">
                  <div className="vn-vc-point-icon">📱</div>
                  <div>
                    <h5>Distribution moat</h5>
                    <p>WhatsApp has 90%+ penetration in South Africa. Synth delivers AI through the channel hospitals and businesses already use — no app download required.</p>
                  </div>
                </div>
                <div className="vn-vc-point">
                  <div className="vn-vc-point-icon">🧩</div>
                  <div>
                    <h5>Platform breadth</h5>
                    <p>Synth covers six verticals. A hospital that adopts Synth for healthcare admin also gets marketing, sales, finance, and personal productivity — automatic lock-in.</p>
                  </div>
                </div>
                <div className="vn-vc-point">
                  <div className="vn-vc-point-icon">💰</div>
                  <div>
                    <h5>Accessible price point</h5>
                    <p>At $15/month, Synth can acquire customers at volume. At $499/facility for healthcare, it captures institutional budgets Nyla AI cannot access without consumer adoption first.</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

      </div>
    </>
  )
}