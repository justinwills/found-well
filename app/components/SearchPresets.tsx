"use client";

import type { StudentProfile } from "@/lib/types";

interface SearchPresetsProps {
  onSelectPreset: (profile: StudentProfile) => void;
}

const PRESETS: Array<{ title: string; subtitle: string; profile: StudentProfile }> = [
  {
    title: "Indonesian CS Undergrad",
    subtitle: "Looking for AI Master's scholarships in Europe / US",
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
    title: "STEM Researcher from Africa",
    subtitle: "Biotechnology & Global Health PhD funding",
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
    title: "Latin American High School Senior",
    subtitle: "Undergraduate merit + need scholarships",
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
    title: "Creative Arts & Design Scholar",
    subtitle: "Master's grants in visual arts & UI/UX design",
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
    <div className="mb-6 bg-paper/60 border border-line/70 p-4 sm:p-5 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-deep flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Demo Presets
        </span>
        <span className="text-xs text-slate">Click any to auto-fill form</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectPreset(p.profile)}
            className="text-left p-3 rounded-sm bg-white/80 border border-line/80 hover:border-gold hover:bg-white transition-all group shadow-2xs cursor-pointer"
          >
            <p className="text-xs font-bold text-ink group-hover:text-gold-deep transition-colors flex items-center justify-between">
              <span>{p.title}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-deep">→</span>
            </p>
            <p className="text-[11px] text-slate mt-0.5 line-clamp-1">{p.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
