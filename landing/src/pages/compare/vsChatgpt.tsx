import { useState } from "react"

// ─── types ────────────────────────────────────────────────────────────────────
interface ComparisonRow {
  feature: string
  chatgpt: { value: string; supported: "yes" | "no" | "partial" }
  synth:   { value: string; supported: "yes" | "no" | "partial" }
}

interface UseCase {
  icon: string
  scenario: string
  chatgpt: string
  synth: string
  verdict: "synth" | "chatgpt" | "both"
}

// ─── data ─────────────────────────────────────────────────────────────────────
const comparisonRows: ComparisonRow[] = [
  {
    feature: "Task execution",
    chatgpt: { value: "Tells you what to do", supported: "partial" },
    synth:   { value: "Does it for you — end to end", supported: "yes" },
  },
  {
    feature: "Works while you're offline",
    chatgpt: { value: "No — needs you in the loop at every step", supported: "no" },
    synth:   { value: "Yes — runs tasks in the background autonomously", supported: "yes" },
  },
  {
    feature: "Proactive alerts",
    chatgpt: { value: "Never — waits to be asked", supported: "no" },
    synth:   { value: "Yes — pushes urgent tasks and flags conflicts before you notice", supported: "yes" },
  },
  {
    feature: "Morning briefing",
    chatgpt: { value: "Not available", supported: "no" },
    synth:   { value: "Daily plan delivered to your WhatsApp before 7 AM", supported: "yes" },
  },
  {
    feature: "Works in WhatsApp & Telegram",
    chatgpt: { value: "No — requires the ChatGPT app or browser", supported: "no" },
    synth:   { value: "Yes — works in apps you already use every day", supported: "yes" },
  },
  {
    feature: "Long-term memory",
    chatgpt: { value: "Limited — memory can be enabled but is shallow", supported: "partial" },
    synth:   { value: "Deep — remembers your people, preferences, and patterns over months", supported: "yes" },
  },
  {
    feature: "Multi-step autonomous workflows",
    chatgpt: { value: "Sequential — one step at a time with your guidance", supported: "partial" },
    synth:   { value: "Parallel — multiple agents execute simultaneously", supported: "yes" },
  },
  {
    feature: "Business tool integrations",
    chatgpt: { value: "Limited plugins — no deep CRM, ERP, or accounting connections", supported: "partial" },
    synth:   { value: "Sage, Xero, Salesforce, HubSpot, Google Workspace, and more", supported: "yes" },
  },
  {
    feature: "Healthcare admin",
    chatgpt: { value: "Not designed for claims, codes, or payer rules", supported: "no" },
    synth:   { value: "ICD-10 coding, claim denial resolution, scheduling, refill reminders", supported: "yes" },
  },
  {
    feature: "POPIA / local compliance (SA)",
    chatgpt: { value: "No local compliance framework for SA", supported: "no" },
    synth:   { value: "POPIA-compliant, data residency in South Africa", supported: "yes" },
  },
  {
    feature: "Delivers finished outputs",
    chatgpt: { value: "Gives you pieces to assemble yourself", supported: "partial" },
    synth:   { value: "Delivers the finished product — booked, sent, submitted, done", supported: "yes" },
  },
  {
    feature: "Pricing",
    chatgpt: { value: "From $20/month (ChatGPT Plus)", supported: "partial" },
    synth:   { value: "From $15/month — same power, built for execution", supported: "yes" },
  },
]

const useCases: UseCase[] = [
  {
    icon: "🌅",
    scenario: "Starting your work day",
    chatgpt: "You open ChatGPT, paste your schedule, and ask what to prioritise. You repeat this every morning. You're doing the thinking.",
    synth:   "Synth sends you a briefing at 6:45 AM — meetings prepped, urgent emails flagged, your day already planned. You read, you act.",
    verdict: "synth",
  },
  {
    icon: "📊",
    scenario: "Competitor research for a strategy meeting",
    chatgpt: "ChatGPT summarises what it knows up to its training cutoff. You still need to verify everything, find current data, and format the output yourself.",
    synth:   "Synth browses live sources, pulls pricing pages, reads press releases, builds a structured comparison doc, and posts it to your Slack — before the meeting starts.",
    verdict: "synth",
  },
  {
    icon: "💬",
    scenario: "Brainstorming and creative thinking",
    chatgpt: "ChatGPT is excellent here — fast, articulate, endlessly patient with iteration. It's the best thinking partner for open-ended exploration.",
    synth:   "Synth can help, but for pure ideation and creative back-and-forth, ChatGPT's conversational depth is genuinely stronger.",
    verdict: "chatgpt",
  },
  {
    icon: "❌",
    scenario: "Resolving a denied insurance claim",
    chatgpt: "ChatGPT can explain what a denial code means. It cannot access your claims system, draft a compliant appeal, or track the resubmission deadline.",
    synth:   "Synth identifies the denial reason, drafts the appeal using the payer's specific requirements, logs the deadline, and tracks the outcome — automatically.",
    verdict: "synth",
  },
  {
    icon: "✈️",
    scenario: "Booking a business trip",
    chatgpt: "ChatGPT suggests flight options based on general knowledge. It cannot search live prices, book anything, or add the trip to your calendar.",
    synth:   "Synth searches live prices, books within your stated budget, adds flights and hotel to your calendar, and notifies you if prices drop — in one WhatsApp message.",
    verdict: "synth",
  },
  {
    icon: "💊",
    scenario: "Managing chronic patient prescriptions",
    chatgpt: "ChatGPT can explain what a drug does or describe best practices. It has no access to patient records, cannot send reminders, and was not built for clinical workflows.",
    synth:   "Synth identifies patients due for refills, sends personalised WhatsApp reminders, and logs confirmations — POPIA-compliant and connected to your EHR system.",
    verdict: "synth",
  },
  {
    icon: "📝",
    scenario: "Writing and editing content",
    chatgpt: "ChatGPT is a world-class writing assistant — drafts, edits, rewrites, tone adjustments. For pure writing quality and conversational refinement, it remains exceptional.",
    synth:   "Synth can write and draft, but if your goal is iteration, nuance, and creative refinement of language, ChatGPT's depth here is hard to beat.",
    verdict: "chatgpt",
  },
  {
    icon: "🤝",
    scenario: "Preparing for a sales meeting",
    chatgpt: "ChatGPT can help you structure talking points if you paste in the context. You do the research. You find the info. You assemble the brief.",
    synth:   "Synth researches the prospect, pulls their latest news, identifies likely objections, and delivers a formatted brief to your WhatsApp an hour before the call.",
    verdict: "synth",
  },
]

// ─── helper components ────────────────────────────────────────────────────────
function SupportIcon({ level }: { level: "yes" | "no" | "partial" }) {
  if (level === "yes")     return <span className="support-icon support-yes"  aria-label="Yes">✓</span>
  if (level === "no")      return <span className="support-icon support-no"   aria-label="No">✗</span>
  return                          <span className="support-icon support-part" aria-label="Partial">◐</span>
}

function VerdictBadge({ verdict }: { verdict: UseCase["verdict"] }) {
  if (verdict === "synth")   return <span className="verdict-badge verdict-synth">Use Synth</span>
  if (verdict === "chatgpt") return <span className="verdict-badge verdict-chatgpt">Use ChatGPT</span>
  return                            <span className="verdict-badge verdict-both">Either works</span>
}

// ─── task theatre ─────────────────────────────────────────────────────────────
// The signature element: same task, two very different outcomes shown side by side.
function TaskTheatre() {
  const [active, setActive] = useState(0)

  const tasks = [
    {
      prompt: "Research our top 5 competitors and get it into Slack before the 3 PM strategy meeting.",
      chatgptResponse: "Sure! Here's a framework for researching your top 5 competitors:\n\n1. Identify your competitors using Google, Crunchbase, or LinkedIn.\n2. Visit each company's website and note their:\n   • Pricing page\n   • Key features\n   • Recent blog posts\n3. Check G2 or Capterra for reviews.\n4. Compile findings in a spreadsheet.\n5. Share to Slack manually.\n\nWould you like me to help you draft the message once you've gathered the data?",
      chatgptLabel: "ChatGPT gave you a to-do list. You still have to do the work.",
      synthResponse: "✓ Done — posted to #strategy 47 minutes before your meeting.\n\nI browsed all 5 competitor sites live, pulled current pricing, read their last 3 press releases, and flagged two pricing changes since last quarter. The doc is in Google Drive too.",
      synthLabel: "Synth did the research, built the doc, and posted to Slack. You opened WhatsApp once.",
    },
    {
      prompt: "Book a flight to Johannesburg on Thursday under R4,500 and add it to my calendar.",
      chatgptResponse: "Here are some tips for finding affordable flights to Johannesburg:\n\n• Try Google Flights or Skyscanner for price comparisons.\n• FlySafair and Airlink often have competitive fares on domestic routes.\n• Booking early in the morning can sometimes yield lower prices.\n• Make sure to check for baggage fees which may push total cost above R4,500.\n\nOnce you've found a flight, you can add it to Google Calendar manually or use the 'Add to calendar' option in your confirmation email.",
      chatgptLabel: "ChatGPT gave you tips. You still need to search, compare, book, and add it yourself.",
      synthResponse: "✓ Booked. FlySafair JNB, Thursday 07h10, R3,890. Confirmation sent to your email. Added to your calendar with a reminder to leave for the airport by 05h30.\n\nWant me to book a hotel near Sandton too?",
      synthLabel: "Synth searched live, booked within your budget, and added it to your calendar. One message.",
    },
    {
      prompt: "Send refill reminders to all diabetic patients who haven't collected their metformin this month.",
      chatgptResponse: "To manage prescription refill reminders for diabetic patients, you could:\n\n1. Export a list of patients from your EHR system.\n2. Filter by diagnosis code (E11 for Type 2 diabetes) and medication (metformin).\n3. Cross-reference with your dispensing records.\n4. Draft a WhatsApp or SMS message template.\n5. Send via your preferred communication platform.\n\nNote: Ensure all communications comply with POPIA requirements.",
      chatgptLabel: "ChatGPT described a 5-step manual process. Your staff still need to do all of it.",
      synthResponse: "✓ 34 patients identified. Personalised WhatsApp reminders sent to all 34. 18 have already confirmed collection. 6 requested delivery — I've flagged those for your pharmacist.\n\nAll activity logged in GoodX with timestamps.",
      synthLabel: "Synth connected to your EHR, identified patients, sent reminders, and logged everything. Zero manual work.",
    },
  ]

  const task = tasks[active]

  return (
    <div className="theatre-wrap">
      {/* Task selector */}
      <div className="theatre-tabs">
        {tasks.map((_, i) => (
          <button
            key={i}
            className={`theatre-tab ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            Task {i + 1}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div className="theatre-prompt">
        <span className="theatre-prompt-label">The task</span>
        <p className="theatre-prompt-text">"{task.prompt}"</p>
      </div>

      {/* Side by side */}
      <div className="theatre-split">
        {/* ChatGPT side */}
        <div className="theatre-side theatre-chatgpt">
          <div className="theatre-side-header">
            <span className="theatre-brand theatre-brand-chatgpt">ChatGPT</span>
          </div>
          <div className="theatre-output theatre-output-chatgpt">
            <pre className="theatre-pre">{task.chatgptResponse}</pre>
          </div>
          <p className="theatre-verdict theatre-verdict-chatgpt">
            ⚠ {task.chatgptLabel}
          </p>
        </div>

        {/* VS divider */}
        <div className="theatre-vs">vs</div>

        {/* Synth side */}
        <div className="theatre-side theatre-synth">
          <div className="theatre-side-header">
            <span className="theatre-brand theatre-brand-synth">Synth</span>
          </div>
          <div className="theatre-output theatre-output-synth">
            <pre className="theatre-pre">{task.synthResponse}</pre>
          </div>
          <p className="theatre-verdict theatre-verdict-synth">
            ✓ {task.synthLabel}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VsChatGPT() {
  const [showAll, setShowAll] = useState(false)
  const visibleRows = showAll ? comparisonRows : comparisonRows.slice(0, 7)

  return (
    <>
      {/* ── global styles ── */}
      <style>{`
        /* ── page ── */
        .vs-page {
          font-family: 'Geist', 'Inter', system-ui, sans-serif;
          background: #F5F7FA;
          color: #0A0D14;
          min-height: 100vh;
        }

        /* ── hero ── */
        .vs-hero {
          text-align: center;
          padding: 88px 24px 72px;
          border-bottom: 1px solid rgba(10,13,20,0.07);
          position: relative;
          overflow: hidden;
        }
        .vs-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
          pointer-events: none;
        }
        .vs-eyebrow {
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
        .vs-hero-headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(36px, 5.5vw, 64px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #0A0D14;
          max-width: 760px;
          margin: 0 auto 16px;
        }
        .vs-hero-headline em {
          font-style: italic;
          color: #2563EB;
        }
        .vs-hero-sub {
          font-size: 16px;
          color: #445068;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 36px;
        }
        .vs-hero-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .vs-badge {
          font-size: 13px;
          font-weight: 500;
          border-radius: 999px;
          padding: 7px 16px;
          border: 1px solid;
        }
        .vs-badge-chatgpt {
          background: #F8F7F5;
          border-color: rgba(10,13,20,0.12);
          color: #445068;
        }
        .vs-badge-synth {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .vs-badge-vs {
          font-size: 12px;
          font-weight: 700;
          color: #8E9AB5;
          letter-spacing: 1px;
        }

        /* ── brand comparison cards (logo + name) ── */
        .brand-compare {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .brand-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid rgba(10,13,20,0.06);
          padding: 10px 14px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(2,6,23,0.04);
          min-width: 160px;
        }
        .brand-card img { height: 60px; width: auto; display: block; }
        .brand-name { font-weight: 600; color: #0A0D14; font-size: 14px; }
        .brand-name.small { color: #6B7280; font-weight:500; font-size:13px }

        /* ── wrap ── */
        .vs-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── section ── */
        .vs-section {
          padding: 72px 0;
          border-bottom: 1px solid rgba(10,13,20,0.07);
        }
        .vs-section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2563EB;
          text-align: center;
          margin-bottom: 10px;
        }
        .vs-section-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 400;
          letter-spacing: -0.5px;
          color: #0A0D14;
          text-align: center;
          margin-bottom: 8px;
        }
        .vs-section-sub {
          font-size: 15px;
          color: #445068;
          text-align: center;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 48px;
        }

        /* ── task theatre ── */
        .theatre-wrap {
          max-width: 880px;
          margin: 0 auto;
        }
        .theatre-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          justify-content: center;
        }
        .theatre-tab {
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
        .theatre-tab.active,
        .theatre-tab:hover {
          background: #2563EB;
          border-color: #2563EB;
          color: #fff;
        }
        .theatre-prompt {
          background: #0A0D14;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .theatre-prompt-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
          padding-top: 2px;
        }
        .theatre-prompt-text {
          font-size: 14px;
          color: #fff;
          line-height: 1.6;
          font-style: italic;
          margin: 0;
        }
        .theatre-split {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: start;
        }
        .theatre-side {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(10,13,20,0.08);
        }
        .theatre-side-header {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(10,13,20,0.07);
        }
        .theatre-chatgpt .theatre-side-header { background: #F8F7F5; }
        .theatre-synth   .theatre-side-header { background: #EFF6FF; }
        .theatre-brand {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .theatre-brand-chatgpt { color: #6B7280; }
        .theatre-brand-synth   { color: #2563EB; }
        .theatre-output {
          padding: 16px;
          min-height: 180px;
        }
        .theatre-output-chatgpt { background: #FAFAF9; }
        .theatre-output-synth   { background: #fff; }
        .theatre-pre {
          font-family: 'Geist Mono', 'SF Mono', ui-monospace, monospace;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          color: #0A0D14;
        }
        .theatre-output-chatgpt .theatre-pre { color: #445068; }
        .theatre-verdict {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.5;
          padding: 10px 16px;
          border-top: 1px solid rgba(10,13,20,0.07);
          margin: 0;
        }
        .theatre-verdict-chatgpt {
          background: #FEF9EE;
          color: #92400E;
        }
        .theatre-verdict-synth {
          background: #F0FDF4;
          color: #15803D;
        }
        .theatre-vs {
          font-size: 13px;
          font-weight: 700;
          color: #8E9AB5;
          letter-spacing: 1px;
          padding-top: 80px;
          text-align: center;
        }

        /* ── comparison table ── */
        .comp-table {
          max-width: 880px;
          margin: 0 auto;
          border-radius: 16px;
          border: 1px solid rgba(10,13,20,0.08);
          overflow: hidden;
        }
        .comp-table-head {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          background: #0A0D14;
          padding: 0;
        }
        .comp-th {
          padding: 14px 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .comp-th-feature { color: rgba(255,255,255,0.4); }
        .comp-th-chatgpt { color: rgba(255,255,255,0.5); }
        .comp-th-synth   { color: #60A5FA; }
        .comp-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          border-top: 1px solid rgba(10,13,20,0.06);
          background: #fff;
          transition: background 0.1s;
        }
        .comp-row:hover { background: #F8FAFF; }
        .comp-cell {
          padding: 14px 20px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .comp-cell-feature {
          font-weight: 500;
          color: #0A0D14;
        }
        .comp-cell-chatgpt { color: #6B7280; }
        .comp-cell-synth   { color: #1E3A5F; }
        .support-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .support-yes  { background: #DCFCE7; color: #16A34A; }
        .support-no   { background: #FEE2E2; color: #DC2626; }
        .support-part { background: #FEF9C3; color: #CA8A04; }

        .comp-show-more {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .comp-show-more-btn {
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
        .comp-show-more-btn:hover {
          background: #EFF6FF;
          border-color: #2563EB;
        }

        /* ── use cases ── */
        .use-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 880px;
          margin: 0 auto;
        }
        .use-card {
          background: #fff;
          border: 1px solid rgba(10,13,20,0.08);
          border-radius: 14px;
          padding: 20px;
          transition: box-shadow 0.2s;
        }
        .use-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .use-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .use-scenario {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #0A0D14;
        }
        .use-icon { font-size: 18px; }
        .verdict-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-radius: 999px;
          padding: 3px 10px;
          text-transform: uppercase;
        }
        .verdict-synth   { background: #EFF6FF; color: #2563EB; }
        .verdict-chatgpt { background: #F5F3FF; color: #7C3AED; }
        .verdict-both    { background: #F0FDF4; color: #16A34A; }

        .use-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .use-col {
          border-radius: 8px;
          padding: 10px 12px;
        }
        .use-col-chatgpt { background: #F8F7F5; }
        .use-col-synth   { background: #F0F7FF; }
        .use-col-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .use-col-chatgpt .use-col-label { color: #9CA3AF; }
        .use-col-synth   .use-col-label { color: #3B82F6; }
        .use-col-text {
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }
        .use-col-chatgpt .use-col-text { color: #6B7280; }
        .use-col-synth   .use-col-text { color: #1E3A5F; }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .theatre-split { grid-template-columns: 1fr; }
          .theatre-vs    { display: none; }
          .use-grid      { grid-template-columns: 1fr; }
          .use-comparison { grid-template-columns: 1fr; }
          .comp-table-head,
          .comp-row      { grid-template-columns: 1.2fr 1fr; }
          .comp-th-feature,
          .comp-cell-feature { display: none; }
          .vs-cta-form   { flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div className="vs-page">

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section className="vs-hero">
          <div className="vs-eyebrow">Honest comparison</div>
          <h1 className="vs-hero-headline">
            ChatGPT advises.<br />
            <em>Synth executes.</em>
          </h1>
          <p className="vs-hero-sub">
            ChatGPT is an exceptional thinking partner. Synth is something
            different — an autonomous agent that works across your business,
            healthcare practice, or daily life without waiting to be asked.
          </p>
          <div className="vs-hero-badges">
            <span className="vs-badge vs-badge-chatgpt">ChatGPT</span>
            <span className="vs-badge-vs">VS</span>
            <span className="vs-badge vs-badge-synth">Synth</span>
          </div>
          {/* Brand cards showing logos */}
          <div className="brand-compare">
            <div className="brand-card">
              <img src="/logo.png" alt="Synth logo" />
              <div>
                <div className="brand-name">synth</div>
                <div className="brand-name small">Autonomous agent</div>
              </div>
            </div>

            <div className="brand-card">
              <img src="/compare%20images/Chatgpt.jpg" alt="ChatGPT logo" />
              <div>
                <div className="brand-name">ChatGPT</div>
                <div className="brand-name small">Assistant & playground</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TASK THEATRE ══════════════════════════════════════════════════════ */}
        <section className="vs-section">
          <div className="vs-wrap">
            <p className="vs-section-eyebrow">See the difference</p>
            <h2 className="vs-section-title">Same task. Completely different outcome.</h2>
            <p className="vs-section-sub">
              The gap between the two isn't capability — it's execution.
              ChatGPT tells you how. Synth handles it.
            </p>
            <TaskTheatre />
          </div>
        </section>

        {/* ══ FEATURE TABLE ══════════════════════════════════════════════════════ */}
        <section className="vs-section">
          <div className="vs-wrap">
            <p className="vs-section-eyebrow">Feature comparison</p>
            <h2 className="vs-section-title">What each tool actually does</h2>
            <p className="vs-section-sub">
              A fair, feature-by-feature comparison. We included two categories
              where ChatGPT genuinely wins — because honesty is how you build trust.
            </p>

            <div className="comp-table">
              <div className="comp-table-head">
                <div className="comp-th comp-th-feature">Feature</div>
                <div className="comp-th comp-th-chatgpt">ChatGPT</div>
                <div className="comp-th comp-th-synth">Synth</div>
              </div>
              {visibleRows.map((row, i) => (
                <div key={i} className="comp-row">
                  <div className="comp-cell comp-cell-feature">{row.feature}</div>
                  <div className="comp-cell comp-cell-chatgpt">
                    <SupportIcon level={row.chatgpt.supported} />
                    {row.chatgpt.value}
                  </div>
                  <div className="comp-cell comp-cell-synth">
                    <SupportIcon level={row.synth.supported} />
                    {row.synth.value}
                  </div>
                </div>
              ))}
            </div>

            {!showAll && (
              <div className="comp-show-more">
                <button className="comp-show-more-btn" onClick={() => setShowAll(true)}>
                  Show all {comparisonRows.length} features ↓
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ══ WHEN TO USE ════════════════════════════════════════════════════════ */}
        <section className="vs-section">
          <div className="vs-wrap">
            <p className="vs-section-eyebrow">When to use each</p>
            <h2 className="vs-section-title">The honest answer by scenario</h2>
            <p className="vs-section-sub">
              We'll tell you when ChatGPT is the better choice. We'd rather
              be useful than win an argument.
            </p>

            <div className="use-grid">
              {useCases.map((uc, i) => (
                <div key={i} className="use-card">
                  <div className="use-card-top">
                    <div className="use-scenario">
                      <span className="use-icon">{uc.icon}</span>
                      {uc.scenario}
                    </div>
                    <VerdictBadge verdict={uc.verdict} />
                  </div>
                  <div className="use-comparison">
                    <div className="use-col use-col-chatgpt">
                      <p className="use-col-label">ChatGPT</p>
                      <p className="use-col-text">{uc.chatgpt}</p>
                    </div>
                    <div className="use-col use-col-synth">
                      <p className="use-col-label">Synth</p>
                      <p className="use-col-text">{uc.synth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  )
}