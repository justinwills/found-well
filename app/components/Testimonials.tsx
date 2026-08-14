"use client";

export default function Testimonials() {
  const reviews = [
    {
      quote:
        "Foundwell located a specialized AI research grant in Munich that I had never seen listed on standard portals. The 'why it fits' summary made writing my cover letter 10x easier.",
      author: "Farhan A.",
      role: "MSc Candidate, Tech University of Munich",
      origin: "Indonesia → Germany",
    },
    {
      quote:
        "Every link I clicked actually took me to the official university portal with an active application button. Not a single dead link or fake list site.",
      author: "Amina K.",
      role: "Fulbright Scholar Applicant",
      origin: "Nigeria → USA",
    },
    {
      quote:
        "As an international student counselor, I recommend Foundwell to all our seniors. The live Tavily verification saves us hours of manual searching.",
      author: "Dr. Elena Rostova",
      role: "Global Education Advisor",
      origin: "International Youth Foundation",
    },
  ];

  const programs = [
    "Fulbright Program",
    "Chevening Scholarships",
    "DAAD Germany",
    "Erasmus Mundus",
    "Gates Cambridge",
    "MEXT Japan",
  ];

  return (
    <section className="py-16 sm:py-24 bg-paper border-b border-line/70">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-deep mb-2">
            Social Proof & Results
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink italic font-bold">
            Empowering scholars across 90+ countries
          </h2>
        </div>

        {/* Featured Program Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-16 opacity-85">
          {programs.map((prog, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white/80 border border-line text-ink font-display italic text-sm rounded-sm font-semibold shadow-2xs"
            >
              {prog}
            </span>
          ))}
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-white border border-line p-6 sm:p-7 rounded-sm shadow-2xs flex flex-col justify-between"
            >
              <div className="mb-6">
                <div className="text-gold-deep text-lg mb-3">★★★★★</div>
                <p className="text-ink-soft text-sm sm:text-base leading-relaxed italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-line/60">
                <p className="font-bold text-sm text-ink">{r.author}</p>
                <p className="text-xs text-slate mt-0.5">{r.role}</p>
                <p className="text-[11px] font-semibold text-moss mt-1">{r.origin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
