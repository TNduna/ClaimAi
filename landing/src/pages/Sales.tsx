import { SolutionPageLayout } from "@/components/sections/SolutionPageLayout"
import { SalesResearchTryout } from "@/components/sections/SalesResearchTryout"

const workflows = [
  {
    tag: "Prospecting",
    tagColor: "#E6F4FF",
    tagText: "#1752A3",
    title: "Research and enrich leads at scale",
    desc: "Deploy agents to research hundreds of prospects simultaneously — pulling company data, contact details, funding history, and recent news into a structured brief.",
  },
  {
    tag: "Outreach",
    tagColor: "#E6FFE6",
    tagText: "#1A6B1A",
    title: "Draft hyper-personalised cold outreach",
    desc: "Generate tailored email sequences and LinkedIn messages using each prospect's real context — their role, company news, and stated priorities.",
  },
  {
    tag: "Deal Intelligence",
    tagColor: "#FFF0E6",
    tagText: "#B84D00",
    title: "Prepare for every meeting in minutes",
    desc: "Before any call, Synth builds a deal brief — company overview, stakeholder map, likely objections, and recommended talking points — automatically.",
  },
  {
    tag: "CRM Ops",
    tagColor: "#EFF6FF",
    tagText: "#2563EB",
    title: "Keep your CRM clean without lifting a finger",
    desc: "Synth logs call notes, updates deal stages, flags stale opportunities, and sends follow-up sequences — synced to Salesforce, HubSpot, or your CRM of choice.",
  },
]

export default function Sales() {
  return (
    <>
      <SolutionPageLayout
        eyebrow="Synth for Sales"
        headline="From cold outreach"
        headlineAccent="to closed deals"
        subhead="Synth researches prospects, enriches leads, drafts personalised outreach, and prepares deal intelligence — autonomously, at the scale your pipeline needs."
        ctaText="Join waitlist"
        ctaHref="/#waitlist"
        workflowTitle="End-to-end sales workflows"
        workflowSub="From lead identification to closed deal — handled in a single prompt."
        workflows={workflows}
        heroImage="/sales.png"
        heroImageAlt="Sales solution image"
      />
      <SalesResearchTryout />
    </>
  )
}

