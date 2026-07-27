import { ArrowRight } from "lucide-react"

export function AnnouncementBar() {
  return (
    <div className="bg-synth-accent text-white text-center text-[13px] font-medium py-2.5 px-5 tracking-[0.01em]">
      <span>Synth is coming — join the waitlist .</span>
      <a 
        href="#waitlist" 
        className="underline underline-offset-[2px] ml-2 opacity-85 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
      >
        Reserve your spot <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  )
}
