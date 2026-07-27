import { Link } from "wouter"
import { ArrowRight } from "lucide-react"

interface WorkflowCard {
  tag: string
  tagColor: string
  tagText: string
  title: string
  desc: string
}

interface SolutionPageProps {
  eyebrow: string
  headline: string
  headlineAccent: string
  subhead: string
  ctaText: string
  ctaHref: string
  workflowTitle: string
  workflowSub: string
  workflows: WorkflowCard[]
  heroImage?: string
  heroImageAlt?: string
  heroGradient?: string
}

export function SolutionPageLayout({
  eyebrow,
  headline,
  headlineAccent,
  subhead,
  ctaText,
  ctaHref,
  workflowTitle,
  workflowSub,
  workflows,
  heroImage,
  heroImageAlt,
}: SolutionPageProps) {
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

          {heroImage && (
            <div className="overflow-hidden rounded-[32px] border border-synth-border bg-synth-surface shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <img
                src={heroImage}
                alt={heroImageAlt ?? eyebrow}
                className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover"
              />
            </div>
          )}

          <div className="mt-10 max-w-[780px] mx-auto text-center">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="font-serif text-[clamp(36px,5vw,60px)] font-normal leading-[1.1] tracking-[-1px] text-synth-text-1 mb-4">
              {headline}<br />
              <em className="text-synth-accent">{headlineAccent}</em>
            </h1>
            <p className="text-[17px] text-synth-text-2 leading-[1.7] max-w-[640px] mx-auto mb-8">
              {subhead}
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-synth-text-1 text-white rounded-full px-7 py-3 text-[15px] font-medium hover:bg-[#2A2835] transition-colors"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Cards */}
      <section className="py-20">
        <div className="wrap">
          <p className="eyebrow">Only Synth Can Do</p>
          <h2 className="section-title">{workflowTitle}</h2>
          <p className="section-sub">{workflowSub}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-[900px] mx-auto">
            {workflows.map((wf, i) => (
              <div
                key={i}
                className="bg-synth-surface border border-synth-border rounded-[16px] p-7 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-synth-accent/20 transition-all duration-200"
              >
                <span
                  className="inline-block text-[11px] font-semibold uppercase tracking-[1px] rounded-full px-2.5 py-0.5 mb-3.5"
                  style={{ background: wf.tagColor, color: wf.tagText }}
                >
                  {wf.tag}
                </span>
                <h3 className="text-[15px] font-semibold text-synth-text-1 mb-1.5">{wf.title}</h3>
                <p className="text-[13px] text-synth-text-2 leading-[1.6]">{wf.desc}</p>
                <div className="inline-flex items-center gap-1 text-[12px] text-synth-accent font-medium mt-3.5 border-b border-transparent hover:border-synth-accent transition-colors cursor-pointer">
                  Watch how it works <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 max-w-[900px] mx-auto text-center text-[14px] text-synth-text-3">
            <p>
              Don’t see your workflow listed? We build custom agents across departments — get early access or request a tailored solution.
            </p>
            <Link href="/#waitlist" className="inline-flex items-center gap-2 mt-4 text-synth-text-1 font-semibold hover:text-synth-accent transition-colors">
              Talk to us <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-synth-border">
        <div className="wrap">
          <div className="bg-synth-surface border border-synth-border rounded-[22px] p-14 max-w-[600px] mx-auto text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-synth-text-1 mb-3">
              Come and see what done actually looks like!!
            </h2>
            <p className="text-[15px] text-synth-text-2 leading-[1.7] mb-7">
              Join the waitlist to be first when this solution launches.
            </p>
            <form className="flex gap-2 max-w-[380px] mx-auto mb-3" onSubmit={(e) => { e.preventDefault(); alert("Thanks! You're on the list."); }}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 bg-synth-bg border border-synth-border-med rounded-full px-5 py-3 text-[14px] text-synth-text-1 outline-none transition-all focus:border-synth-accent"
              />
              <button
                type="submit"
                className="bg-synth-accent text-white rounded-full px-5 py-3 text-[14px] font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                Join waitlist
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
