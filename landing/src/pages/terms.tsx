import { Link } from 'wouter'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Simple Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif font-medium tracking-tight hover:opacity-70 transition-opacity">
            synth<span className="text-indigo-600">.ai</span>
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Back to Pricing
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-5xl font-serif font-medium tracking-tight text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-gray-400 font-medium">Last updated: July 06, 2026</p>
        </header>

        <div className="prose prose-gray prose-lg max-w-none">
          <p className="lead text-xl text-gray-600 mb-12 leading-relaxed">
            Welcome to Synth. Before you access our services, please read these Terms of Use carefully. These Terms govern your use of the Synth platform and any associated applications.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using Synth, you agree to be bound by these Terms and our Privacy Policy. If you are using the Services on behalf of an entity, you represent that you have the authority to bind that entity to these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              Synth provides an autonomous AI agent platform designed to automate complex operational workflows. Our services include planning, research, communication automation, and integration with third-party tools.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You must be at least 18 years old to use Synth. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">4. Fees and Payment</h2>
            <p className="text-gray-600 mb-4">
              Certain features of Synth require a paid subscription. All fees are non-refundable except as required by law. We reserve the right to change our pricing upon notice to you.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">5. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              Synth and its original content, features, and functionality are owned by Synth AI (Pty) Ltd and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600">
              <strong>Your Content:</strong> You retain all rights to the data you input into Synth. We do not claim ownership of your proprietary business knowledge.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">6. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, Synth shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">7. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-12 bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-xl font-serif font-medium text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms, please contact our legal team.
            </p>
            <a href="mailto:legal@synth.ai" className="inline-flex items-center text-indigo-600 font-bold hover:underline">
              legal@synth.ai
            </a>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
          <p>© 2026 Synth AI (Pty) Ltd.</p>
          <div className="flex gap-6">
            <a href="mailto:privacy@synth.ai" className="hover:text-gray-900 transition-colors">Privacy</a>
            <Link href="/data-processing" className="hover:text-gray-900 transition-colors">Data Processing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}