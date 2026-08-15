"use client";

interface HeroSectionProps {
  onStartSearch: () => void;
}

export default function HeroSection({ onStartSearch }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-paper bg-dot-pattern border-b border-line">
      {/* Soft ambient gradient glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-200/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-teal-200/30 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Human Editorial Pitch */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Pill Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider animate-fade-up">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Real-Time Web Verification</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-ink tracking-tight font-extrabold">
              Somewhere, a scholarship is already <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-ink">meant for you.</span>
            </h1>

            {/* Subhead Description */}
            <p className="text-base sm:text-lg text-slate leading-relaxed font-normal max-w-xl">
              Foundwell bypasses static databases by querying the live web in real time. Every result includes a plain-language eligibility breakdown, official `.gov`/`.edu` verification, and an SOP strategy blueprint.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onStartSearch}
                className="px-7 py-4 bg-ink hover:bg-ink-soft text-paper font-semibold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Find Verified Matches Now</span>
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <a
                href="#search-form-section"
                className="px-6 py-4 bg-white border border-line text-ink font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors text-center shadow-2xs"
              >
                Explore Demo Profiles ↓
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate border-t border-line/70">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓ 100% Verified</span>
                <span>Live Web Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">★ Zero Fake Data</span>
                <span>No Hallucinated URLs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Glassmorphic Studio Preview */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/80 relative space-y-4 transform lg:rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate ml-2">Live Match Studio</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Active Run
                </span>
              </div>

              {/* Sample Match Card */}
              <div className="bg-white p-4 rounded-xl border border-line shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-300 px-2 py-0.5 rounded-xs">
                    🎯 96% Match
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                    .gov verified
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-xl font-bold text-ink leading-tight">
                    Fulbright Graduate Student Program 2026
                  </h4>
                  <p className="text-xs text-slate mt-0.5 font-medium">U.S. Department of State & Embassy</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-paper p-2 rounded border border-line">
                    <span className="text-slate block text-[10px]">Coverage</span>
                    <span className="font-bold text-moss">Full Tuition + Stipend</span>
                  </div>
                  <div className="bg-paper p-2 rounded border border-line">
                    <span className="text-slate block text-[10px]">Deadline</span>
                    <span className="font-bold text-ink">October 15, 2026</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-gold-deep font-semibold">✨ SOP Strategy Generated</span>
                  <span className="text-ink font-semibold">Action Plan →</span>
                </div>
              </div>

              {/* Floating Badge overlay */}
              <div className="absolute -bottom-4 -left-4 bg-ink text-paper p-3 rounded-xl shadow-lg border border-line/20 text-xs flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-gold-deep flex items-center justify-center font-bold text-paper">
                  AI
                </div>
                <div>
                  <p className="font-bold leading-none">Instant SOP Blueprint</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Tailored to Chevening & DAAD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
