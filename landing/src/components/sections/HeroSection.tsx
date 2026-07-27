import { useState, useEffect, FormEvent } from "react"

const chips = [
  { icon: "📑", text: "Find new government and private tenders every morning" },
  { icon: "🏭", text: "Identify cheaper suppliers and negotiate better quotes" },
  { icon: "✍️", text: "Create a week's worth of LinkedIn posts from our blog" },
  { icon: "🎥", text: "Analyze top-performing TikTok videos and recommend winning hooks" },
  { icon: "📊", text: "Monitor our competitors and report every major change" },
  { icon: "💰", text: "Generate weekly cash flow forecasts from our accounting data" },
  { icon: "🤝", text: "Find, enrich and qualify 500 potential customers" },
  { icon: "📢", text: "Plan, create and launch our next marketing campaign" },
  { icon: "📄", text: "Review contracts and flag legal risks before signing" },
  { icon: "📦", text: "Monitor inventory and automatically reorder low stock" },
  { icon: "🎥", text: "Turn webinars into short-form videos and captions" },
  { icon: "🚚", text: "Track delayed shipments and notify affected customers" },
  { icon: "📈", text: "Research a new market and deliver a complete expansion report" },
]

const verticals = [
  "Sales",
  "Marketing",
  "Finance",
  "Product",
  "Synth Personal",
  "Healthcare Admin",
]

export function HeroSection() {
  const [chipIdx, setChipIdx] = useState(0)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  // Rotate the chip carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setChipIdx((prev) => (prev + 1) % chips.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  // Fetch live waitlist count from Netlify Function (optional – uncomment when function is deployed)
  useEffect(() => {
    fetch("/.netlify/functions/waitlist-count")
      .then((res) => res.json())
      .then((data) => setWaitlistCount(data.count))
      .catch(() => setWaitlistCount(null))
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // Send form data to Netlify
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "form-name": "waitlist",
        email: email.trim(),
      }).toString(),
    })
      .then(() => {
        setSubmitted(true)
        setEmail("")
        // Optimistically bump the count
        if (waitlistCount !== null) setWaitlistCount((prev) => (prev ?? 0) + 1)
        setTimeout(() => setSubmitted(false), 4500)
      })
      .catch((err) => console.error("Form submission error:", err))
  }

  const currentChip = chips[chipIdx]

  return (
    <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="wrap relative z-10">
        <div className="text-center max-w-[800px] mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-synth-accent-light border border-synth-accent/20 text-synth-accent text-[13px] font-medium rounded-full px-4 py-1.5 mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-synth-accent animate-blink" />
            Private beta. AI workforce
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[clamp(44px,6.5vw,80px)] font-normal leading-[1.06] tracking-[-2px] text-synth-text-1 mb-5">
            Meet Synth.
            <br />
            Your AI workforce for every department.{" "}
            <em className="text-synth-accent">Deploy autonomous agents</em> across:
          </h1>

          {/* Static vertical pill row */}
          <div className="flex justify-center flex-wrap gap-2 mb-4">
            {verticals.map((v) => (
              <span
                key={v}
                className="bg-synth-surface border border-synth-border-med rounded-full px-3 py-0.5 text-xs text-synth-text-2"
              >
                {v}
              </span>
            ))}
          </div>
          <p className="text-sm text-synth-text-3 text-center max-w-[680px] mx-auto mb-8">
            A few things it can already do — plus any custom workflow you need.
          </p>

          {/* Chip carousel */}
          <div className="flex items-center justify-center gap-2.5 mb-8 flex-wrap">
            <span className="text-[17px] text-synth-text-2">Watch it</span>
            <div
              className="inline-flex items-center gap-1.5 bg-synth-surface border border-synth-border-med rounded-full px-3.5 py-1.5 text-[14px] font-medium text-synth-text-1 shadow-sm transition-all duration-300"
              key={chipIdx}
            >
              <span className="text-[29px]">{currentChip.icon}</span>
              <span>{currentChip.text}</span>
            </div>
            <span className="text-[17px] text-synth-text-2">for you</span>
          </div>

          {/* Form */}
<form
  name="waitlist"
  method="POST"
  data-netlify="true"
  onSubmit={handleSubmit}
  className="grid grid-cols-2 gap-2 max-w-[420px] mx-auto mb-3.5"
>
  {/* Netlify required hidden fields */}
  <input type="hidden" name="form-name" value="waitlist" />
  <input type="hidden" name="bot-field" />

  <input
    type="email"
    name="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your work email"
    required
    autoComplete="email"
    className="w-full bg-synth-surface border border-synth-border-med rounded-full px-5 py-3 text-[15px] text-synth-text-1 outline-none shadow-sm transition-all focus:border-synth-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] placeholder:text-synth-text-3"
  />
  <button
    type="submit"
    disabled={submitted}
    className={`w-full text-white rounded-full px-4 py-3 text-[15px] font-medium whitespace-nowrap transition-colors ${
      submitted
        ? "bg-synth-green"
        : "bg-synth-text-1 hover:bg-[#2A2835]"
    }`}
  >
    {submitted ? "✓ You're on the list!" : "Get early access"}
  </button>
</form>

          <p className="text-[13px] text-synth-text-3">
            {waitlistCount !== null ? (
              <strong className="text-synth-text-2 font-medium">
                {waitlistCount.toLocaleString()} people
              </strong>
            ) : (
              <strong className="text-synth-text-2 font-medium">
                2,240 people
              </strong>
            )}{" "}
            already on the waitlist ·{" "}
          </p>
        </div>
      </div>
    </section>
  )
}