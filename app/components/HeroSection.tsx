"use client";

interface HeroSectionProps {
  onStartSearch: () => void;
}

export default function HeroSection({ onStartSearch }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-paper via-paper to-white/40 border-b border-line/60">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-moss/5 blur-2xl rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
        {/* Value Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold-deep/30 text-gold-deep text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-up">
          <span className="h-2 w-2 rounded-full bg-moss animate-pulse" />
          <span>Real Web Verification Engine · No Static Lists</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[1.08] text-ink italic mb-6 tracking-tight">
          Somewhere, a scholarship is already meant for you.
        </h1>

        {/* Subhead Description */}
        <p className="text-lg sm:text-xl text-slate leading-relaxed max-w-2xl mx-auto mb-9 font-normal">
          Foundwell searches the live web in real time for authentic, currently active scholarships and grants. Every recommendation includes a plain-language explanation and a verifiable source link.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={onStartSearch}
            className="w-full sm:w-auto px-8 py-4 bg-ink text-paper font-semibold text-base rounded-sm shadow-md hover:bg-ink-soft active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Opportunity Search</span>
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-4 bg-white/80 border border-line text-ink font-semibold text-base rounded-sm hover:bg-paper transition-colors text-center"
          >
            How Foundwell Works ↓
          </a>
        </div>
      </div>
    </section>
  );
}
