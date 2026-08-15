"use client";

import { useState } from "react";

interface FooterProps {
  onNav: (tab: "home" | "search" | "saved" | "faq") => void;
}

export default function Footer({ onNav }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3500);
  }

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-16">
          {/* Brand & Mission Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-2xl tracking-tight text-white font-display">
                Foundwell
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md font-normal">
              Empowering students worldwide with real-time web intelligence to discover, verify, and win fully funded global scholarships and research grants.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Web Verification
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full font-medium">
                ✨ SOP Co-pilot Active
              </span>
            </div>
          </div>

          {/* Navigation Links Column (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-display">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNav("home")} className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 font-medium">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNav("search")} className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 font-medium">
                  Opportunity Matcher
                </button>
              </li>
              <li>
                <button onClick={() => onNav("saved")} className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 font-medium">
                  Application Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNav("faq")} className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 font-medium">
                  FAQ & SOP Strategy
                </button>
              </li>
            </ul>
          </div>

          {/* Top Scholarship Curations (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-display">
              Featured Awards
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-amber-400 cursor-pointer transition-colors" onClick={() => onNav("search")}>
                <span>🇺🇸 Fulbright Fellowship</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-amber-400 cursor-pointer transition-colors" onClick={() => onNav("search")}>
                <span>🇩🇪 DAAD Scholarships</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-amber-400 cursor-pointer transition-colors" onClick={() => onNav("search")}>
                <span>🇬🇧 Chevening Award</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-amber-400 cursor-pointer transition-colors" onClick={() => onNav("search")}>
                <span>🇯🇵 MEXT Japan Grants</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Digest Subscription (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-display">
              Scholarship Digest
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Get weekly updates on newly verified fully funded scholarships and upcoming deadlines.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student email..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                {subscribed ? "Subscribed! 🎉" : "Subscribe Free"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Foundwell. Built for ML Empowerment Build Challenge 2.0.</p>
          <p className="text-center sm:text-right text-slate-400">
            Verify official dates directly on provider portals. Zero static data hallucination.
          </p>
        </div>
      </div>
    </footer>
  );
}
