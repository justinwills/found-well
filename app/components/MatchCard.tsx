import type { OpportunityMatch } from "@/lib/types";

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
      <span className="text-sm text-slate">
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
      <span className="text-sm text-slate">
        <span className="text-moss font-medium">Rolling</span> — accepts applications year-round
      </span>
    );
  }

  return (
    <span className="text-sm text-slate">
      Deadline: <span className="text-ink-soft font-medium">{match.deadline}</span>
    </span>
  );
}

export default function MatchCard({ match, index }: { match: OpportunityMatch; index: number }) {
  return (
    <article
      className="relative bg-paper border border-line rounded-sm p-6 sm:p-7 animate-[fadeUp_0.5s_ease_both]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Seal mark — signature element, stands in for a fake precision percentage */}
      <span
        aria-hidden
        className={`absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full ${confidenceColor[match.confidence]} ring-4 ring-paper`}
      />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-display text-xl sm:text-2xl text-ink leading-snug">{match.name}</h3>
          {match.organization && (
            <p className="text-sm text-slate mt-0.5">{match.organization}</p>
          )}
        </div>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-slate whitespace-nowrap pt-1">
          {confidenceLabel[match.confidence]}
        </span>
      </div>

      <p className="text-ink-soft leading-relaxed mb-4">{match.whyItFits}</p>

      <div className="flex items-center justify-between gap-4 pt-3 border-t border-line/70">
        <DeadlineRow match={match} />
        <a
          href={match.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gold-deep hover:text-ink transition-colors whitespace-nowrap"
        >
          View source →
        </a>
      </div>
    </article>
  );
}
