import { Link } from "wouter"

const solutions = [
  { label: "Marketing", href: "/solutions/marketing" },
  { label: "Sales", href: "/solutions/sales" },
  { label: "Finance", href: "/solutions/finance" },
  { label: "Product", href: "/solutions/product" },
  { label: "Executive Workflow", href: "/solutions/personal" },
  { label: "Healthcare Admin", href: "/solutions/healthcare" },
]

const compare = [
  { label: "vs. Openclaw", href: "/compare/vsOpenclaw" },
  { label: "vs. ChatGPT", href: "/compare/vsChatgpt" },
  { label: "vs. Trixta", href: "/compare/vsTrixta" },
  { label: "vs. Nyla", href: "/compare/vsNyla" }
]

const product = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "API", href: "/api-docs" },
  { label: "Custom MCPs", href: "/mcp" }
]

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "POPIA Compliance", href: "/data-processing" },
  { label: "Data Processing", href: "/data-processing" },
  { label: "Cookie Policy", href: "/cookies" }
]

export function Footer() {
  return (
    <footer className="border-t border-synth-border bg-synth-surface">
      <div className="wrap py-14 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-[1.8fr_repeat(4,1fr)] gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-[22px] text-synth-text-1 tracking-[-0.3px] font-medium">
              synth<span className="text-indigo-600">.ai</span>
            </Link>
            <p className="text-[13px] text-synth-text-3 leading-[1.65] mt-2 max-w-[200px]">
              Bridging the GAP between thinking and doing(execution).
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-[12px] font-semibold text-synth-text-1 uppercase tracking-[1px] mb-3">Solutions</h4>
            <ul className="space-y-2">
              {solutions.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-synth-text-3 hover:text-synth-text-1 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[12px] font-semibold text-synth-text-1 uppercase tracking-[1px] mb-3">Product</h4>
            <ul className="space-y-2">
              {product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-synth-text-3 hover:text-synth-text-1 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compare*/}
          <div>
            <h4 className="text-[12px] font-semibold text-synth-text-1 uppercase tracking-[1px] mb-3">Compare</h4>
            <ul className="space-y-2">
              {compare.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-synth-text-3 hover:text-synth-text-1 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[12px] font-semibold text-synth-text-1 uppercase tracking-[1px] mb-3">Legal</h4>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-synth-text-3 hover:text-synth-text-1 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-synth-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-synth-text-3">© 2026 Synth AI · hello@synthai.world</p>
          <div className="flex gap-3">
            {["LinkedIn", "X / Twitter", "Instagram", "WhatsApp"].map((item) => (
              <a key={item} href="#" className="text-[12px] text-synth-text-3 hover:text-synth-text-1 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}