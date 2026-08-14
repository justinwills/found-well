"use client";

import type { StudentProfile } from "@/lib/types";

interface SearchPresetsProps {
  onSelectPreset: (profile: StudentProfile) => void;
}

const PRESETS: Array<{ icon: string; title: string; tag: string; subtitle: string; profile: StudentProfile }> = [
  {
    icon: "🇮🇩",
    title: "Indonesian CS Undergrad",
    tag: "AI & Data Science",
    subtitle: "3.8 GPA student seeking Master's funding in Europe / US",
    profile: {
      about:
        "I am a third-year computer science student from Indonesia with a 3.8 GPA. Active in campus AI research and open-source development. Seeking fully funded Master's scholarships in Artificial Intelligence or Data Science in Europe or the US.",
      country: "Indonesia",
      fieldOfStudy: "Computer Science & AI",
      degreeLevel: "Undergraduate",
      targetCountry: "Europe or United States",
    },
  },
  {
    icon: "🇳🇬",
    title: "STEM Researcher from Africa",
    tag: "Biotech & Global Health",
    subtitle: "Doctoral fellowships in UK, Canada, or Australia",
    profile: {
      about:
        "Passionate biotechnology researcher from Nigeria focusing on infectious disease diagnostics. Looking for doctoral fellowships and PhD funding in UK, Canada, or Australia.",
      country: "Nigeria",
      fieldOfStudy: "Biotechnology / Public Health",
      degreeLevel: "Graduate / Master's",
      targetCountry: "UK, Canada, Australia",
    },
  },
  {
    icon: "🇨🇴",
    title: "Latin American High School Senior",
    tag: "Engineering Merit Aid",
    subtitle: "Full-ride undergraduate scholarships in US or Asia",
    profile: {
      about:
        "Senior high school student from Colombia with strong STEM extracurricular leadership. Looking for full-ride undergraduate scholarships to universities in North America or Asia.",
      country: "Colombia",
      fieldOfStudy: "Engineering",
      degreeLevel: "High school",
      targetCountry: "USA, Canada, Japan, Singapore",
    },
  },
  {
    icon: "🇮🇳",
    title: "Creative Arts & Design Scholar",
    tag: "UI/UX & HCI Grants",
    subtitle: "Postgraduate tuition waivers in Germany or UK",
    profile: {
      about:
        "Graphic designer and digital artist from India interested in human-computer interaction, digital media, and UI/UX design. Looking for fellowship grants or tuition waivers for postgraduate design programs.",
      country: "India",
      fieldOfStudy: "Design & Digital Arts",
      degreeLevel: "Graduate / Master's",
      targetCountry: "Germany, UK, Netherlands",
    },
  },
];

export default function SearchPresets({ onSelectPreset }: SearchPresetsProps) {
  return (
    <div className="mb-8 bg-white p-5 rounded-2xl border border-line shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Test Drive Instant Student Profiles
        </span>
        <span className="text-xs text-slate font-medium">Click any card to auto-fill form</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectPreset(p.profile)}
            className="text-left p-3.5 rounded-xl bg-paper/80 border border-line/80 hover:border-amber-500 hover:bg-white hover:shadow-md transition-all group cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <p className="text-xs font-bold text-ink group-hover:text-amber-800 transition-colors">
                  {p.title}
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full shrink-0">
                {p.tag}
              </span>
            </div>
            <p className="text-[11px] text-slate pl-7 line-clamp-1">{p.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
