import { Clock, MessageCircle, AlertTriangle, UserPlus, Airplay, ArrowRight } from "lucide-react"
import { Link } from "wouter"

const dailyItems = [
  { time: "8:00 AM", title: "Review marketing campaign draft — Q3 launch", detail: "Synth already pulled last quarter's top performers and drafted 3 creative routes based on those hooks.", status: "Prepped", statusColor: "bg-blue-100 text-blue-700" },
  { time: "10:00 AM", title: "Sales enablement — competitor battle cards", detail: "Acme Corp just dropped a new pricing page. Synth captured the changes and is building a side-by-side comparison for your 10 AM pitch.", status: "Urgent", statusColor: "bg-red-100 text-red-700" },
  { time: "1:00 PM", title: "Product sync — roadmap update", detail: "Synth correlated user feedback from 400 support tickets and flagged the 3 most requested features for the sprint planning meeting.", status: "Focus", statusColor: "bg-emerald-100 text-emerald-700" },
  { time: "4:00 PM", title: "Finance report — weekly cash flow", detail: "Synth compiled the latest AR/AP data and spotted an upcoming cash gap. It's drafted a recommendation to pull forward invoice #1243.", status: "Review", statusColor: "bg-amber-100 text-amber-700" },
]

const alerts = [
  {
    icon: AlertTriangle,
    title: "Negative sentiment spike — @synthai on X",
    desc: "Mentions are up 340% in 2 hours. Top complaint: login not working on Safari. Synth already drafted a response thread and alerted the engineering on-call.",
    primary: "Approve response",
    secondary: "See thread",
    accent: "bg-blue-600 text-white",
  },
  {
    icon: UserPlus,
    title: "High‑intent leads detected — competitor dissatisfaction on Instagram",
    desc: "7 users complained about YWXB’s product quality in the last 2 hours. I’ve identified 5 that match your ideal customer profile and drafted personalised outreach. Want me to send the first message?",
    primary: "Send messages",
    secondary: "Ignore",
    accent: "bg-emerald-600 text-white",
  },
  {
    icon: Clock,
    title: "RFP deadline — 90 minutes remaining",
    desc: "The Acme RFP response is 80% complete. Synth has pulled the missing compliance docs and flagged the sections that still need your approval.",
    primary: "Open draft",
    secondary: "Snooze 30 min",
    accent: "bg-blue-600 text-white",
  },
  {
    icon: Airplay,
    title: "Top 3 TikTok hooks this week — marketing ready",
    desc: "analyzed the best-performing hooks in your niche and flagged 3 you can adapt for the product launch video. Watch them now?",
    primary: "View hooks",
    secondary: "Send to editor",
    accent: "bg-emerald-600 text-white",
  },
]

export function LiveOverviewSection() {
  return (
    <section className="py-24 bg-synth-surface">
      <div className="wrap">
        <div className="grid gap-20">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-synth-accent mb-4">
              YOUR WORK, AUTONOMOUSLY HANDLED
            </p>
            <h2 className="font-display text-[clamp(38px,4.8vw,56px)] font-semibold tracking-[-0.04em] text-synth-text-1 max-w-[780px]">
              Synth briefs you every morning
            </h2>
            <p className="mt-5 max-w-3xl text-[17px] text-synth-text-2 leading-[1.8]">
              Before your team logs in, Synth has already scanned your tools, flagged threats and opportunities, and prepared a prioritized action plan — so you can jump straight into execution.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="rounded-[32px] border border-synth-border bg-white shadow-[0_40px_120px_rgba(15,23,42,0.08)] p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-synth-text-3 uppercase tracking-[1.8px] mb-2">Your business at a glance</p>
                    <h3 className="text-[24px] font-semibold text-synth-text-1">Good morning, Sarah <span aria-hidden="true">👋</span></h3>
                  </div>
                  <span className="rounded-full border border-synth-border px-4 py-2 text-[13px] font-semibold text-synth-text-2">Monday, 7:15 AM</span>
                </div>

                <div className="rounded-[28px] border border-synth-border bg-synth-bg p-5">
                  <p className="font-semibold text-synth-text-1 mb-2">What Synth did overnight</p>
                  <p className="text-[15px] text-synth-text-2 leading-[1.8]">
                    Monitored competitor pricing, completed the Q3 campaign draft, correlated product feedback from last week's tickets, and flagged a cash-flow gap for finance. One item needs your decision immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  {dailyItems.map((item) => (
                    <div key={item.time} className="rounded-[24px] border border-synth-border bg-synth-bg p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-synth-text-2">{item.time}</p>
                          <p className="mt-2 text-[16px] font-semibold text-synth-text-1">{item.title}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-[14px] text-synth-text-3 leading-[1.75]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-synth-border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] p-8">
                <p className="text-[12px] uppercase tracking-[2px] text-synth-accent mb-4">Business‑critical alerts</p>
                <h3 className="text-[32px] font-display font-semibold text-synth-text-1 mb-4">Synth taps you when it matters</h3>
                <p className="text-[16px] text-synth-text-2 leading-[1.8] mb-8">
                  When a competitor moves, a brand risk surfaces, or a deadline is about to slip — Synth pushes the alert, drafts the response, and offers to resolve it.
                </p>
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const Icon = alert.icon
                    return (
                      <div key={alert.title} className="rounded-[24px] border border-synth-border bg-synth-bg p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-synth-accent-light text-synth-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-synth-text-1">{alert.title}</p>
                            <p className="text-sm text-synth-text-3">{alert.desc}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button className={`rounded-full px-4 py-2 text-sm font-semibold ${alert.accent}`}>
                            {alert.primary}
                          </button>
                          <button className="rounded-full border border-synth-border px-4 py-2 text-sm font-semibold text-synth-text-1 hover:border-synth-accent/50 transition-all">
                            {alert.secondary}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[32px] border border-synth-border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] p-8">
                <p className="text-[12px] uppercase tracking-[2px] text-synth-accent mb-4">On‑demand too</p>
                <h3 className="text-[32px] font-display font-semibold text-synth-text-1 mb-4">Ask it anything, anytime</h3>
                <p className="text-[16px] text-synth-text-2 leading-[1.8] mb-8">
                  Beyond your daily plan, Synth handles any business task you throw at it — from research to drafting to data analysis.
                </p>
                <div className="space-y-5">
                  <div className="rounded-[32px] border border-synth-border bg-synth-bg p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
                        <MessageCircle className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-synth-text-1">Synth</p>
                        <p className="text-sm text-emerald-600">Online</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-[26px] bg-white p-4 text-[14px] text-synth-text-2 shadow-sm">
                        <p>Here's the competitive intelligence you asked for:</p>
                        <ul className="mt-3 space-y-2 pl-4 text-synth-text-3">
                          <li>• Acme Corp just launched a new pricing model — 20% cheaper than yours at the low end</li>
                          <li>• Their latest blog post targets your top 3 keywords; I've drafted a response article to outrank them</li>
                          <li>• User sentiment on your last release is 89% positive; 3 key feature requests already added to the product backlog</li>
                        </ul>
                        <p className="mt-3 text-[12px] text-synth-text-3">Synth · 9:05 AM</p>
                      </div>
                      <div className="rounded-[26px] bg-synth-accent text-white p-4 text-[14px] shadow-sm">
                        <p>What's on my plate today and is there anything I need to handle before the all‑hands?</p>
                        <p className="mt-2 text-[12px] text-synth-accent-light">9:05 AM · ✓✓</p>
                      </div>
                      <div className="rounded-[26px] bg-synth-accent text-white p-4 text-[14px] shadow-sm self-end max-w-[75%]">
                        <p>Perfect. Also pull the latest NPS scores and add them to the board deck.</p>
                        <p className="mt-2 text-[12px] text-synth-accent-light">9:06 AM · ✓✓</p>
                      </div>
                      <div className="rounded-[26px] bg-white p-4 text-[14px] text-synth-text-2 shadow-sm">
                        <p>Done — NPS data is already in the deck, and I've highlighted the 4 key drivers. Your 10 AM competitor update is ready whenever you want it.</p>
                        <p className="mt-3 text-[12px] text-synth-text-3">Synth · 9:06 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <Link href="/#waitlist" className="inline-flex items-center gap-2 rounded-full bg-synth-accent px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    Explore Synth live
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="rounded-full border border-synth-border px-4 py-2 text-sm text-synth-text-3">Live chat preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}