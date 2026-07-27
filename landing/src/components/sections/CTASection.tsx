import { useState } from "react"

export function CTASection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail("")
    }, 4500)
  }

  return (
    <section className="py-24 border-t border-synth-border relative overflow-hidden" id="waitlist">
      {/* Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-synth-accent-light rounded-full pointer-events-none"
        style={{ filter: "blur(80px)", opacity: 0.6 }}
      />

      <div className="wrap relative z-10">
        <div className="bg-synth-surface border border-synth-border rounded-[22px] p-14 max-w-[600px] mx-auto text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <h2 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-synth-text-1 mb-3">
            This is what comes after software. Your business on autopilot, all in one platform.
          </h2>
          <p className="text-[15px] text-synth-text-2 leading-[1.7] mb-7">
            We're building something we'd want to use ourselves. you'll be first to get access when we launch, Join the waitlist!!
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-[380px] mx-auto mb-3.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-synth-bg border border-synth-border-med rounded-full px-5 py-3 text-[14px] text-synth-text-1 outline-none transition-all focus:border-synth-accent"
            />
            <button
              type="submit"
              disabled={submitted}
              className={`text-white rounded-full px-5 py-3 text-[14px] font-medium transition-colors ${submitted ? 'bg-synth-green' : 'bg-synth-accent hover:bg-[#1D4ED8]'}`}
            >
              {submitted ? "✓ You're on the list!" : "Join waitlist"}
            </button>
          </form>
          <p className="text-[12px] text-synth-text-3">No spam. No commitment. Just early access.</p>
          <div className="flex justify-center gap-5 mt-5">
            <a href="mailto:hello@synth.ai?subject=API access" className="text-[13px] text-synth-text-3 flex items-center gap-1 hover:text-synth-accent transition-colors">
              ⟨/⟩ API access
            </a>
            <a href="mailto:healthcare@synthai.world" className="text-[13px] text-synth-text-3 flex items-center gap-1 hover:text-synth-accent transition-colors">
              🏥 Healthcare demo
            </a>
            <a href="mailto:hello@synthai.world?subject=Enterprise" className="text-[13px] text-synth-text-3 flex items-center gap-1 hover:text-synth-accent transition-colors">
              🏢 Enterprise
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
