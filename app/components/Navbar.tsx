"use client";

import { useState } from "react";

interface NavbarProps {
  activeTab: "home" | "search" | "saved" | "faq";
  setActiveTab: (tab: "home" | "search" | "saved" | "faq") => void;
  savedCount: number;
  onStartSearch: () => void;
}

export default function Navbar({ activeTab, setActiveTab, savedCount, onStartSearch }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Overview" },
    { id: "search", label: "Find Match" },
    { id: "saved", label: `Saved (${savedCount})` },
    { id: "faq", label: "FAQ" },
  ] as const;

  function handleNav(tabId: typeof activeTab) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === "search") {
      onStartSearch();
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line/80 transition-all">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
        >
          <div className="h-8 w-8 rounded-sm bg-ink flex items-center justify-center text-paper font-display italic font-bold text-lg shadow-xs group-hover:bg-ink-soft transition-colors">
            F
          </div>
          <div className="flex items-center">
            <span className="font-display italic text-xl font-bold tracking-tight text-ink">
              Foundwell
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-moss/10 text-moss font-semibold">
              Live AI Search
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-md border border-line/70 shadow-xs">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-sm transition-all relative cursor-pointer ${
                  isActive
                    ? "bg-ink text-paper shadow-xs font-semibold"
                    : "text-slate hover:text-ink hover:bg-black/5"
                }`}
              >
                {link.label}
                {link.id === "saved" && savedCount > 0 && !isActive && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-gold-deep text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav("search")}
            className="px-4 py-2 bg-gold-deep hover:bg-gold text-ink font-semibold text-xs sm:text-sm rounded-sm shadow-xs transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Search Live</span>
            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate hover:text-ink rounded-sm focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-5 py-4 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-sm flex items-center justify-between cursor-pointer ${
                activeTab === link.id ? "bg-ink text-paper font-semibold" : "text-ink hover:bg-black/5"
              }`}
            >
              <span>{link.label}</span>
              {link.id === "saved" && savedCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gold-deep text-white">
                  {savedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
