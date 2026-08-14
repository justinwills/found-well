"use client";

export default function FeaturesGrid() {
  const features = [
    {
      title: "Real-Time Web Intelligence",
      description: "Unlike static databases that age fast, Foundwell executes live web searches during your session to discover currently open calls.",
      icon: (
        <svg className="w-6 h-6 text-gold-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      title: "Zero-Hallucination Code Enforcement",
      description: "Every match is checked server-side against live Tavily search results. If an AI suggests a URL that was not retrieved in search, it is dropped.",
      icon: (
        <svg className="w-6 h-6 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Plain-Language Fit Breakdown",
      description: "No vague match scores. You get a transparent 2–3 sentence explanation tailored to your specific field, country, and academic level.",
      icon: (
        <svg className="w-6 h-6 text-gold-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Clean Domain Filtering",
      description: "Built-in domain exclusion strips away forum posts, Reddit threads, and promotional spam so you only get official opportunity pages.",
      icon: (
        <svg className="w-6 h-6 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
    },
    {
      title: "Honest Deadline Validation",
      description: "Flagged automatically as Open, Rolling, or Unclear — preventing expired applications and saving you dozens of wasted hours.",
      icon: (
        <svg className="w-6 h-6 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Export & Application Tracking",
      description: "Save top opportunities to your private dashboard, track progress stages, write custom notes, and export to CSV or iCal calendar.",
      icon: (
        <svg className="w-6 h-6 text-gold-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white/60 border-b border-line/70">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-deep mb-3">
            Built for Truth & Transparency
          </p>
          <h2 className="font-display text-3xl sm:text-5xl text-ink italic font-bold">
            Why students & counselors trust Foundwell
          </h2>
          <p className="text-slate text-base sm:text-lg mt-4 leading-relaxed">
            Most scholarship search engines show stale lists compiled years ago. Foundwell changes the standard with live web verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-paper border border-line p-6 sm:p-7 rounded-sm shadow-2xs hover:border-gold-deep/60 hover:shadow-xs transition-all"
            >
              <div className="h-10 w-10 rounded-sm bg-white border border-line flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">{f.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
