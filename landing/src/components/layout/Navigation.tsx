import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { ChevronDown, Menu, X } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

const solutions = [
  { label: "Marketing", desc: "Campaigns, content, and creative — on autopilot", icon: "📈", href: "/solutions/marketing" },
  { label: "Sales", desc: "Your pipeline, researched and ready before you wake up. Increase revenue", icon: "🤝", href: "/solutions/sales" },
  { label: "Finance", desc: "Analysis that used to take your team a week", icon: "💹", href: "/solutions/finance" },
  { label: "Product", desc: "Strategy, roadmap, discovery, onboarding & customer support ", icon: "🛍️", href: "/solutions/product" },
  { label: "Synth Personal", desc: "Your proactive AI chief of staff", icon: "🙋", href: "/solutions/personal" },
  { label: "Healthcare Admin", desc: "Claims, denials, scheduling & more", icon: "🏥", href: "/solutions/healthcare" },
]

export function Navigation() {
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solutionsRef = useRef<HTMLDivElement>(null)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const [location] = useLocation()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) setSolutionsOpen(false)
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) setResourcesOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSolutionsOpen(false)
    setResourcesOpen(false)
  }, [location])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-synth-bg/90 backdrop-blur-[20px] border-b border-synth-border' : 'bg-transparent'}`}>
      <div className="wrap">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-[24px] text-synth-text-1 tracking-[-0.3px] flex-shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="Synth logo" className="h-[2.5rem] w-[2.5rem] object-contain" />
              <em>synth</em>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 px-8">
            {/* Solutions Mega Menu */}
            <div className="relative" ref={solutionsRef}>
              <button
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-normal transition-colors ${solutionsOpen ? 'text-synth-text-1 bg-black/[0.04]' : 'text-synth-text-2 hover:text-synth-text-1 hover:bg-black/[0.04]'}`}
              >
                Solutions
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {solutionsOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 bg-synth-surface border border-synth-border rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)] min-w-[560px] p-3 z-50 animate-fade-in">
                  <div className="grid grid-cols-2 gap-0.5">
                    {solutions.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-synth-surface-2 transition-colors"
                        onClick={() => setSolutionsOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-md flex items-center justify-center text-[17px] bg-synth-accent-light flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-synth-text-1">{item.label}</div>
                          <div className="text-[12px] text-synth-text-3 leading-[1.4]">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/pages/feature" className="px-3 py-1.5 rounded-md text-[14px] font-normal text-synth-text-2 hover:text-synth-text-1 hover:bg-black/[0.04] transition-colors">
              Features
            </Link>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-normal transition-colors ${resourcesOpen ? 'text-synth-text-1 bg-black/[0.04]' : 'text-synth-text-2 hover:text-synth-text-1 hover:bg-black/[0.04]'}`}
              >
                Resources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 bg-synth-surface border border-synth-border rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)] min-w-[200px] p-3 z-50 animate-fade-in">
                  <div className="mb-2 px-1">
                    <div className="text-[12px] font-semibold text-synth-text-1 uppercase tracking-[1px] mb-2">Compare</div>
                    {/* UPDATED PATHS TO MATCH ROUTING */}
                    <Link href="/compare/vsChatgpt" className="block px-3 py-2 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors" onClick={() => setResourcesOpen(false)}>vs ChatGPT</Link>
                    <Link href="/compare/vsOpenclaw" className="block px-3 py-2 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors" onClick={() => setResourcesOpen(false)}>vs Openclaw</Link>
                    <Link href="/compare/vsTrixta" className="block px-3 py-2 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors" onClick={() => setResourcesOpen(false)}>vs Trixta</Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-3 py-1.5 rounded-md text-[14px] font-normal text-synth-text-2 hover:text-synth-text-1 hover:bg-black/[0.04] transition-colors">
              Pricing
            </Link>

            <a href="mailto:hello@synthai.world" className="px-3 py-1.5 rounded-md text-[14px] font-normal text-synth-text-2 hover:text-synth-text-1 hover:bg-black/[0.04] transition-colors">
              Enterprise
            </a>
          </div>

          {/* Right CTAs */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <a href="mailto:hello@synthai.world" className="text-[14px] font-medium text-synth-text-2 px-3.5 py-[7px] rounded-md hover:bg-black/[0.05] hover:text-synth-text-1 transition-all border border-transparent">
              Contact us
            </a>
            <Link 
              href="/#waitlist"
              className="text-[14px] font-medium text-white px-[18px] py-2 rounded-full bg-synth-text-1 hover:bg-[#2A2835] transition-colors"
            >
              Join waitlist
            </Link>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="px-4 py-2 rounded-full bg-slate-700 text-white text-[14px] font-medium hover:bg-slate-600 transition-colors"
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-synth-surface border-t border-synth-border px-4 py-4 space-y-1 shadow-lg">
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-synth-text-3 mb-2 px-3">Solutions</div>
          {solutions.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors">
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="border-t border-synth-border my-2" />
          <Link href="/pages/feature" className="block px-3 py-2.5 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors">Features</Link>
          <Link href="/pricing" className="block px-3 py-2.5 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors">Pricing</Link>
          <a href="mailto:hello@synth.ai" className="block px-3 py-2.5 text-[14px] text-synth-text-2 rounded-md hover:bg-synth-surface-2 hover:text-synth-text-1 transition-colors">Enterprise</a>
          <div className="border-t border-synth-border my-2 pt-2">
            <a href="mailto:hello@synth.ai" className="block w-full text-left px-3 py-2.5 text-[14px] text-synth-text-2">Contact us</a>
            <Link href="/#waitlist" className="block w-full text-center mt-2 text-[14px] font-medium text-white px-4 py-2.5 rounded-full bg-synth-text-1">Join waitlist</Link>
          </div>
        </div>
      )}
    </nav>
  )
}