"use client";

interface FooterProps {
  onNav: (tab: "home" | "search" | "saved" | "faq") => void;
}

export default function Footer({ onNav }: FooterProps) {
  return (
    <footer className="bg-ink text-paper border-t border-ink-soft py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-sm bg-paper text-ink flex items-center justify-center font-display italic font-bold text-lg">
                F
              </div>
              <span className="font-display italic text-2xl font-bold tracking-tight text-paper">
                Foundwell
              </span>
            </div>
            <p className="text-slate/90 text-sm leading-relaxed max-w-sm">
              Connecting ambitious students worldwide with real, verified scholarships and funded opportunities through live web intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold">
              <span className="h-2 w-2 rounded-full bg-moss inline-block" />
              <span>100% Code-Sanitized Web Verification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-paper/80 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate">
              <li>
                <button onClick={() => onNav("home")} className="hover:text-gold transition-colors cursor-pointer">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNav("search")} className="hover:text-gold transition-colors cursor-pointer">
                  Opportunity Matcher
                </button>
              </li>
              <li>
                <button onClick={() => onNav("saved")} className="hover:text-gold transition-colors cursor-pointer">
                  Saved Tracker Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNav("faq")} className="hover:text-gold transition-colors cursor-pointer">
                  FAQ & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Opt-in */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-paper/80 mb-4">
              Stay Updated
            </h4>
            <p className="text-xs text-slate mb-3">
              Receive weekly curations of freshly announced fully funded global scholarships.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your student email..."
                className="w-full px-3 py-2 bg-ink-soft border border-slate/40 rounded text-xs text-paper placeholder:text-slate/70 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gold-deep hover:bg-gold text-ink font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Subscribe Free
              </button>
            </form>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
          <p>© {new Date().getFullYear()} Foundwell. Built for the ML Empowerment Build Challenge.</p>
          <p className="text-center sm:text-right">
            Always confirm official deadlines and eligibility directly on provider websites.
          </p>
        </div>
      </div>
    </footer>
  );
}
