import { SolutionPageLayout } from "@/components/sections/SolutionPageLayout"

const workflows = [
  {
    tag: "Campaign Design",
    tagColor: "#FFF0E6",
    tagText: "#B84D00",
    title: "Generate on-brand campaign assets at scale",
    desc: "Produce dozens of design variations for event posters, ad creatives, and social banners — with visual consistency maintained across every format and size.",
  },
  {
    tag: "Competitor Intelligence",
    tagColor: "#E6F4FF",
    tagText: "#1752A3",
    title: "Uncover actionable market intelligence",
    desc: "Automate competitor benchmarking, audience research, and traffic analysis. Deploy hundreds of agents in parallel to surface insights that drive real growth.",
  },
  {
    tag: "Social Media",
    tagColor: "#E6FFE6",
    tagText: "#1A6B1A",
    title: "Batch generate multi-format content",
    desc: "Turn blog posts, reports, or raw data into polished, platform-ready social graphics and carousels for LinkedIn, Instagram, Twitter, and more — simultaneously.",
  },
  {
    tag: "Marketing Ops",
    tagColor: "#EFF6FF",
    tagText: "#2563EB",
    title: "Turn data into actionable insights",
    desc: "Upload any marketing dataset — campaign metrics, keyword data, survey results — and get clear, presentation-ready visualisations in minutes.",
  },
]

export default function Marketing() {
  return (
    <SolutionPageLayout
      eyebrow="Synth for Marketing"
      headline="The autonomous engine for"
      headlineAccent="your entire marketing lifecycle"
      subhead="From research to campaign assets to analysis — Synth handles complex, multi-step marketing workflows from start to finish in a single prompt."
      ctaText="Join waitlist"
      ctaHref="/#waitlist"
      workflowTitle="End-to-end marketing workflows"
      workflowSub="One prompt sets the entire workflow in motion. Synth handles every step autonomously."
      workflows={workflows}
      heroImage="/marketing.png"
      heroImageAlt="Marketing solution image"
    />
  )
}
