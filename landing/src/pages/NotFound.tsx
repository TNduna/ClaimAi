import { Link } from "wouter"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-[80px] font-normal text-synth-text-1 leading-none mb-4">404</h1>
        <p className="text-[17px] text-synth-text-2 mb-8">This page doesn't exist yet.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-synth-text-1 text-white rounded-full px-6 py-3 text-[15px] font-medium hover:bg-[#2A2835] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
