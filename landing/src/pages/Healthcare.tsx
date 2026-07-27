import { Link } from "wouter"

const capabilities = [
  {
    icon: "🏷️",
    title: "Insurance Code Automation",
    desc: "Automatically applies ICD-10, CPT, and HCPCS codes to patient records and claims. Reduces coding errors and speeds up submission.",
    detail: "Supports South African medical scheme tariff codes (NHRPL) and international coding standards",
  },
  {
    icon: "❌",
    title: "Claim Denial Resolution",
    desc: "Identifies denial patterns, drafts appeal letters, tracks resubmission deadlines, and monitors payer decisions — all autonomously.",
    detail: "Average denial resolution time reduced from 14 days to under 48 hours",
  },
  {
    icon: "📋",
    title: "Payer Rule Monitoring",
    desc: "Tracks payer policy changes across medical schemes and insurers. Alerts your admin team before rule changes cause claim failures.",
    detail: "Monitors Discovery Health, Bonitas, Medihelp, Momentum, and all major SA medical schemes",
  },
  {
    icon: "📅",
    title: "Appointment & Scheduling",
    desc: "Manages patient bookings, sends reminders, handles cancellations and rescheduling, and optimises doctor availability — via WhatsApp.",
    detail: "Patients can confirm, cancel, or reschedule via a simple WhatsApp message — no app download needed",
  },
  {
    icon: "💊",
    title: "Refill Reminders — Chronic Disease",
    desc: "Automatically identifies patients due for repeat prescriptions and sends personalised reminders via WhatsApp or SMS, with one-tap confirmation.",
    detail: "Designed for chronic conditions: diabetes, hypertension, HIV/ARV management, asthma, and more",
  },
  {
    icon: "🔗",
    title: "EHR Integrations",
    desc: "Connects to your existing patient management and EHR systems. Synth reads and writes data — no double-entry, no manual exports.",
    detail: "Integrates with GoodX, Elixir, DragonWave, and custom hospital management systems via API",
  },
  {
    icon: "📁",
    title: "Patient Management",
    desc: "Handles admissions, records, and consent workflows. Tracks patient status, flags missing documentation, and ensures compliance.",
    detail: "Automated consent form generation, digital signature capture, and audit-ready record keeping",
  },
  {
    icon: "👥",
    title: "Staff Rostering & Credentials",
    desc: "Manages staff schedules, tracks credential expiry, and ensures compliance with regulatory requirements for healthcare professionals.",
    detail: "HPCSA registration tracking, CPD point monitoring, and automated renewal reminders",
  },
]

export default function Healthcare() {
  return (
    <div className="min-h-screen">
      <section className="pt-20 pb-12 border-b border-synth-border overflow-hidden">
        <div className="wrap relative">
          <Link
            href="/"
            className="absolute right-4 top-4 z-20 rounded-full border border-synth-border bg-white p-2 shadow-sm transition hover:scale-[1.02]"
          >
            <img src="/logo.png" alt="Synth home" className="h-12 w-12 object-contain" />
          </Link>

          <div className="overflow-hidden rounded-[32px] border border-synth-border bg-synth-surface shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <img
              src="/healthcare.png"
              alt="Healthcare solution image"
              className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover"
            />
          </div>

          <div className="mt-10 max-w-[780px] mx-auto text-center">
            <p className="eyebrow">Healthcare Admin</p>
            <h1 className="font-serif text-[clamp(36px,5vw,60px)] font-normal leading-[1.1] tracking-[-1px] text-synth-text-1 mb-4">
              From claim denials to<br />
              <em className="text-synth-accent">recovered revenue</em>
            </h1>
            <p className="text-[17px] text-synth-text-2 leading-[1.7] max-w-[600px] mx-auto mb-8">
              Synth automates the most painful, high-stakes admin work in healthcare — so your team spends time on patients, not paperwork.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-synth-accent text-white rounded-full px-7 py-3 text-[15px] font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              Request a demo
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="wrap">
          <p className="eyebrow">Core capabilities</p>
          <h2 className="section-title">Built for the revenue cycle</h2>
          <p className="section-sub">
            Eight critical workflows — fully automated, POPIA-compliant, integrated with your existing EHR systems.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-[960px] mx-auto mb-12">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="bg-synth-surface border border-synth-border rounded-[16px] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-synth-accent/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[19px] bg-synth-accent-light mb-3">
                  {cap.icon}
                </div>
                <h3 className="text-[14px] font-semibold text-synth-text-1 mb-1">{cap.title}</h3>
                <p className="text-[12px] text-synth-text-2 leading-[1.6] mb-2">{cap.desc}</p>
                <div className="text-[11px] text-synth-text-3 border-t border-synth-border pt-2 italic leading-[1.5]">
                  {cap.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Compliance bar */}
          <div className="bg-synth-surface border border-synth-border rounded-[16px] p-5 max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-synth-text-2 leading-[1.6] max-w-[560px]">
              <strong className="text-synth-text-1">Built for South African compliance.</strong> Synth&apos;s healthcare module is designed with POPIA (Protection of Personal Information Act) compliance at its core — data residency in South Africa, audit trails, role-based access controls, and patient consent management built in.
            </p>
            <div className="flex flex-wrap gap-2">
              {["POPIA Compliant", "NHRPL Codes", "Medical Scheme API", "Audit Trail", "Data Residency SA"].map((tag) => (
                <span key={tag} className="text-[11px] font-semibold border border-synth-border-med rounded-full px-3 py-1 text-synth-text-2 bg-synth-surface-2">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-synth-border">
        <div className="wrap">
          <div className="bg-synth-surface border border-synth-border rounded-[22px] p-14 max-w-[600px] mx-auto text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-synth-text-1 mb-3">
              See it in your facility
            </h2>
            <p className="text-[15px] text-synth-text-2 leading-[1.7] mb-7">
              We offer a free 30-minute demonstration tailored to your specific workflows. No commitment, no setup required.
            </p>
            <a
              href="mailto:healthcare@synth.ai?subject=Healthcare Demo Request"
              className="inline-block bg-synth-accent text-white rounded-full px-7 py-3 text-[15px] font-medium hover:bg-[#1D4ED8] transition-colors mb-3"
            >
              Book a demo →
            </a>
            <p className="text-[12px] text-synth-text-3">Or email us at healthcare@synth.ai · We respond within 24 hours</p>
          </div>
        </div>
      </section>
    </div>
  )
}
