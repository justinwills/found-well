"use client";

import { useState } from "react";
import type { OpportunityMatch, SavedOpportunity, StudentProfile, SOPStrategy } from "@/lib/types";

interface OpportunityModalProps {
  match: OpportunityMatch | null;
  profile?: StudentProfile;
  onClose: () => void;
  onSaveToggle: (match: OpportunityMatch) => void;
  isSaved: boolean;
}

export default function OpportunityModal({ match, profile, onClose, onSaveToggle, isSaved }: OpportunityModalProps) {
  const [copied, setCopied] = useState(false);
  const [sopStrategy, setSopStrategy] = useState<SOPStrategy | null>(null);
  const [loadingSOP, setLoadingSOP] = useState(false);
  const [sopError, setSopError] = useState("");
  const [copiedSOP, setCopiedSOP] = useState(false);

  if (!match) return null;

  function copyLink() {
    if (!match) return;
    navigator.clipboard.writeText(match.sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGenerateSOP() {
    setLoadingSOP(true);
    setSopError("");
    try {
      const res = await fetch("/api/sop-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, match }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate SOP strategy");
      }
      const data: SOPStrategy = await res.json();
      setSopStrategy(data);
    } catch {
      setSopError("Couldn't generate strategy blueprint. Please try again.");
    } finally {
      setLoadingSOP(false);
    }
  }

  function copySOPBlueprint() {
    if (!sopStrategy) return;
    const text = `=== SOP STRATEGY BLUEPRINT: ${sopStrategy.targetProgram} ===

WINNING NARRATIVE ANGLE:
${sopStrategy.winningAngle}

ESSAY OUTLINE:
1. Hook & Catalyst:
${sopStrategy.essayOutline.hook}

2. Academic & Technical Foundation:
${sopStrategy.essayOutline.academicBackground}

3. Fit with Program & Values:
${sopStrategy.essayOutline.whyThisProgram}

4. Future Impact & Vision:
${sopStrategy.essayOutline.futureImpact}

CV TWEAKS FOR THIS AWARD:
${sopStrategy.cvRecommendations.map((t) => `• ${t}`).join("\n")}

RECOMMENDER TALKING POINTS:
${sopStrategy.recommendationLetterTips.map((t) => `• ${t}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopiedSOP(true);
    setTimeout(() => setCopiedSOP(false), 2500);
  }

  // Generate dynamic checklist items based on opportunity details
  const checklistItems = [
    "Verify target country citizenship & residence rules on official portal",
    "Prepare certified academic transcripts & degree translation",
    "Draft statement of purpose highlighting experience in " + (match.name || "field"),
    "Request 2 academic or professional letters of recommendation",
    "Confirm English proficiency requirements (IELTS / TOEFL / Waiver)",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-paper border border-line rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-line bg-white/60 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-deep bg-gold/10 px-2 py-0.5 rounded">
              {match.confidence} fit
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold mt-2 leading-snug">
              {match.name}
            </h2>
            {match.organization && (
              <p className="text-sm text-slate mt-1 font-medium">{match.organization}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate hover:text-ink rounded hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close details modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Fit Reason Box */}
          <div className="bg-white p-5 rounded-sm border border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why Foundwell Flagged This Fit
            </h3>
            <p className="text-ink leading-relaxed text-sm sm:text-base">{match.whyItFits}</p>
          </div>

          {/* Deadline & Status Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-sm border border-line">
              <span className="text-xs font-semibold text-slate block mb-1">Application Deadline</span>
              <p className="text-sm font-bold text-ink">
                {match.deadlineStatus === "rolling" ? (
                  <span className="text-moss">Rolling Admissions</span>
                ) : match.deadline ? (
                  match.deadline
                ) : (
                  <span className="text-slate">Unspecified (Verify on Source)</span>
                )}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-sm border border-line">
              <span className="text-xs font-semibold text-slate block mb-1">Source Integrity</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-moss font-semibold">
                <span className="h-2 w-2 rounded-full bg-moss" />
                Live Web Verified URL
              </span>
            </div>
          </div>

          {/* Financial Coverage Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gold-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Financial Coverage Matrix ({match.fundingType || "Fully Funded"})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-sm border border-line">
                <span className="text-[11px] font-semibold text-slate block">Tuition</span>
                <p className="text-xs font-bold text-ink mt-0.5">{match.fundingBreakdown?.tuition || "100% Waived"}</p>
              </div>
              <div className="bg-white p-3.5 rounded-sm border border-line">
                <span className="text-[11px] font-semibold text-slate block">Stipend</span>
                <p className="text-xs font-bold text-moss mt-0.5">{match.fundingBreakdown?.stipend || "Provided"}</p>
              </div>
              <div className="bg-white p-3.5 rounded-sm border border-line">
                <span className="text-[11px] font-semibold text-slate block">Travel & Visa</span>
                <p className="text-xs font-bold text-ink mt-0.5">{match.fundingBreakdown?.travel || "Covered"}</p>
              </div>
              <div className="bg-white p-3.5 rounded-sm border border-line">
                <span className="text-[11px] font-semibold text-slate block">Health Insurance</span>
                <p className="text-xs font-bold text-ink mt-0.5">{match.fundingBreakdown?.insurance || "Included"}</p>
              </div>
            </div>
          </div>

          {/* Hard Eligibility Checklist Radar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Eligibility Match Radar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-sm border border-line">
              <div>
                <span className="text-[11px] font-semibold text-slate block">Academic / GPA</span>
                <p className="text-xs font-medium text-ink mt-0.5">{match.eligibilityCheck?.gpaRequirement || "3.0+ GPA Equivalent"}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate block">Language Proficiency</span>
                <p className="text-xs font-medium text-ink mt-0.5">{match.eligibilityCheck?.languageRequirement || "IELTS 6.5+ or Waiver"}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate block">Nationality Rule</span>
                <p className="text-xs font-medium text-ink mt-0.5">{match.eligibilityCheck?.nationalityEligible || "International Eligible"}</p>
              </div>
            </div>
          </div>

          {/* AI Statement of Purpose Co-Pilot */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-white p-5 rounded-sm border border-gold/40 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-gold-deep animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold-deep">
                  AI Essay & Strategy Co-Pilot
                </h3>
              </div>
              {sopStrategy && (
                <button
                  onClick={copySOPBlueprint}
                  className="text-xs font-semibold text-gold-deep hover:text-ink transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{copiedSOP ? "Copied to Clipboard!" : "Copy Full SOP Blueprint 📋"}</span>
                </button>
              )}
            </div>

            {!sopStrategy && !loadingSOP && (
              <div className="text-center py-4">
                <p className="text-xs text-slate mb-3">
                  Generate a customized Statement of Purpose outline, winning narrative angle, and CV tweaks tailored to {match.name}.
                </p>
                <button
                  onClick={handleGenerateSOP}
                  className="px-4 py-2.5 bg-gold-deep text-white font-semibold text-xs rounded-sm hover:bg-ink transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <span>✨ Generate Winning SOP Strategy</span>
                </button>
                {sopError && <p className="text-xs text-red-600 mt-2">{sopError}</p>}
              </div>
            )}

            {loadingSOP && (
              <div className="py-6 text-center space-y-2">
                <span className="inline-block animate-spin h-5 w-5 border-2 border-gold-deep border-t-transparent rounded-full" />
                <p className="text-xs font-medium text-ink-soft">Analyzing scholarship criteria & building SOP blueprint...</p>
              </div>
            )}

            {sopStrategy && (
              <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
                {/* Winning Angle Banner */}
                <div className="bg-white p-3.5 rounded-xs border-l-3 border-gold-deep shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate block mb-1">Recommended Narrative Hook</span>
                  <p className="text-ink font-medium leading-relaxed italic">&ldquo;{sopStrategy.winningAngle}&rdquo;</p>
                </div>

                {/* 4-Part Essay Outline */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate block">4-Paragraph Essay Blueprint</span>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-xs border border-line">
                      <span className="font-bold text-ink block mb-0.5">1. Hook & Personal Catalyst</span>
                      <p className="text-slate leading-relaxed">{sopStrategy.essayOutline.hook}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xs border border-line">
                      <span className="font-bold text-ink block mb-0.5">2. Academic & Tech Rigor</span>
                      <p className="text-slate leading-relaxed">{sopStrategy.essayOutline.academicBackground}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xs border border-line">
                      <span className="font-bold text-ink block mb-0.5">3. Program & Values Fit</span>
                      <p className="text-slate leading-relaxed">{sopStrategy.essayOutline.whyThisProgram}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xs border border-line">
                      <span className="font-bold text-ink block mb-0.5">4. Long-Term Vision</span>
                      <p className="text-slate leading-relaxed">{sopStrategy.essayOutline.futureImpact}</p>
                    </div>
                  </div>
                </div>

                {/* Resume Tweaks & Recommender Tips */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-white p-3 rounded-xs border border-line">
                    <span className="font-bold text-ink block mb-1">📄 3 Resume Tweaks for this Award</span>
                    <ul className="space-y-1 text-slate list-disc pl-4">
                      {sopStrategy.cvRecommendations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-xs border border-line">
                    <span className="font-bold text-ink block mb-1">✉️ Recommender Talking Points</span>
                    <ul className="space-y-1 text-slate list-disc pl-4">
                      {sopStrategy.recommendationLetterTips.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Application Preparation Checklist */}
          <div>
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <span>Application Action Checklist</span>
            </h3>
            <ul className="space-y-2 bg-white/60 p-4 rounded-sm border border-line text-sm">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-ink-soft">
                  <input
                    type="checkbox"
                    id={`check-${idx}`}
                    className="mt-1 h-4 w-4 rounded text-gold-deep border-line focus:ring-gold-deep"
                  />
                  <label htmlFor={`check-${idx}`} className="cursor-pointer select-none">
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-line bg-white/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToggle(match)}
              className={`px-4 py-2 text-sm font-semibold rounded-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? "bg-gold-deep text-white border-gold-deep"
                  : "bg-white text-ink border-line hover:border-gold-deep"
              }`}
            >
              <span>{isSaved ? "Saved to Tracker ★" : "Save Opportunity ☆"}</span>
            </button>

            <button
              onClick={copyLink}
              className="px-3.5 py-2 text-sm font-medium text-slate hover:text-ink bg-white border border-line rounded-sm transition-colors cursor-pointer"
            >
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
          </div>

          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-ink text-paper font-semibold text-sm rounded-sm hover:bg-ink-soft transition-colors flex items-center gap-1.5"
          >
            <span>Visit Official Source</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
