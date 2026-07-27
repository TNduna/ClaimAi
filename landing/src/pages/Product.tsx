import { SolutionPageLayout } from "@/components/sections/SolutionPageLayout"

const workflows = [
  {
    tag: "Discovery",
    tagColor: "#EFF6FF",
    tagText: "#2563EB",
    title: "Synthesise user feedback into actionable themes",
    desc: "Upload interview transcripts, support tickets, or review data — Synth clusters feedback into prioritised themes with evidence-backed recommendations.",
  },
  {
    tag: "Documentation",
    tagColor: "#FFF0E6",
    tagText: "#B84D00",
    title: "Draft complete PRDs from a brief",
    desc: "Describe a feature in plain language and Synth produces a full product requirements document — user stories, acceptance criteria, edge cases, and open questions included.",
  },
  {
    tag: "Competitive Research",
    tagColor: "#E6FFE6",
    tagText: "#1A6B1A",
    title: "Map the competitive landscape in minutes",
    desc: "Analyse competitors' product pages, changelogs, and reviews simultaneously. Get a structured teardown of features, positioning gaps, and opportunities.",
  },
  {
    tag: "Roadmapping",
    tagColor: "#E6F4FF",
    tagText: "#1752A3",
    title: "Build data-informed roadmap proposals",
    desc: "Combine user feedback, business priorities, and competitive signals into a draft roadmap — with rationale for each item and trade-off analysis built in.",
  },
]

export default function Product() {
  return (
    <SolutionPageLayout
      eyebrow="Synth for Product"
      headline="From ideas to"
      headlineAccent="shipped features"
      subhead="Draft PRDs, run competitive research, generate spec documents, synthesise user feedback, and prototype ideas — all from a single conversation."
      ctaText="Join waitlist"
      ctaHref="/#waitlist"
      workflowTitle="End-to-end product workflows"
      workflowSub="From discovery to delivery — Synth handles the research so your team can focus on building."
      workflows={workflows}
      heroImage="/product.png"
      heroImageAlt="Product solution image"
    />
  )
}
