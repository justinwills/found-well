export interface StudentProfile {
  /** Free-text self-description; the primary signal when provided */
  about: string;
  /** Structured fields — used as a backup/refinement when about is thin */
  country: string;
  fieldOfStudy: string;
  degreeLevel: string;
  targetCountry: string;
}

export interface OpportunityMatch {
  id?: string;
  name: string;
  organization: string;
  whyItFits: string;
  deadline: string | null;
  /**
   * "open" — a specific date was found and it's after today.
   * "rolling" — the program explicitly has no fixed deadline / rolling admission.
   * "unclear" — a deadline was mentioned but couldn't be confidently placed
   *             relative to today (vague wording, ambiguous format, etc).
   * Deliberately no "closed" status here: if the model believes a deadline has
   * passed, the match is dropped server-side rather than shown as closed —
   * see sanitizeMatches. "unclear" always displays, it's never hidden.
   */
  deadlineStatus: "open" | "rolling" | "unclear";
  sourceUrl: string;
  confidence: "strong" | "good" | "worth a look";
  estimatedFunding?: string;
  eligibilityTags?: string[];
  fundingType?: "Fully Funded" | "Tuition Only" | "Partial Stipend" | "Grant / Award";
  fundingBreakdown?: {
    tuition?: string;
    stipend?: string;
    travel?: string;
    insurance?: string;
  };
  domainType?: "official_edu" | "official_gov" | "verified_foundation" | "organization";
  eligibilityCheck?: {
    gpaRequirement?: string;
    languageRequirement?: string;
    nationalityEligible?: string;
  };
}

export type ApplicationStatus = "Interested" | "Applying" | "Submitted" | "Awarded";

export interface SavedOpportunity extends OpportunityMatch {
  id: string;
  savedAt: string;
  status: ApplicationStatus;
  userNotes?: string;
}

export interface MatchResponse {
  matches: OpportunityMatch[];
  searchNotes?: string;
}

export interface MatchErrorResponse {
  error: string;
}

export interface SOPStrategy {
  targetProgram: string;
  winningAngle: string;
  recommendedTheme: string;
  essayOutline: {
    hook: string;
    academicBackground: string;
    whyThisProgram: string;
    futureImpact: string;
  };
  cvRecommendations: string[];
  recommendationLetterTips: string[];
}

