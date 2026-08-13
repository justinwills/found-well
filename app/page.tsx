"use client";

import { useState } from "react";
import { Label, TextInput, TextArea, Select } from "@/app/components/FormField";
import MatchCard from "@/app/components/MatchCard";
import type { StudentProfile, OpportunityMatch } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

type SearchStep = {
  query: string;
  index: number;
  done: boolean;
  resultCount?: number;
};

// Mirrors the StreamEvent union in app/api/match/route.ts — kept in sync by
// hand since the route runs on the server and can't export types to a
// "use client" file without pulling in server-only code.
type StreamEvent =
  | { type: "status"; message: string }
  | { type: "query"; query: string; index: number }
  | { type: "query_done"; query: string; index: number; resultCount: number }
  | { type: "result"; matches: OpportunityMatch[]; searchNotes?: string }
  | { type: "error"; message: string; status: number };

const emptyProfile: StudentProfile = {
  about: "",
  country: "",
  fieldOfStudy: "",
  degreeLevel: "",
  targetCountry: "",
};

export default function Home() {
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [status, setStatus] = useState<Status>("idle");
  const [matches, setMatches] = useState<OpportunityMatch[]>([]);
  const [searchNotes, setSearchNotes] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [steps, setSteps] = useState<SearchStep[]>([]);

  function update<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function resetAndSearch() {
    setStatus("idle");
    setMatches([]);
    setSearchNotes(undefined);
    setErrorMsg("");
    setStatusMsg("");
    setSteps([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.about.trim() && !profile.fieldOfStudy.trim() && !profile.country.trim()) {
      setStatus("error");
      setErrorMsg("Tell us at least a little about yourself — a sentence is enough.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    setStatusMsg("Starting the search…");
    setSteps([]);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok || !res.body) {
        // Config/validation errors return plain JSON before the stream opens.
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {
          // response wasn't JSON either — fall back to the generic message
        }
        setStatus("error");
        setErrorMsg(msg);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? ""; // keep the last, possibly-incomplete chunk

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event: StreamEvent = JSON.parse(line.slice(6));

          if (event.type === "status") {
            setStatusMsg(event.message);
          } else if (event.type === "query") {
            setSteps((prev) => [...prev, { query: event.query, index: event.index, done: false }]);
          } else if (event.type === "query_done") {
            setSteps((prev) =>
              prev.map((s) =>
                s.index === event.index ? { ...s, done: true, resultCount: event.resultCount } : s,
              ),
            );
          } else if (event.type === "result") {
            setMatches(event.matches);
            setSearchNotes(event.searchNotes);
            setStatus("done");
          } else if (event.type === "error") {
            setStatus("error");
            setErrorMsg(event.message);
          }
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-14 sm:py-20">
      <div className="w-full max-w-2xl">
        {/* Hero — the thesis */}
        <header className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep mb-4">
            Foundwell
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-ink italic mb-5">
            Somewhere, an opportunity
            <br />
            is already meant for you.
          </h1>
          <p className="text-lg text-slate leading-relaxed max-w-xl">
            Tell us who you are. We search live, right now, and bring back real
            scholarships and funded programs — with the source, so you can trust
            what you find.
          </p>
        </header>

        {/* How it works — fills the space before the form, sets expectations */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {[
            { n: "01", label: "Tell us about you", detail: "Field, level, where you'd study" },
            { n: "02", label: "We search live", detail: "Real results, not a static list" },
            { n: "03", label: "See why it fits", detail: "Every match links its source" },
          ].map((step) => (
            <div key={step.n}>
              <p className="font-display italic text-2xl sm:text-3xl text-gold-deep mb-1.5">
                {step.n}
              </p>
              <p className="text-sm sm:text-base font-semibold text-ink leading-snug">
                {step.label}
              </p>
              <p className="text-xs sm:text-sm text-slate mt-0.5 leading-snug">{step.detail}</p>
            </div>
          ))}
        </div>

        {/* Trust badges — makes the guardrails visible, not just described in text */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-10 sm:mb-12 pb-8 sm:pb-10 border-b border-line">
          {[
            "Searches the live web, every time",
            "Excludes forums & discussion sites",
            "Only shows verifiable sources",
            "Flags unclear deadlines instead of hiding them",
          ].map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-slate">
              <span className="h-1.5 w-1.5 rounded-full bg-moss shrink-0" />
              {label}
            </span>
          ))}
        </div>

        {/* The document frame — form flows into results in the same visual object */}
        <div className="bg-white/60 border border-line rounded-sm shadow-[0_1px_2px_rgba(18,33,61,0.04)]">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            <div>
              <Label htmlFor="about">In your own words</Label>
              <TextArea
                id="about"
                rows={4}
                placeholder="I'm a third-year computer science student from Indonesia studying in Beijing on a full scholarship. I'm looking for funded opportunities in AI or machine learning..."
                value={profile.about}
                onChange={(e) => update("about", e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country">Your country</Label>
                <TextInput
                  id="country"
                  placeholder="Indonesia"
                  value={profile.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="targetCountry">Where you'd like to study / work</Label>
                <TextInput
                  id="targetCountry"
                  placeholder="Anywhere, or a specific place"
                  value={profile.targetCountry}
                  onChange={(e) => update("targetCountry", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fieldOfStudy">Field of study</Label>
                <TextInput
                  id="fieldOfStudy"
                  placeholder="Artificial intelligence"
                  value={profile.fieldOfStudy}
                  onChange={(e) => update("fieldOfStudy", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="degreeLevel">Degree level</Label>
                <Select
                  id="degreeLevel"
                  value={profile.degreeLevel}
                  onChange={(e) => update("degreeLevel", e.target.value)}
                >
                  <option value="">Select one</option>
                  <option value="High school">High school</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate / Master's">Graduate / Master&rsquo;s</option>
                  <option value="Doctoral">Doctoral</option>
                  <option value="Early career">Early career</option>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto px-8 py-3.5 bg-ink text-paper font-semibold rounded-sm hover:bg-ink-soft active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {status === "loading" ? "Searching…" : "Find my opportunities"}
              </button>
            </div>

            {status === "error" && (
              <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                {errorMsg}
              </p>
            )}
          </form>

          {status === "loading" && (
            <div className="border-t border-line px-6 sm:px-10 py-8 sm:py-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-deep/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-deep" />
                </span>
                <p className="text-sm text-ink-soft font-medium">{statusMsg}</p>
              </div>

              {steps.length > 0 && (
                <ul className="space-y-2 pl-5">
                  {steps.map((s) => (
                    <li key={s.index} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          s.done ? "bg-moss" : "bg-line animate-pulse"
                        }`}
                      />
                      <span className={s.done ? "text-slate" : "text-ink-soft"}>
                        &ldquo;{s.query}&rdquo;
                        {s.done && (
                          <span className="text-slate">
                            {" "}
                            — {s.resultCount ?? 0} {s.resultCount === 1 ? "result" : "results"}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {status === "done" && (
            <div className="border-t border-line px-6 sm:px-10 py-8 sm:py-10">
              {matches.length === 0 ? (
                <div className="text-center py-10 sm:py-14">
                  <div className="mx-auto mb-5 h-14 w-14 rounded-full border-2 border-dashed border-line flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-line" />
                  </div>
                  <p className="font-display text-xl text-ink italic mb-2">
                    Nothing verifiable turned up this time.
                  </p>
                  <p className="text-slate text-sm max-w-sm mx-auto">
                    Try adding more detail — your field, degree level, or where you&rsquo;d
                    like to study — and search again.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-display text-2xl text-ink italic">
                      {matches.length} {matches.length === 1 ? "match" : "matches"} found
                    </h2>
                  </div>
                  {searchNotes && (
                    <p className="text-xs text-slate mb-6 -mt-3">{searchNotes}</p>
                  )}
                  <div className="space-y-5">
                    {matches.map((m, i) => (
                      <MatchCard key={`${m.name}-${i}`} match={m} index={i} />
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-line/70 text-center">
                    <button
                      type="button"
                      onClick={resetAndSearch}
                      className="text-sm font-semibold text-gold-deep hover:text-ink transition-colors"
                    >
                      ← Search again with different details
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate/70 text-center mt-8 leading-relaxed">
          Foundwell searches the live web for every result and links its source.
          Always confirm deadlines and eligibility on the official page before applying.
        </p>
      </div>
    </main>
  );
}
