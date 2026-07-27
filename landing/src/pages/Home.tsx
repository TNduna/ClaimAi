import { HeroSection } from "@/components/sections/HeroSection"
import { LiveOverviewSection } from "@/components/sections/LiveOverviewSection"
import { SolutionCards } from "@/components/sections/SolutionCards"
import { FeaturesGrid } from "@/components/sections/FeaturesGrid"
import { PricingSection } from "@/components/sections/PricingSection"
import { CTASection } from "@/components/sections/CTASection"

export default function Home() {
  return (
    <div>
      <HeroSection />
      <LiveOverviewSection />
      <SolutionCards />
      <FeaturesGrid />
      <PricingSection />
      <CTASection />
    </div>
  )
}
