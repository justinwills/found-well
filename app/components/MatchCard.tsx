"use client";

import type { OpportunityMatch } from "@/lib/types";

interface MatchCardProps {
  match: OpportunityMatch;
  index: number;
  onOpenModal?: (match: OpportunityMatch) => void;
  onSaveToggle?: (match: OpportunityMatch) => void;
  isSaved?: boolean;
}

const confidenceLabel: Record<OpportunityMatch["confidence"], string> = {
  strong: "Strong fit",
  good: "Good fit",
  "worth a look": "Worth a look",
};

const confidencePercentage: Record<OpportunityMatch["confidence"], string> = {
  strong: "96% Match",
  good: "88% Match",
  "worth a look": "82% Match",
};

const confidenceColor: Record<OpportunityMatch["confidence"], string> = {
  strong: "bg-teal-600",
  good: "bg-gold-deep",
  "worth a look": "bg-slate",
};

const fundingBadgeStyle: Record<NonNullable<OpportunityMatch["fundingType"]>, string> = {
  "Fully Funded": "bg-emerald-100 text-emerald-800 border-emerald-300/80",
  "Tuition Only": "bg-sky-100 text-sky-800 border-sky-300/80",
  "Partial Stipend": "bg-amber-100 text-amber-900 border-amber-300/80",
  "Grant / Award": "bg-purple-100 text-purple-800 border-purple-300/80",
};

function DomainTrustBadge({ domainType, sourceUrl }: { domainType?: OpportunityMatch["domainType"]; sourceUrl: string }) {
  let hostname = "";
  try {
    hostname = new URL(sourceUrl).hostname;
  } catch {
    hostname = "source";
  }

  if (domainType === "official_gov") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs" title="Official Government Portal">
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>.gov verified</span>
      </span>
    );
  }

  if (domainType === "official_edu") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-xs" title="Official University / Academic Domain">
        <svg className="w-3 h-3 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
        <span>.edu verified</span>
      </span>
    );
  }

  if (domainType === "verified_foundation") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-xs" title="Verified Foundation Portal">
        <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Verified Portal</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate bg-stone-100 border border-line px-2 py-0.5 rounded-xs" title={hostname}>
      <span>{hostname}</span>
    </span>
  );
}

function DeadlineRow({ match }: { match: OpportunityMatch }) {
  if (match.deadlineStatus === "unclear") {
    return (
      <span className="text-xs sm:text-sm text-slate">
        {match.deadline ? (
          <>
            Deadline: <span className="text-ink-soft font-medium">{match.deadline}</span>
          </>
        ) : (
          "Deadline: not stated"
        )}{" "}
        <span className="text-gold-deep">— verify on source</span>
      </span>
    );
  }

  if (match.deadlineStatus === "rolling") {
    return (
      <span className="text-xs sm:text-sm text-slate">
        <span className="text-moss font-medium">Rolling</span> — accepts applications year-round
      </span>
    );
  }

  return (
    <span className="text-xs sm:text-sm text-slate flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      <span>
        Deadline: <span className="text-ink font-semibold">{match.deadline}</span>
      </span>
    </span>
  );
}

export default function MatchCard({
  match,
  index,
  onOpenModal,
  onSaveToggle,
  isSaved = false,
}: MatchCardProps) {
  const fundingLabel = match.fundingType || "Fully Funded";

  return (
    <article
      className="relative bg-white border border-line rounded-xl p-6 sm:p-7 animate-[fadeUp_0.5s_ease_both] transition-all duration-300 hover:border-amber-500/60 hover:shadow-md hover:-translate-y-0.5 group"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Seal mark */}
      <span
        aria-hidden
        className={`absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full ${confidenceColor[match.confidence]} ring-4 ring-paper`}
      />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="pr-2 space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-300 px-2 py-0.5 rounded-xs">
              <span>🎯 {confidencePercentage[match.confidence]}</span>
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${fundingBadgeStyle[fundingLabel]}`}>
              {fundingLabel}
            </span>
            <DomainTrustBadge domainType={match.domainType} sourceUrl={match.sourceUrl} />
          </div>

          <h3
            onClick={() => onOpenModal?.(match)}
            className="font-display text-xl sm:text-2xl text-ink leading-snug hover:text-gold-deep transition-colors cursor-pointer"
          >
            {match.name}
          </h3>
          {match.organization && (
            <p className="text-sm text-slate mt-0.5">{match.organization}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate whitespace-nowrap pt-1">
            {confidenceLabel[match.confidence]}
          </span>

          {onSaveToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle(match);
              }}
              className={`p-1.5 rounded-sm border transition-all cursor-pointer ${
                isSaved
                  ? "bg-gold-deep text-white border-gold-deep shadow-2xs"
                  : "bg-white text-slate border-line hover:border-gold-deep hover:text-gold-deep"
              }`}
              title={isSaved ? "Saved to tracker" : "Save opportunity"}
            >
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-ink-soft leading-relaxed mb-4">{match.whyItFits}</p>

      {/* Coverage & Eligibility Quick Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {match.fundingBreakdown?.stipend && (
          <span className="inline-flex items-center gap-1 text-xs bg-white text-ink border border-line px-2.5 py-1 rounded-xs font-medium">
            <span className="text-moss font-bold">💰 Stipend:</span> {match.fundingBreakdown.stipend}
          </span>
        )}
        {match.eligibilityCheck?.gpaRequirement && (
          <span className="inline-flex items-center gap-1 text-xs bg-white text-ink border border-line px-2.5 py-1 rounded-xs font-medium">
            <span className="text-gold-deep font-bold">🎓 Requirement:</span> {match.eligibilityCheck.gpaRequirement}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/70">
        <DeadlineRow match={match} />
        
        <div className="flex items-center gap-3">
          {onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal(match)}
              className="text-xs font-semibold text-slate hover:text-ink transition-colors cursor-pointer"
            >
              Action Strategy & Details →
            </button>
          )}

          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-gold-deep hover:text-ink transition-colors whitespace-nowrap"
          >
            View source ↗
          </a>
        </div>
      </div>
    </article>
  );
}
