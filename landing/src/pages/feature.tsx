import { useState } from "react"

// ─── feature data ─────────────────────────────────────────────────────────────
// Six features, each with everything needed to explain it fully on one page.
// Order: Proactive Heartbeat first (Synth's biggest differentiator),
// then Autonomous Multi-Agent (the engine), then the four capability layers.

const features = [
  {
    id: "heartbeat",
    number: "01",
    icon: "💓",
    tag: "Proactive Heartbeat",
    headline: "Synth doesn't wait to be asked",
    sub: "Every other AI tool sits idle until you open it and type something. Synth runs a continuous heartbeat — monitoring your calendar, emails, deadlines, and connected tools — and pushes what matters to you before you realise you needed it.",
    accent: "#2563EB",
    accentLight: "#EFF6FF",
    what: [
      {
        title: "Morning briefing",
        body: "Before 7 AM every day, Synth reviews your calendar, open emails, and pending tasks. It builds a prioritised plan for the day and sends it to you — unprompted, every morning.",
      },
      {
        title: "Emergency alerts",
        body: "When something changes — a meeting conflict, a deadline in 90 minutes you haven't started, a flight price drop on a route you're watching — Synth flags it immediately with an action option attached.",
      },
      {
        title: "Deadline tracking",
        body: "Synth monitors open tasks and submission deadlines across your connected tools. It doesn't wait for you to check. It tells you when something is at risk.",
      },
      {
        title: "Relationship nudges",
        body: "If a client hasn't heard from you in two weeks, or a colleague flagged something that got buried, Synth surfaces it before the relationship goes cold.",
      },
    ],
    example: {
      label: "What you receive at 6:45 AM",
      messages: [
        { from: "synth", text: "Good morning. Here's today:\n\n— 9 AM: Ndali Group call. I've prepped your notes.\n— 11:30 AM: Lwazi's contract reply is overdue (2 days). Draft ready for your review.\n— 2 PM: Q3 proposal deadline. You haven't opened the draft yet.\n— 5:30 PM: Gym (Clifton). Leave by 5:10 — traffic is light today.\n\nOne urgent item needs you now." },
        { from: "user", text: "What's the urgent item?" },
        { from: "synth", text: "Your 9 AM and 9:30 AM just clashed — the investor call was moved. Want me to reschedule the standup or find an alternative slot?" },
      ],
    },
    quote: "Most AI waits for instructions. Synth operates on a heartbeat — checking, monitoring, and pushing what needs your attention before it becomes a problem.",
  },
  {
    id: "multiagent",
    number: "02",
    icon: "⚡",
    tag: "Autonomous Multi-Agent Execution",
    headline: "One task. Dozens of agents. Zero hand-holding.",
    sub: "When you give Synth a complex task, it doesn't work through it one step at a time like a chatbot. It breaks the task into independent sub-tasks and deploys a dedicated agent for each one — running simultaneously, in parallel, each with its own fresh context.",
    accent: "#7C3AED",
    accentLight: "#F5F3FF",
    what: [
      {
        title: "The context overload problem — solved",
        body: "Ask a standard AI to research 50 companies. The first 5 are detailed. By company 20, the answers get thin. By company 50, you're getting filler. This happens because every item adds to the same memory, and the quality degrades as the context fills up. Synth gives each item its own clean agent with a fresh context. Item 50 gets the same quality as item 1.",
      },
      {
        title: "Parallel execution — not sequential",
        body: "Researching 100 competitors doesn't take 100 times as long. Sub-agents run simultaneously. A task that would take a human analyst days completes in minutes because every item is being worked on at the same time.",
      },
      {
        title: "Centralised orchestration",
        body: "A main agent breaks the task down, distributes work to sub-agents, and collects results when they finish. Sub-agents never talk to each other — this prevents context from polluting across tasks and keeps quality consistent.",
      },
      {
        title: "Reports back when done",
        body: "You give Synth the task and walk away. When all agents have completed their work, the main agent synthesises the findings into a single structured output and delivers it to you — in WhatsApp, Slack, email, or wherever you work.",
      },
    ],
    comparison: {
      label: "What happens when you ask for 50 competitor profiles",
      rows: [
        { label: "Standard AI chatbot", items: ["Company 1–5: detailed ✓", "Company 6–20: getting shorter", "Company 21–50: generic filler ✗"] },
        { label: "Synth multi-agent", items: ["All 50: research happens simultaneously", "Each agent has its own fresh context", "Uniform quality across every profile ✓"] },
      ],
    },
    example: {
      label: "A task in motion",
      messages: [
        { from: "user", text: "Research our top 20 competitors — pricing, key features, and recent funding — and put it in a Google Sheet before the 3 PM strategy meeting." },
        { from: "synth", text: "On it. Deploying 20 research agents now — one per company.\n\n[■■■░░░░░░░] 6/20 complete\n\nEach agent is browsing live, pulling pricing pages, press releases, and Crunchbase data independently. I'll synthesise and populate the Sheet when all 20 are done. You'll have it well before 3 PM." },
      ],
    },
    quote: "Traditional AI gets slower and less accurate as the task gets bigger. Synth gets more capable — because more agents can always be deployed.",
  },
  {
    id: "toolintegration",
    number: "03",
    icon: "🔌",
    tag: "Seamless Tool Integration (MCP)",
    headline: "Synth connects to the tools your business already runs on",
    sub: "MCP — Model Context Protocol — is the standard that lets Synth read from and write to external tools. Not screen-scraping. Not manual exports. A direct, reliable connection that means Synth knows what's in your systems before you tell it.",
    accent: "#059669",
    accentLight: "#F0FDF4",
    what: [
      {
        title: "What MCP actually means for you",
        body: "When Synth connects to your Google Calendar via MCP, it doesn't just see events — it can create, edit, and reschedule them. When it connects to HubSpot, it can read your pipeline, update deal stages, and log notes. The connection is bidirectional: Synth reads what's there and writes back when something is done.",
      },
      {
        title: "No manual exports",
        body: "The most wasted hour in any business day is moving data between tools. Exporting a CSV from your CRM to paste into a spreadsheet. Copying a meeting note into a task manager. Synth eliminates every one of those handoffs — it reads, processes, and writes across all connected tools in one continuous flow.",
      },
      {
        title: "Every tool talks to every other tool",
        body: "Because Synth sits at the centre of all your connections, it can orchestrate across them. Pull data from Xero, compare it to a forecast in Google Sheets, flag the variance to a Slack channel, and create a follow-up task in Notion — in one instruction.",
      },
    ],
    integrations: [
      { category: "Accounting", tools: ["Sage Business Cloud", "Xero", "QuickBooks", "Zoho Books"] },
      { category: "CRM & Sales", tools: ["Salesforce", "HubSpot", "Pipedrive", "Zoho CRM"] },
      { category: "Workspace", tools: ["Google Workspace", "Microsoft 365", "Notion", "Slack"] },
      { category: "Healthcare (SA)", tools: ["GoodX", "Elixir", "DragonWave", "SA Medical Schemes"] },
      { category: "Productivity", tools: ["Linear", "Jira", "Asana", "ClickUp"] },
      { category: "Communication", tools: ["WhatsApp Business", "Telegram", "Gmail", "Outlook"] },
    ],
    example: {
      label: "Cross-tool execution in one message",
      messages: [
        { from: "user", text: "Pull last month's revenue from Xero, compare it to the forecast in the Q4 Sheet, and send a summary to the finance Slack channel." },
        { from: "synth", text: "Done.\n\nXero (Oct revenue): R1,240,000\nForecast (Q4 Sheet): R1,180,000\nVariance: +R60,000 (+5.1%)\n\nSummary posted to #finance-team on Slack. Want me to update the board deck too?" },
      ],
    },
    quote: "The value of connected tools is not in having them. It's in having something that can read, act on, and write back to all of them at once.",
  },
  {
    id: "custommcp",
    number: "04",
    icon: "🛠️",
    tag: "Custom MCP & API",
    headline: "Connect your own systems. Build on top of Synth.",
    sub: "The pre-built connectors cover the most common tools. But every business has systems that are specific to them — internal databases, proprietary platforms, bespoke CRMs, healthcare systems built in-house. Custom MCP and the Synth API let you connect anything.",
    accent: "#D97706",
    accentLight: "#FFFBEB",
    what: [
      {
        title: "Custom MCP servers",
        body: "If you have an internal tool or data source that Synth doesn't natively connect to, you can register a custom MCP server. Synth will treat it exactly like a native connector — reading from it, writing to it, and orchestrating across it alongside all your other tools. No middleware required.",
      },
      {
        title: "REST API — trigger Synth from your own systems",
        body: "The Synth API lets you trigger tasks programmatically from your own code, dashboards, or automation pipelines. Send a task to Synth via API, specify the channel for the output (WhatsApp, Slack, email), set a priority, and let Synth execute it. Results come back as a webhook when the task is complete.",
      },
      {
        title: "Webhooks — Synth reports back to you",
        body: "When a task completes, Synth can POST the results to any endpoint you specify. Build downstream automation on top of Synth's outputs — trigger follow-up workflows, update your own databases, or feed results into your dashboards automatically.",
      },
      {
        title: "Enterprise SSO and access control",
        body: "For larger teams, Synth supports Single Sign-On (SSO) and role-based access controls. Define which team members can trigger which types of tasks, and which connectors each role has access to.",
      },
    ],
    codeBlocks: [
      {
        label: "Trigger a task via the Synth REST API",
        lang: "bash",
        code: `POST https://api.synth.ai/v1/tasks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "task": "Summarise this week's denied claims and post to Slack",
  "user_id": "usr_hospital_admin_001",
  "context": { "channel": "whatsapp" },
  "priority": "high",
  "webhook": "https://yourapp.com/synth/callback"
}`,
      },
      {
        label: "Register a custom MCP server",
        lang: "bash",
        code: `POST https://api.synth.ai/v1/mcp/register
Authorization: Bearer YOUR_API_KEY

{
  "name": "hospital-emr",
  "url": "https://mcp.yourhospital.co.za/sse",
  "scopes": ["read:patients", "write:appointments", "read:claims"],
  "user_id": "usr_hospital_admin_001"
}

// Synth can now query your EMR on the user's behalf`,
      },
      {
        label: "Webhook payload when a task completes",
        lang: "json",
        code: `{
  "event": "task.completed",
  "task_id": "tsk_9f2a1c",
  "user_id": "usr_hospital_admin_001",
  "result": "14 claim denials identified. Appeals drafted for 9. 5 require your review.",
  "output_url": "https://docs.google.com/...",
  "status": "success",
  "duration_seconds": 47
}`,
      },
    ],
    quote: "Pre-built connectors are the starting point. Custom MCP is how Synth becomes the operations layer for your specific business — not a generic tool adapted to fit.",
  },
  {
    id: "browser",
    number: "05",
    icon: "🌐",
    tag: "Browser Operator",
    headline: "Synth navigates the web the way you would — with your logins, your session, your access",
    sub: "Most AI tools that claim to 'browse the web' are just reading public pages. Synth's Browser Operator works inside your actual browser session — which means it can access the sites you're logged into, pass authentication checks, fill forms, click buttons, and complete multi-step tasks across platforms that would block a standard bot.",
    accent: "#0891B2",
    accentLight: "#ECFEFF",
    what: [
      {
        title: "Your session — not a headless bot",
        body: "When Synth uses your browser, it operates from your trusted local IP address and your authenticated sessions. Security systems see a real user from a known location — not a bot from an unfamiliar IP. This means Synth can reliably access your banking portal, your private CRM, your LinkedIn account, or any platform with strict security checks.",
      },
      {
        title: "It navigates, clicks, and fills forms",
        body: "Synth doesn't just read pages — it operates them. It can navigate multi-step flows, fill in forms, handle dropdowns and file uploads, scroll through paginated results, and confirm actions. Give it a multi-step goal and it executes the entire sequence without needing you to supervise each step.",
      },
      {
        title: "Access platforms that require authentication",
        body: "The most valuable business data lives behind login walls — your ERP, your medical scheme portal, your accounting system. Standard web scraping cannot reach these. Synth's Browser Operator can, because it uses your existing authenticated session.",
      },
      {
        title: "Full transparency and control",
        body: "You can watch what Synth is doing in your browser at any time. If you want to pause or stop a task midway, you can. Synth never stores your passwords — it uses your live session, not your credentials.",
      },
    ],
    useCases: [
      { icon: "💼", title: "Job applications", body: "Apply to 20 remote positions using your CV — Synth navigates each application portal, fills in the form, and submits." },
      { icon: "🏦", title: "Banking and finance", body: "Pull your transaction history, reconcile with your accounting software, and flag anomalies — without manual exports." },
      { icon: "📋", title: "Form filing", body: "SARS eFiling, medical scheme claim submissions, government portal forms — Synth completes multi-step government and regulatory forms." },
      { icon: "🔍", title: "Authenticated research", body: "Pull data from LinkedIn Sales Navigator, SimilarWeb, or any subscription platform you're already logged into." },
      { icon: "🛒", title: "Purchasing and booking", body: "Compare prices across multiple supplier portals, place orders, and confirm bookings — all in a single instruction." },
      { icon: "📊", title: "CRM data entry", body: "Navigate your CRM, update deal stages, log call notes, and move contacts between lists without opening a single tab yourself." },
    ],
    example: {
      label: "What Synth can do in your browser",
      messages: [
        { from: "user", text: "Apply to all the senior product manager roles on this list of URLs using my CV. Skip any that require more than 3 years in fintech." },
        { from: "synth", text: "Opening all 12 URLs now. I'll review each role's requirements before applying.\n\n✓ Applied — Takealot (Cape Town PM role)\n✓ Applied — Ozow (Product Lead)\n— Skipped — Peach Payments (requires 5yr fintech)\n✓ Applied — Yoco (Senior PM)\n\nCompleted 8/12. 3 skipped (fintech requirement). 1 required a cover letter — I drafted one using your experience, please review." },
      ],
    },
    quote: "A browser that only reads public pages is a limited tool. A browser that operates your authenticated sessions — as if you were sitting there — is a completely different capability.",
  },
  {
    id: "skills",
    number: "06",
    icon: "🎯",
    tag: "Agent Skills",
    headline: "Build a workflow once. Run it forever.",
    sub: "Agent Skills let you package any task Synth has successfully completed into a reusable, triggerable workflow. Your team's best processes — the way you do competitor research, the way you onboard clients, the way you prepare for board meetings — become skills that any team member can trigger with a single command.",
    accent: "#DB2777",
    accentLight: "#FDF2F8",
    what: [
      {
        title: "What a Skill is",
        body: "A Skill is a saved workflow — a set of instructions, tools, and steps that Synth knows how to execute for a specific recurring task. It is not a macro or a script. It is a complete AI workflow that can adapt to new inputs while following the same reliable process every time.",
      },
      {
        title: "Build one from any successful task",
        body: "When Synth completes a task you'll want to repeat — a competitor analysis, a client onboarding sequence, a weekly report — you can say 'package this as a Skill.' Synth generates the workflow definition automatically. You give it a name, and it's ready to trigger.",
      },
      {
        title: "Specialise for your domain",
        body: "A generic AI does generic work. A Skill trained on your specific way of preparing investor updates, or your specific process for resolving medical claim denials, does your work — with your standards, your templates, and your preferences built in.",
      },
      {
        title: "Share across your team",
        body: "Skills are not personal. A skill built by your most experienced analyst can be triggered by a new team member on their first day. Your team's collective expertise becomes organisational infrastructure, not individual knowledge locked in someone's head.",
      },
    ],
    skillExamples: [
      {
        name: "/competitor-report",
        trigger: "Weekly competitor intelligence",
        desc: "Researches your top 10 competitors, pulls pricing changes, new features, and press mentions, and delivers a structured briefing every Monday at 8 AM.",
        plan: "Pro",
      },
      {
        name: "/claim-denial-batch",
        trigger: "Healthcare claim processing",
        desc: "Pulls all denied claims from the past 7 days, identifies denial codes, drafts appeals for each, and flags ones that need human review.",
        plan: "Healthcare",
      },
      {
        name: "/new-lead-brief",
        trigger: "Sales meeting prep",
        desc: "When given a company name, researches the prospect, maps stakeholders, identifies likely objections, and delivers a formatted brief 1 hour before the scheduled call.",
        plan: "Pro",
      },
      {
        name: "/morning-brief",
        trigger: "Daily planning",
        desc: "Reviews your calendar, emails, and open tasks. Delivers a prioritised day plan to WhatsApp by 6:45 AM every morning.",
        plan: "Starter",
      },
      {
        name: "/board-pack",
        trigger: "Monthly reporting",
        desc: "Pulls revenue data from Xero, headcount from HR, and pipeline from HubSpot. Assembles a board-ready slide deck and emails it to your distribution list.",
        plan: "Pro",
      },
      {
        name: "/client-onboard",
        trigger: "New client setup",
        desc: "Creates a client folder, sends a welcome email with your standard template, schedules the kickoff call, and sets up tracking in your project tool.",
        plan: "Pro",
      },
    ],
    quote: "The best teams don't just work hard — they build systems. Agent Skills are how your best process becomes the team's default process.",
  },
]

// ─── sub-components ───────────────────────────────────────────────────────────

function ChatDemo({ messages, label }: {
  messages: { from: string; text: string }[]
  label:    string
}) {
  return (
    <div style={{
      background: "#0A0D14", borderRadius: 14,
      overflow: "hidden", marginTop: 20,
    }}>
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.07)",
        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "1px", color: "rgba(255,255,255,.3)",
      }}>
        {label}
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.from === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "82%",
              background: m.from === "user" ? "#2563EB" : "rgba(255,255,255,.06)",
              border: m.from === "synth" ? "1px solid rgba(255,255,255,.08)" : "none",
              borderRadius: m.from === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.6,
              color: m.from === "user" ? "#fff" : "rgba(255,255,255,.8)",
              whiteSpace: "pre-line",
            }}>
              {m.from === "synth" && (
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.8px", color: "#60A5FA",
                  marginBottom: 5,
                }}>Synth</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CodeBlock({ code, label }: { code: string; lang: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 6,
      }}>
        <span style={{ fontSize: 12, color: "#8E9AB5", fontWeight: 500 }}>{label}</span>
        <button
          onClick={copy}
          style={{
            fontSize: 11, fontWeight: 600, color: copied ? "#16A34A" : "#2563EB",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre style={{
        background: "#0D1117",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 10, padding: "16px 18px",
        fontFamily: "'Geist Mono','SF Mono','Fira Code',ui-monospace,monospace",
        fontSize: 12, lineHeight: 1.75,
        color: "#E2E8F0", overflow: "auto", margin: 0,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {code}
      </pre>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Features() {
  const [activeFeature, setActiveFeature] = useState("heartbeat")

  return (
    <>
      <style>{`
        .ft { font-family:'Geist','Inter',system-ui,sans-serif; background:#F5F7FA; color:#0A0D14; }
        .ft-wrap    { max-width:1040px; margin:0 auto; padding:0 24px; }
        .ft-wrap-sm { max-width:760px;  margin:0 auto; padding:0 24px; }

        /* ── hero ── */
        .ft-hero {
          padding:80px 24px 64px; text-align:center;
          border-bottom:1px solid rgba(10,13,20,.07);
          position:relative; overflow:hidden;
        }
        .ft-hero::before {
          content:''; position:absolute; inset:0;
          background-image:radial-gradient(circle,rgba(37,99,235,.05) 1px,transparent 1px);
          background-size:28px 28px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%);
          pointer-events:none;
        }
        .ft-pill {
          display:inline-flex; align-items:center; gap:8px;
          background:#EFF6FF; border:1px solid rgba(37,99,235,.2);
          color:#2563EB; font-size:12px; font-weight:600;
          letter-spacing:1px; text-transform:uppercase;
          border-radius:999px; padding:5px 14px; margin-bottom:24px;
        }
        .ft-h1 {
          font-family:'Instrument Serif',Georgia,serif;
          font-size:clamp(32px,5vw,58px); font-weight:400;
          line-height:1.08; letter-spacing:-1.5px;
          color:#0A0D14; max-width:700px; margin:0 auto 16px;
        }
        .ft-h1 em { font-style:italic; color:#2563EB; }
        .ft-hero-sub {
          font-size:16px; color:#445068; line-height:1.7;
          max-width:520px; margin:0 auto 40px;
        }

        /* ── sticky nav ── */
        .ft-nav {
          position:sticky; top:60px; z-index:100;
          background:rgba(245,247,250,.95);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(10,13,20,.07);
          padding:0 24px;
        }
        .ft-nav-inner {
          max-width:1040px; margin:0 auto;
          display:flex; gap:2px; overflow-x:auto;
          scrollbar-width:none; padding:10px 0;
        }
        .ft-nav-inner::-webkit-scrollbar { display:none; }
        .ft-nav-btn {
          display:flex; align-items:center; gap:7px;
          padding:7px 14px; border-radius:8px;
          font-size:13px; font-weight:500; color:#6B7A99;
          background:none; border:none; cursor:pointer;
          white-space:nowrap; font-family:inherit;
          transition:all .15s;
        }
        .ft-nav-btn:hover { background:rgba(10,13,20,.05); color:#0A0D14; }
        .ft-nav-btn.active { background:#EFF6FF; color:#2563EB; }
        .ft-nav-dot {
          width:6px; height:6px; border-radius:50%; flex-shrink:0;
        }

        /* ── feature sections ── */
        .ft-feature {
          padding:80px 0;
          border-bottom:1px solid rgba(10,13,20,.07);
        }
        .ft-feature:nth-child(even) { background:#fff; }
        .ft-feature-inner {
          max-width:1040px; margin:0 auto; padding:0 24px;
        }
        .ft-feature-top {
          display:grid; grid-template-columns:1fr 1fr;
          gap:56px; align-items:start; margin-bottom:56px;
        }
        .ft-feature-left { }
        .ft-num {
          font-size:11px; font-weight:700; letter-spacing:2px;
          text-transform:uppercase; color:#CBD5E1; margin-bottom:12px;
        }
        .ft-tag {
          display:inline-flex; align-items:center; gap:8px;
          border-radius:999px; padding:4px 12px;
          font-size:12px; font-weight:600; margin-bottom:16px;
        }
        .ft-h2 {
          font-family:'Instrument Serif',Georgia,serif;
          font-size:clamp(24px,3.5vw,36px); font-weight:400;
          line-height:1.15; letter-spacing:-0.5px;
          color:#0A0D14; margin-bottom:14px;
        }
        .ft-sub {
          font-size:15px; color:#445068; line-height:1.75;
          margin-bottom:24px;
        }
        .ft-quote {
          font-size:14px; font-style:italic; color:#6B7A99;
          border-left:3px solid; padding-left:14px;
          line-height:1.65; margin:0;
        }

        /* What points grid */
        .ft-what-grid {
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:12px;
        }
        .ft-what-card {
          background:#F5F7FA; border-radius:12px;
          padding:16px 18px;
          border:1px solid rgba(10,13,20,.06);
        }
        .ft-what-card h4 {
          font-size:13px; font-weight:600; color:#0A0D14;
          margin-bottom:6px;
        }
        .ft-what-card p {
          font-size:13px; color:#445068; line-height:1.6; margin:0;
        }

        /* Integration grid */
        .ft-integrations {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:12px; margin-top:24px;
        }
        .ft-int-group { }
        .ft-int-group-label {
          font-size:10px; font-weight:700; text-transform:uppercase;
          letter-spacing:1px; color:#8E9AB5; margin-bottom:7px;
        }
        .ft-int-pills { display:flex; flex-wrap:wrap; gap:5px; }
        .ft-int-pill {
          font-size:12px; color:#445068; font-weight:500;
          background:#fff; border:1px solid rgba(10,13,20,.1);
          border-radius:999px; padding:3px 10px;
        }

        /* Comparison table */
        .ft-comparison { margin-top:24px; border-radius:12px; overflow:hidden; border:1px solid rgba(10,13,20,.08); }
        .ft-comp-label {
          background:#0A0D14; padding:10px 16px;
          font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:1px; color:rgba(255,255,255,.4);
        }
        .ft-comp-row {
          display:grid; grid-template-columns:1fr 1fr;
          border-top:1px solid rgba(10,13,20,.06);
        }
        .ft-comp-col {
          padding:14px 16px;
        }
        .ft-comp-col:first-child { background:#FEF9EE; border-right:1px solid rgba(10,13,20,.06); }
        .ft-comp-col:last-child  { background:#F0F7FF; }
        .ft-comp-col-label {
          font-size:10px; font-weight:700; text-transform:uppercase;
          letter-spacing:1px; margin-bottom:8px;
        }
        .ft-comp-col:first-child .ft-comp-col-label { color:#92400E; }
        .ft-comp-col:last-child  .ft-comp-col-label { color:#2563EB; }
        .ft-comp-item {
          font-size:13px; color:#445068; line-height:1.55;
          padding:3px 0;
        }

        /* Skill examples */
        .ft-skills-grid {
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:10px; margin-top:24px;
        }
        .ft-skill-card {
          background:#F5F7FA; border:1px solid rgba(10,13,20,.07);
          border-radius:12px; padding:16px 18px;
        }
        .ft-skill-name {
          font-family:'Geist Mono','SF Mono',ui-monospace,monospace;
          font-size:12px; font-weight:700; margin-bottom:4px;
        }
        .ft-skill-trigger {
          font-size:11px; font-weight:600; text-transform:uppercase;
          letter-spacing:.7px; color:#8E9AB5; margin-bottom:8px;
        }
        .ft-skill-desc {
          font-size:13px; color:#445068; line-height:1.55; margin-bottom:8px;
        }
        .ft-skill-plan {
          font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.7px; border-radius:999px;
          padding:2px 8px; display:inline-block;
        }

        /* Use case grid */
        .ft-use-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:10px; margin-top:24px;
        }
        .ft-use-card {
          background:#F5F7FA; border:1px solid rgba(10,13,20,.07);
          border-radius:12px; padding:16px;
        }
        .ft-use-icon { font-size:20px; margin-bottom:8px; }
        .ft-use-card h4 { font-size:13px; font-weight:600; color:#0A0D14; margin-bottom:4px; }
        .ft-use-card p  { font-size:12px; color:#445068; line-height:1.55; margin:0; }

        /* responsive */
        @media(max-width:860px){
          .ft-feature-top { grid-template-columns:1fr; gap:32px; }
          .ft-what-grid   { grid-template-columns:1fr; }
          .ft-integrations { grid-template-columns:repeat(2,1fr); }
          .ft-skills-grid { grid-template-columns:1fr; }
          .ft-use-grid    { grid-template-columns:repeat(2,1fr); }
          .ft-comp-row    { grid-template-columns:1fr; }
          .ft-comp-col:first-child { border-right:none; border-bottom:1px solid rgba(10,13,20,.06); }
        }
        @media(max-width:560px){
          .ft-integrations { grid-template-columns:1fr; }
          .ft-use-grid    { grid-template-columns:1fr; }
          .ft-h1 { font-size:32px; letter-spacing:-1px; }
        }
        @media(prefers-reduced-motion:reduce){ *{ transition:none !important; scroll-behavior:auto !important; } }
      `}</style>

      <div className="ft">

        {/* ── HERO ── */}
        <section className="ft-hero">
          <div className="ft-pill">Platform features</div>
          <h1 className="ft-h1">
            Six capabilities.<br />
            <em>One agent that uses all of them.</em>
          </h1>
          <p className="ft-hero-sub">
            Most AI tools give you one thing — a chat window.
            Synth is built from six interconnected capabilities
            that work together to go from your first message
            to a completed result, without you managing any step in between.
          </p>
        </section>

        {/* ── STICKY NAV ── */}
        <nav className="ft-nav">
          <div className="ft-nav-inner">
            {features.map(f => (
              <button
                key={f.id}
                className={`ft-nav-btn ${activeFeature === f.id ? "active" : ""}`}
                onClick={() => {
                  setActiveFeature(f.id)
                  document.getElementById(f.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
              >
                <span className="ft-nav-dot" style={{ background: f.accent }} />
                {f.tag}
              </button>
            ))}
          </div>
        </nav>

        {/* ── FEATURE SECTIONS ── */}
        {features.map((f) => (
          <section
            key={f.id}
            id={f.id}
            className="ft-feature"
            style={{ scrollMarginTop: 120 }}
          >
            <div className="ft-feature-inner">

              {/* Top two-column layout */}
              <div className="ft-feature-top">

                {/* Left — headline, what it is, quote */}
                <div className="ft-feature-left">
                  <div className="ft-num">{f.number} / 06</div>
                  <div
                    className="ft-tag"
                    style={{ background: f.accentLight, color: f.accent }}
                  >
                    <span>{f.icon}</span>
                    {f.tag}
                  </div>
                  <h2 className="ft-h2">{f.headline}</h2>
                  <p className="ft-sub">{f.sub}</p>
                  <p
                    className="ft-quote"
                    style={{ borderColor: f.accent }}
                  >
                    {f.quote}
                  </p>
                </div>

                {/* Right — what points */}
                <div>
                  <div className="ft-what-grid">
                    {f.what.map((w, i) => (
                      <div key={i} className="ft-what-card">
                        <h4
                          style={{
                            display: "flex", alignItems: "center", gap: 7,
                          }}
                        >
                          <span style={{
                            width: 18, height: 18, borderRadius: "50%",
                            background: f.accentLight, color: f.accent,
                            display: "inline-flex", alignItems: "center",
                            justifyContent: "center", fontSize: 10, fontWeight: 800,
                            flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          {w.title}
                        </h4>
                        <p>{w.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature-specific content */}

              {/* Heartbeat — chat demo */}
              {f.example && (f.id === "heartbeat" || f.id === "multiagent" || f.id === "browser") && (
                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                  <ChatDemo messages={f.example.messages} label={f.example.label} />
                </div>
              )}

              {/* Tool integration — chat demo + integration grid */}
              {f.id === "toolintegration" && (
                <>
                  <div style={{ maxWidth: 640, margin: "0 auto 40px" }}>
                    <ChatDemo messages={f.example!.messages} label={f.example!.label} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1.2px", color: "#8E9AB5", marginBottom: 14,
                    }}>
                      Available connectors
                    </div>
                    <div className="ft-integrations">
                      {f.integrations!.map((group, i) => (
                        <div key={i} className="ft-int-group">
                          <div className="ft-int-group-label">{group.category}</div>
                          <div className="ft-int-pills">
                            {group.tools.map(t => (
                              <span key={t} className="ft-int-pill">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Multi-agent — comparison + chat */}
              {f.id === "multiagent" && f.comparison && (
                <>
                  <div className="ft-comparison" style={{ maxWidth: 720, margin: "0 auto 28px" }}>
                    <div className="ft-comp-label">{f.comparison.label}</div>
                    <div className="ft-comp-row">
                      {f.comparison.rows.map((row, i) => (
                        <div key={i} className="ft-comp-col">
                          <div className="ft-comp-col-label">{row.label}</div>
                          {row.items.map((item, j) => (
                            <div key={j} className="ft-comp-item">{item}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ maxWidth: 640, margin: "0 auto" }}>
                    <ChatDemo messages={f.example!.messages} label={f.example!.label} />
                  </div>
                </>
              )}

              {/* Custom MCP — code blocks */}
              {f.id === "custommcp" && f.codeBlocks && (
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                  {f.codeBlocks.map((block, i) => (
                    <CodeBlock
                      key={i}
                      code={block.code}
                      lang={block.lang}
                      label={block.label}
                    />
                  ))}
                </div>
              )}

              {/* Browser operator — use cases */}
              {f.id === "browser" && f.useCases && (
                <>
                  <div className="ft-use-grid">
                    {f.useCases.map((uc, i) => (
                      <div key={i} className="ft-use-card">
                        <div className="ft-use-icon">{uc.icon}</div>
                        <h4>{uc.title}</h4>
                        <p>{uc.body}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ maxWidth: 640, margin: "28px auto 0" }}>
                    <ChatDemo messages={f.example!.messages} label={f.example!.label} />
                  </div>
                </>
              )}

              {/* Agent Skills — skill cards */}
              {f.id === "skills" && f.skillExamples && (
                <div className="ft-skills-grid">
                  {f.skillExamples.map((skill, i) => (
                    <div
                      key={i}
                      className="ft-skill-card"
                      style={{ borderTop: `3px solid ${f.accent}` }}
                    >
                      <div className="ft-skill-name" style={{ color: f.accent }}>
                        {skill.name}
                      </div>
                      <div className="ft-skill-trigger">{skill.trigger}</div>
                      <p className="ft-skill-desc">{skill.desc}</p>
                      <span
                        className="ft-skill-plan"
                        style={{
                          background: f.accentLight,
                          color: f.accent,
                        }}
                      >
                        {skill.plan}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>
        ))}

        {/* ── FOOTER CTA ── */}
        <section style={{
          padding: "80px 24px",
          textAlign: "center",
          borderTop: "1px solid rgba(10,13,20,.07)",
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: "#2563EB", marginBottom: 12,
            }}>
              All six features. One agent.
            </p>
            <h2 style={{
              fontFamily: "'Instrument Serif',Georgia,serif",
              fontSize: "clamp(26px,4vw,38px)",
              fontWeight: 400, letterSpacing: "-0.4px",
              color: "#0A0D14", marginBottom: 14, lineHeight: 1.15,
            }}>
              The gap between thinking and doing just closed.
            </h2>
            <p style={{
              fontSize: 15, color: "#445068", lineHeight: 1.7, marginBottom: 32,
            }}>
              We're building something we'd want to use ourselves. Join the waitlist
              and you'll be first to get access when we launch.
            </p>
            <form
              style={{ display: "flex", gap: 8, maxWidth: 380, margin: "0 auto 12px" }}
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, background: "#fff",
                  border: "1px solid rgba(10,13,20,.14)",
                  borderRadius: 999, padding: "11px 18px",
                  fontSize: 14, color: "#0A0D14", outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#2563EB", color: "#fff",
                  borderRadius: 999, padding: "11px 22px",
                  fontSize: 14, fontWeight: 500, border: "none",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                Join waitlist
              </button>
            </form>
            <p style={{ fontSize: 12, color: "#8E9AB5" }}>
              Free during beta. No credit card required.
            </p>
          </div>
        </section>

      </div>
    </>
  )
}