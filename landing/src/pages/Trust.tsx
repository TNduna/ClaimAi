import { Shield, Lock, Globe, Eye, Server, FileCheck, Check } from "lucide-react"

const pillars = [
  {
    icon: Shield,
    title: "End-to-end encryption",
    desc: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your conversations, documents, and patient records are protected at every layer.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    desc: "We never sell your data. We never use it to train models without your explicit consent. Delete everything, anytime — no questions asked.",
  },
  {
    icon: Globe,
    title: "Data residency controls",
    desc: "Choose where your data lives. South Africa (default), EU, UK, or US. POPIA, GDPR, and HIPAA-compliant handling depending on your region.",
  },
  {
    icon: Eye,
    title: "Full audit trails",
    desc: "Every agent action is logged, timestamped, and exportable. Court-admissible records for healthcare and legal compliance requirements.",
  },
  {
    icon: Server,
    title: "On-premise option",
    desc: "For healthcare and enterprise customers, deploy entirely within your infrastructure. No data leaves your network. Air-gapped available.",
  },
  {
    icon: FileCheck,
    title: "SOC 2 Type II readiness underway",
    desc: "SOC 2 Type II audit in progress. Report available to design partners under NDA. We maintain the highest standards for security, availability, and confidentiality.",
  },
]

export default function Trust() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 border-b border-synth-border">
        <div className="wrap-sm text-center">
          <p className="eyebrow">Trust Centre</p>
          <h1 className="font-serif text-[clamp(36px,5vw,60px)] font-normal leading-[1.1] tracking-[-1px] text-synth-text-1 mb-4">
            Your data, <em className="text-synth-accent">your rules</em>
          </h1>
          <p className="text-[17px] text-synth-text-2 leading-[1.7]">
            Built with privacy and security at the core. You stay in control — always.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="bg-synth-surface/50 border border-synth-border rounded-[22px] p-8">
                  <div className="w-12 h-12 bg-synth-surface border border-synth-border rounded-[14px] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-synth-text-1" />
                  </div>
                  <h3 className="font-semibold text-synth-text-1 mb-2">{p.title}</h3>
                  <p className="text-[13px] text-synth-text-2 leading-[1.65]">{p.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Compliance badges */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 text-[13px] text-synth-text-3">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-synth-green" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-synth-green" />
                GDPR Ready
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-synth-green" />
                HIPAA Options
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-synth-green" />
                POPIA Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-synth-border">
        <div className="wrap">
          <div className="bg-synth-surface border border-synth-border rounded-[22px] p-14 max-w-[600px] mx-auto text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-synth-text-1 mb-3">
              Questions about security?
            </h2>
            <p className="text-[15px] text-synth-text-2 leading-[1.7] mb-7">
              Our security team is happy to share our SOC 2 report, discuss custom compliance requirements, or walk you through our architecture.
            </p>
            <a
              href="mailto:security@synth.ai?subject=Security Inquiry"
              className="inline-block bg-synth-text-1 text-white rounded-full px-7 py-3 text-[15px] font-medium hover:bg-[#2A2835] transition-colors"
            >
              Contact security team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
