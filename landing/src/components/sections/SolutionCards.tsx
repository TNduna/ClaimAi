import { Link } from "wouter"
import { ArrowRight } from "lucide-react"

const solutions = [
  { icon: "📈", title: "Marketing", desc: "Your team has the ideas. Synth handles the execution. Campaigns, content, competitor research, and creative assets — produced at a pace your headcount can't match.", color: "#FFECE8", image: "/marketing.png", href: "/solutions/marketing" },
  { icon: "🤝", title: "Sales", desc: "Stop researching. Start selling. Synth enriches leads, writes personalised outreach, preps your deal briefs, and keeps your CRM clean — so you spend your day closing, not preparing.", color: "#E6F4FF", image: "/sales.png", href: "/solutions/sales" },
  { icon: "💹", title: "Finance", desc: "One analyst. Hundreds of companies. Synth builds financial models, collects live market data, researches firms in parallel, and delivers investment-ready outputs — at a scale no team can replicate manually.", color: "#F0FFF4", image: "/finance.png", href: "/solutions/finance" },
  { icon: "🧩", title: "Product", desc: "The foundations that used to take weeks — strategy, roadmaps, positioning, market segmentation, competitive maps — researched, drafted, and kept current by Synth. So your team can focus on the decisions only humans can make.", color: "#EEF2FF", image: "/product.png", href: "/solutions/product" },
  { icon: "🙋", title: "Personal", desc: "Most AI waits to be asked. Synth plans your morning before you wake up, flags what needs you before it becomes urgent, and handles the rest — in WhatsApp, where you already are.", color: "#FFF7ED", image: "/personal.png", href: "/solutions/personal" },
  { icon: "🏥", title: "Healthcare Admin", desc: "Resolve claim denials, apply insurance codes, manage scheduling, and send refill reminders — automating the most painful admin work in healthcare.", color: "#E8FAFF", image: "/healthcare.png", href: "/solutions/healthcare" },
]

export function SolutionCards() {
  return (
    <section className="relative py-24 border-t border-synth-border sky-gradient overflow-hidden">
      <div className="wrap relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[13px] uppercase tracking-[2px] text-synth-text-3 mb-4">Built for every business function</p>
          <h2 className="font-display text-[clamp(42px,5vw,64px)] font-semibold tracking-[-0.04em] text-synth-text-1 mb-4">
            One platform, six business wings — alive and ready.
          </h2>
          <p className="text-[16px] text-synth-text-2 max-w-[720px] mx-auto leading-[1.8]">
            Beautifully crafted workflows, vibrant product imagery, and a fast onboarding path that makes every function feel polished, confident, and unmistakably high-end.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {solutions.map((sol) => (
            <Link
              key={sol.title}
              href={sol.href}
              className="group relative overflow-hidden rounded-[32px] border border-synth-border bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_110px_rgba(15,23,42,0.12)]"
              style={{ backgroundColor: sol.color }}
            >
              <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-50 blur-[34px]" style={{ backgroundColor: sol.color }} />
              <div className="relative z-10">
                <div className="mb-5 rounded-[28px] overflow-hidden border border-white/80 bg-white shadow-sm">
                  <img src={sol.image} alt={sol.title} className="w-full h-[220px] object-contain bg-transparent" />
                </div>
                <h3 className="text-[20px] font-semibold text-synth-text-1 mb-3 font-display">{sol.title}</h3>
                <p className="text-[15px] text-synth-text-2 leading-[1.78] mb-6">{sol.desc}</p>
                <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-synth-accent">
                  <span>Explore {sol.title}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
