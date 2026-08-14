"use client";

import { useState } from "react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How does Foundwell prevent fake or invented scholarships?",
      answer:
        "Foundwell uses Tavily search to fetch real web pages during your search. Before any match is rendered, our server code (`sanitizeMatches`) compares every match's source URL against the exact list of URLs returned by web search in that session. If a URL was not returned in live web search, the match is dropped automatically.",
    },
    {
      question: "Why does Foundwell search live instead of using a static database?",
      answer:
        "Scholarship deadlines, eligibility rules, and funding availability change constantly. Static databases become outdated quickly and often contain broken links or expired calls. By executing targeted web searches in real time, Foundwell returns active opportunities as they exist on the live web today.",
    },
    {
      question: "What happens if a deadline is unclear?",
      answer:
        "Instead of hiding vague deadlines or making up arbitrary dates, Foundwell explicitly tags them as 'Unclear' and shows the exact text retrieved from the source page. That way you can verify directly on the official university or provider site.",
    },
    {
      question: "Can I use Foundwell if I am looking for undergraduate or high school scholarships?",
      answer:
        "Yes! Foundwell supports all academic levels: High School, Undergraduate, Master's/Graduate, Doctoral (PhD), Postdoctoral, and Early Career Fellowships.",
    },
    {
      question: "How do I save and export my scholarship search results?",
      answer:
        "Click the star icon ('Save Opportunity') on any match card to add it to your private Saved Tracker dashboard. From the dashboard, you can track application stages (Interested, Applying, Submitted, Awarded), write custom notes, and export your list to CSV or iCal calendar format.",
    },
    {
      question: "Do I need a credit card to try Foundwell?",
      answer:
        "No. You can run free searches immediately without creating an account or providing payment information.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-16 sm:py-24 bg-paper border-b border-line/70">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-deep mb-2">
            Got Questions?
          </p>
          <h2 className="font-display text-3xl sm:text-5xl text-ink italic font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-slate text-base mt-3">
            Everything you need to know about our live web verification and scholarship engine.
          </p>

          {/* Search Box */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search questions (e.g., verification, deadline, export)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-white border border-line rounded-sm text-sm focus:outline-none focus:border-gold-deep text-ink"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center p-8 bg-white border border-line rounded text-slate text-sm">
              No questions found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-line rounded-sm shadow-2xs overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-display font-bold text-lg sm:text-xl text-ink flex items-center justify-between gap-4 hover:text-gold-deep transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-xl text-slate shrink-0">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate text-sm sm:text-base leading-relaxed border-t border-line/50 bg-paper/30 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
