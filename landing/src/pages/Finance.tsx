import { SolutionPageLayout } from "@/components/sections/SolutionPageLayout"

const workflows = [
  {
    tag: "Investment Analysis",
    tagColor: "#E6FFE6",
    tagText: "#1A6B1A",
    title: "Build live multi-timeframe chart dashboards",
    desc: "Perform technical analysis on any stock or asset and create an interactive web report to visualise findings in real time — shareable with one link.",
  },
  {
    tag: "Research at Scale",
    tagColor: "#E6F4FF",
    tagText: "#1752A3",
    title: "Collect financial reports for hundreds of firms",
    desc: "Automatically gather quarterly and annual reports for hundreds of public companies and compile them into a structured, searchable directory.",
  },
  {
    tag: "Financial Modelling",
    tagColor: "#FFF0E6",
    tagText: "#B84D00",
    title: "Build three-statement models from annual reports",
    desc: "Upload a company's annual report and get a complete DCF or three-statement model in Excel — formulas, assumptions, and sensitivity tables included.",
  },
  {
    tag: "Market Intelligence",
    tagColor: "#EFF6FF",
    tagText: "#2563EB",
    title: "Size and validate new market opportunities",
    desc: "Research addressable market segments using parallel agents — competitive analysis, demand signals, and growth projections delivered in a structured report.",
  },
]

export default function Finance() {
  return (
    <SolutionPageLayout
      eyebrow="Synth for Finance"
      headline="From raw data to"
      headlineAccent="financial intelligence"
      subhead="Build financial models, analyse live market data, research hundreds of firms in parallel, and produce investment-ready deliverables — in one prompt."
      ctaText="Join waitlist"
      ctaHref="/#waitlist"
      workflowTitle="End-to-end finance workflows"
      workflowSub="Go from raw data to final deliverable without leaving your chat window."
      workflows={workflows}
      heroImage="/finance.png"
      heroImageAlt="Finance solution image"
    />
  )
}
