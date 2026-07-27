'use client'

import { useState } from 'react'
import { 
  RotateCcw, 
  Zap, 
  Search, 
  Globe, 
  Layout, 
  Image, 
  Clock, 
  Calendar, 
  Monitor,
  ChevronDown,
  Info
} from 'lucide-react'

const plans = [
  {
    tier: 'Starter',
    monthly: 15,
    annual: 12.5, // $150 / 12 approx
    desc: 'Standard monthly usage',
    cta: 'Join waitlist',
    featured: false,
    credits: '4,000 credits per month',
    features: [
      { icon: RotateCcw, text: '300 refresh credits everyday' },
      { icon: Zap, text: '4,000 credits per month' },
      { icon: Search, text: 'In-depth research for everyday tasks' },
      { icon: Globe, text: 'Proactive daily briefings & alerts' },
      { icon: Layout, text: 'Insightful slides for regular content' },
      { icon: Image, text: 'Task scaling with Wide Research' },
      { icon: Info, text: 'Early access to beta features' },
      { icon: Clock, text: '20 concurrent tasks' },
      { icon: Calendar, text: '20 scheduled tasks' },
    ],
  },
  {
    tier: 'Pro',
    monthly: 35,
    annual: 29.1666, // $350 / 12 approx
    desc: 'Customizable monthly usage',
    cta: 'Join waitlist',
    featured: true,
    credits: '8,000 credits / month',
    features: [
      { icon: RotateCcw, text: '300 refresh credits everyday' },
      { icon: Zap, text: '8,000 credits per month' },
      { icon: Search, text: 'In-depth research with self-set usage' },
      { icon: Globe, text: 'Proactive daily briefings & alerts' },
      { icon: Layout, text: 'Insightful slides for steady creation' },
      { icon: Image, text: 'Wide Research scaled to your chosen plan' },
      { icon: Info, text: 'Early access to beta features' },
      { icon: Clock, text: '20 concurrent tasks' },
      { icon: Calendar, text: '40 scheduled tasks' },
    ],
  },
  {
    tier: 'Max',
    monthly: 170,
    annual: 141.6666, // $1700 / 12 approx
    desc: 'Extended usage for productivity',
    cta: 'Join waitlist',
    featured: false,
    credits: '40,000 credits / month',
    specialFeature: { icon: Monitor, text: 'Free Cloud Computer', color: 'text-blue-500' },
    features: [
      { icon: RotateCcw, text: '300 refresh credits everyday' },
      { icon: Zap, text: '40,000 credits per month' },
      { icon: Search, text: 'In-depth research for large-scale tasks' },
      { icon: Globe, text: 'Proactive daily briefings & alerts' },
      { icon: Layout, text: 'Insightful slides for batch production' },
      { icon: Image, text: 'Wide Research for sustained heavy use' },
      { icon: Info, text: 'Early access to beta features' },
      { icon: Clock, text: '20 concurrent tasks' },
      { icon: Calendar, text: 'unlimited scheduled tasks' },
    ],
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif font-medium text-gray-900 mb-12">
            synth Pricing Plans
          </h2>

          {/* synth Style Toggle */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl mb-4">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                !isAnnual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                isAnnual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annually · Save 17%
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-white border border-gray-200 rounded-[32px] p-8 transition-all hover:shadow-xl ${
                plan.featured ? 'ring-1 ring-gray-900' : ''
              }`}
            >
              <div className="mb-8">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-medium text-gray-900">$</span>
                  <span className="text-6xl font-medium text-gray-900 tracking-tight">
                    {isAnnual ? Math.floor(plan.annual) : plan.monthly}
                  </span>
                  <span className="text-lg text-gray-400">/ month</span>
                </div>
                <p className="text-gray-500 text-lg mb-8">{plan.desc}</p>
                <a href="/#waitlist" className="w-full inline-flex justify-center py-4 bg-gray-900 text-white rounded-2xl font-medium text-lg hover:bg-gray-800 transition-colors">
                  {plan.cta}
                </a>
              </div>

              {/* Credit Dropdown Style */}
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                <span className="text-gray-700 font-medium">{plan.credits}</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {plan.specialFeature && (
                  <div className={`flex items-center gap-3 ${plan.specialFeature.color} font-medium`}>
                    <plan.specialFeature.icon className="w-5 h-5" />
                    <span className="underline decoration-2 underline-offset-4 cursor-pointer">
                      {plan.specialFeature.text}
                    </span>
                  </div>
                )}
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-600">
                    <feature.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px]">{feature.text}</span>
                    <Info className="w-4 h-4 text-gray-300 ml-auto cursor-help" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Cards (Team/Security) */}
        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-[32px] p-8 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                <Layout className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-900">Synth Plans for Teams & Businesses</h4>
                <p className="text-gray-500">Flexible plans for teams of all sizes.</p>
              </div>
            </div>
            <a href="/#waitlist" className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 hover:bg-gray-50 transition-all">
              Get Team
            </a>
          </div>

          <div className="bg-gray-50 rounded-[32px] p-8 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                <Globe className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-900">Security and Compliance</h4>
                <p className="text-gray-500">Enterprise-grade security and certifications.</p>
              </div>
            </div>
            <a href="/#waitlist" className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 hover:bg-gray-50 transition-all">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}