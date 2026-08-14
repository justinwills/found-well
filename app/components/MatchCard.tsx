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

const confidenceColor: Record<OpportunityMatch["confidence"], string> = {
  strong: "bg-moss",
  good: "bg-gold-deep",
  "worth a look": "bg-slate",
};

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
    <span className="text-xs sm:text-sm text-slate">
      Deadline: <span className="text-ink-soft font-medium">{match.deadline}</span>
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
  return (
    <article
      className="relative bg-paper border border-line rounded-sm p-6 sm:p-7 animate-[fadeUp_0.5s_ease_both] transition-all hover:border-gold-deep/50 hover:shadow-xs group"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Seal mark */}
      <span
        aria-hidden
        className={`absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full ${confidenceColor[match.confidence]} ring-4 ring-paper`}
      />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="pr-6">
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
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate whitespace-nowrap pt-1">
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
