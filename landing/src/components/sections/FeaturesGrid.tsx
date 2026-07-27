'use client'

import { useState } from 'react'

const categories = [
  {
    id: 'research',
    label: 'Research & Analysis',
    tools: [
      { icon: '🔍', name: 'Deep Research', desc: 'Web + document' },
      { icon: '📊', name: 'Data Analysis', desc: 'Charts & models' },
      { icon: '🧠', name: 'Long-term Memory', desc: 'Learns over time' },
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity',
    tools: [
      { icon: '📅', name: 'Scheduling', desc: 'Calendar, TODO & booking' },
      { icon: '📝', name: 'Documents', desc: 'PDFs, forms, slides' },
      { icon: '⚡', name: 'Automations', desc: 'Multi-step tasks' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    tools: [
      { icon: '✉️', name: 'Communications', desc: 'Email & messaging' },
      { icon: '💬', name: 'WhatsApp / Instagram', desc: 'Your existing apps' },
      { icon: '🌐', name: 'Browser Agent', desc: 'Web browsing' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    tools: [
      { icon: '🔌', name: 'Connectors', desc: '200+ integrations' },
    ],
  },
]

const connectorLogos = [
  // Top row: focus logos (WhatsApp + new GitHub & YouTube)
  { name: 'WhatsApp', file: 'WhatsApp.jpg' },
  { name: 'YouTube', file: 'Youtube.png' },
  { name: 'GitHub', file: 'Github.jpg' },

  // Common connectors
  { name: 'Xero', file: 'Xero.png' },
  { name: 'Instagram', file: 'instagram.jpg' },
  { name: 'Asana', file: 'asana.png' },
  { name: 'Slack', file: 'slack.png' },
  { name: 'Figma', file: 'Figma.png' },
  { name: 'PayPal', file: 'Paypal.png' },
  { name: 'Shopify', file: 'Shopify.jpg' },
  { name: 'Gmail', file: 'gmail.jpg' },
  { name: 'Google Meet', file: 'Google meet.jpg' },
  { name: 'Google Calendar', file: 'google calendar.png' },
  { name: 'Google Drive', file: 'google drive.png' },
  { name: 'Dropbox', file: 'Dropbox.png' },
  { name: 'HubSpot', file: 'hubspot.png' },
  { name: 'Meta Ads Manager', file: 'meta ads manager.png' },
  { name: 'Microsoft 365', file: 'microsoft365.jpg' },
  { name: 'Notion', file: 'notion.png' },
  { name: 'Sage', file: 'sage.png' },
  { name: 'Salesforce', file: 'salesforce.png' },
  { name: 'SARS eFiling', file: 'sars efiling.png' },
  { name: 'Stripe', file: 'stripe.png' },
  { name: 'TikTok', file: 'tiktok.png' },
  { name: 'Yoco', file: 'Yoco.png' },
  { name: 'iKhokha', file: 'ikhokha.png' },
  { name: 'Airbnb', file: 'airbnb.png' },
]

export function FeaturesGrid() {
  const [activeTab, setActiveTab] = useState('research')
  const [showMoreConnectors, setShowMoreConnectors] = useState(false)
  const activeCategory = categories.find((cat) => cat.id === activeTab)

  return (
    <section className="py-24 border-t border-synth-border" id="features">
      <div className="wrap">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="eyebrow text-synth-text-3 uppercase tracking-wider mb-4">
            One platform. Every capability.
          </p>
          <h2 className="section-title text-4xl md:text-5xl font-bold mb-6">
            Everything in a single agent
          </h2>
          <p className="section-sub text-lg text-synth-text-2 max-w-2xl mx-auto">
            Synth brings together research, communication, scheduling, documents, and integrations — all accessible from where you already work.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === category.id
                  ? 'bg-synth-accent text-white shadow-lg shadow-synth-accent/30'
                  : 'bg-synth-surface border border-synth-border text-synth-text-2 hover:border-synth-accent/50 hover:bg-synth-surface/80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Bento Grid with Variance */}
        <div className="max-w-5xl mx-auto">
          {activeCategory?.id === 'integrations' ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-synth-border bg-synth-surface/80 p-6 shadow-sm shadow-synth-border/10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-semibold text-synth-text-1">
                      Seamless MCP integrations
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMoreConnectors((value) => !value)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-synth-border bg-white/5 px-5 py-3 text-sm font-medium text-synth-text-1 transition hover:border-synth-accent/50 hover:bg-synth-accent/10"
                  >
                    {showMoreConnectors ? 'Hide connectors' : 'Show more connectors'}
                    <span className={`transition-transform ${showMoreConnectors ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {connectorLogos.slice(0, 9).map((connector) => (
                    <div
                      key={connector.name}
                      className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-synth-border bg-white/5 p-4 shadow-sm shadow-synth-border/5 transition hover:scale-[1.02] hover:border-synth-accent/40"
                    >
                      <img
                        className="h-16 w-auto object-contain"
                        src={encodeURI(`/connectors/${connector.file}`)}
                        alt={connector.name}
                      />
                      <span className="text-center text-sm font-medium text-synth-text-2">
                        {connector.name}
                      </span>
                    </div>
                  ))}
                </div>

                {showMoreConnectors && (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {connectorLogos.slice(9).map((connector) => (
                      <div
                        key={connector.name}
                        className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-synth-border bg-white/5 p-4 shadow-sm shadow-synth-border/5 transition hover:scale-[1.02] hover:border-synth-accent/40"
                      >
                        <img
                          className="h-16 w-auto object-contain"
                          src={encodeURI(`/connectors/${connector.file}`)}
                          alt={connector.name}
                        />
                        <span className="text-center text-sm font-medium text-synth-text-2">
                          {connector.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
              {activeCategory?.tools.map((tool, index) => {
                // Create variance in sizes and positions
                const isLarge = index === 0
                const isWide = index === activeCategory.tools.length - 1 && activeCategory.tools.length % 2 === 1

                return (
                  <div
                    key={tool.name}
                    className={`group relative overflow-hidden rounded-2xl border border-synth-border bg-gradient-to-br from-synth-surface to-synth-surface/50 p-6 transition-all duration-500 hover:shadow-xl hover:border-synth-accent/40 hover:scale-105 ${
                      isLarge ? 'md:col-span-1 md:row-span-2' : ''
                    } ${isWide ? 'lg:col-span-2' : ''}`}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-synth-accent/5 to-transparent pointer-events-none" />

                    {/* Content */}
                    <div className={`relative z-10 flex flex-col ${isLarge ? 'h-full justify-between' : ''}`}>
                      <div>
                        <div
                          className={`mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 origin-left ${
                            isLarge ? 'text-5xl' : 'text-3xl'
                          }`}
                        >
                          {tool.icon}
                        </div>
                        <h3 className={`font-semibold text-synth-text-1 mb-2 transition-colors duration-300 group-hover:text-synth-accent ${
                          isLarge ? 'text-xl' : 'text-base'
                        }`}>
                          {tool.name}
                        </h3>
                      </div>

                      <p className={`text-synth-text-3 transition-colors duration-300 group-hover:text-synth-text-2 ${
                        isLarge ? 'text-base' : 'text-sm'
                      }`}>
                        {tool.desc}
                      </p>
                    </div>

                    {/* Accent line on hover */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-synth-accent to-transparent w-0 group-hover:w-full transition-all duration-500" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-synth-text-2 mb-6">
            Ready to experience hands on ai execution?
          </p>
          <button className="px-8 py-3 rounded-full bg-synth-accent text-white font-medium hover:shadow-lg hover:shadow-synth-accent/40 transition-all duration-300 hover:scale-105">
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  )
}