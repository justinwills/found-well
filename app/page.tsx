"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import SearchPresets from "@/app/components/SearchPresets";
import MatchCard from "@/app/components/MatchCard";
import OpportunityModal from "@/app/components/OpportunityModal";
import SavedTracker from "@/app/components/SavedTracker";
import FeaturesGrid from "@/app/components/FeaturesGrid";
import Testimonials from "@/app/components/Testimonials";
import FaqSection from "@/app/components/FaqSection";
import Footer from "@/app/components/Footer";
import { Label, TextInput, TextArea, Select } from "@/app/components/FormField";

import type { StudentProfile, OpportunityMatch, SavedOpportunity, ApplicationStatus } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

type SearchStep = {
  query: string;
  index: number;
  done: boolean;
  resultCount?: number;
};

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
  const [activeTab, setActiveTab] = useState<"home" | "search" | "saved" | "faq">("home");
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [status, setStatus] = useState<Status>("idle");
  const [matches, setMatches] = useState<OpportunityMatch[]>([]);
  const [searchNotes, setSearchNotes] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [steps, setSteps] = useState<SearchStep[]>([]);
  
  // Saved opportunities state persisted in localStorage
  const [savedList, setSavedList] = useState<SavedOpportunity[]>([]);
  const [selectedModalMatch, setSelectedModalMatch] = useState<OpportunityMatch | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved opportunities on initial mount
  useEffect(() => {
    try {
      const item = localStorage.getItem("foundwell_saved_opps");
      if (item) {
        setSavedList(JSON.parse(item));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Sync saved opportunities to localStorage
  function persistSavedList(newList: SavedOpportunity[]) {
    setSavedList(newList);
    try {
      localStorage.setItem("foundwell_saved_opps", JSON.stringify(newList));
    } catch {
      // Ignore localStorage write errors
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }

  function update<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function handleSelectPreset(presetProfile: StudentProfile) {
    setProfile(presetProfile);
    setActiveTab("search");
    showToast("Preset profile loaded! Click 'Find my opportunities' to search.");
    setTimeout(() => {
      const searchElem = document.getElementById("search-form-section");
      if (searchElem) {
        searchElem.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  function handleToggleSave(match: OpportunityMatch) {
    const matchId = match.id || match.sourceUrl || match.name;
    const existingIndex = savedList.findIndex((item) => (item.id || item.sourceUrl) === matchId);

    if (existingIndex >= 0) {
      const updated = savedList.filter((_, idx) => idx !== existingIndex);
      persistSavedList(updated);
      showToast(`Removed "${match.name}" from tracker`);
    } else {
      const newSavedItem: SavedOpportunity = {
        ...match,
        id: matchId,
        savedAt: new Date().toISOString(),
        status: "Interested",
      };
      persistSavedList([newSavedItem, ...savedList]);
      showToast(`Saved "${match.name}" to your tracker ★`);
    }
  }

  function handleUpdateSavedStatus(id: string, newStatus: ApplicationStatus) {
    const updated = savedList.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
    persistSavedList(updated);
    showToast(`Updated status to ${newStatus}`);
  }

  function handleUpdateSavedNotes(id: string, notes: string) {
    const updated = savedList.map((item) => (item.id === id ? { ...item, userNotes: notes } : item));
    persistSavedList(updated);
    showToast("Notes saved!");
  }

  function handleRemoveSaved(id: string) {
    const updated = savedList.filter((item) => item.id !== id);
    persistSavedList(updated);
    showToast("Opportunity removed from tracker");
  }

  function resetAndSearch() {
    setStatus("idle");
    setMatches([]);
    setSearchNotes(undefined);
    setErrorMsg("");
    setStatusMsg("");
    setSteps([]);
    const formElem = document.getElementById("search-form-section");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleStartSearchCTA() {
    setActiveTab("search");
    setTimeout(() => {
      const formElem = document.getElementById("search-form-section");
      if (formElem) {
        formElem.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
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
    setStatusMsg("Starting live web search…");
    setSteps([]);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok || !res.body) {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {
          // ignore
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
        buffer = lines.pop() ?? "";

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
                s.index === event.index ? { ...s, done: true, resultCount: event.resultCount } : s
              )
            );
          } else if (event.type === "result") {
            const formattedMatches = event.matches.map((m, idx) => ({
              ...m,
              id: m.sourceUrl || `match-${idx}-${Date.now()}`,
            }));
            setMatches(formattedMatches);
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
      setErrorMsg("Couldn't reach the search service. Check your connection and try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-gold/30">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedList.length}
        onStartSearch={handleStartSearchCTA}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper text-xs font-semibold px-4 py-3 rounded-sm shadow-xl flex items-center gap-2 border border-gold-deep/50 animate-fade-up">
          <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {/* TAB 1: OVERVIEW / LANDING PAGE */}
        {activeTab === "home" && (
          <>
            <HeroSection onStartSearch={handleStartSearchCTA} />
            <FeaturesGrid />

            {/* Embedded Live Search Workspace Section */}
            <section id="search-form-section" className="py-16 sm:py-20 px-5 sm:px-8 max-w-4xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-deep">
                  Interactive Search Engine
                </span>
                <h2 className="font-display text-3xl sm:text-4xl italic text-ink font-bold mt-1">
                  Find your verified opportunities now
                </h2>
              </div>

              {/* Presets Chips */}
              <SearchPresets onSelectPreset={handleSelectPreset} />

              {/* Main Document Form */}
              <div className="bg-white border border-line rounded-2xl shadow-xl p-6 sm:p-10 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="about">In your own words</Label>
                    <TextArea
                      id="about"
                      rows={4}
                      placeholder="I'm a third-year computer science student from Indonesia seeking fully funded AI/ML master's scholarships in Europe or North America..."
                      value={profile.about}
                      onChange={(e) => update("about", e.target.value)}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="country">Your country / nationality</Label>
                      <TextInput
                        id="country"
                        placeholder="e.g. Indonesia, Nigeria, Colombia"
                        value={profile.country}
                        onChange={(e) => update("country", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetCountry">Target country for study</Label>
                      <TextInput
                        id="targetCountry"
                        placeholder="e.g. Germany, USA, UK, Any"
                        value={profile.targetCountry}
                        onChange={(e) => update("targetCountry", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldOfStudy">Field of study</Label>
                      <TextInput
                        id="fieldOfStudy"
                        placeholder="e.g. Artificial Intelligence, Medicine, Fine Arts"
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
                        <option value="">Select degree level</option>
                        <option value="High school">High school</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate / Master's">Graduate / Master&rsquo;s</option>
                        <option value="Doctoral">Doctoral (PhD)</option>
                        <option value="Early career">Early career / Postdoc</option>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 bg-ink text-paper font-semibold text-base rounded-xl hover:bg-ink-soft active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <span>Searching Live Web...</span>
                      ) : (
                        <>
                          <span>Run Verified Search</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {status === "error" && (
                    <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                      {errorMsg}
                    </p>
                  )}
                </form>

                {/* Loading State Stream View */}
                {status === "loading" && (
                  <div className="border-t border-line mt-8 pt-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-deep/60" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-deep" />
                      </span>
                      <p className="text-sm text-ink-soft font-semibold">{statusMsg}</p>
                    </div>

                    {steps.length > 0 && (
                      <ul className="space-y-2 pl-5">
                        {steps.map((s) => (
                          <li key={s.index} className="flex items-start gap-2 text-sm">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                                s.done ? "bg-moss" : "bg-gold animate-pulse"
                              }`}
                            />
                            <span className={s.done ? "text-slate" : "text-ink-soft font-medium"}>
                              &ldquo;{s.query}&rdquo;
                              {s.done && (
                                <span className="text-slate">
                                  {" "}
                                  — {s.resultCount ?? 0} {s.resultCount === 1 ? "source page" : "source pages"} retrieved
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Match Results View */}
                {status === "done" && (
                  <div className="border-t border-line mt-8 pt-8 animate-fade-in">
                    {matches.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="font-display text-xl text-ink italic mb-2">
                          No verifiable opportunities matched this run.
                        </p>
                        <p className="text-slate text-sm max-w-sm mx-auto">
                          Try adjusting your description or adding field details above to run a fresh live query.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-display text-2xl text-ink italic font-bold">
                            {matches.length} verified {matches.length === 1 ? "opportunity" : "opportunities"} found
                          </h3>
                        </div>
                        {searchNotes && <p className="text-xs text-slate mb-6 -mt-3">{searchNotes}</p>}

                        <div className="space-y-5">
                          {matches.map((m, i) => {
                            const isSaved = savedList.some(
                              (s) => (s.id || s.sourceUrl) === (m.id || m.sourceUrl)
                            );
                            return (
                              <MatchCard
                                key={m.id || i}
                                match={m}
                                index={i}
                                onOpenModal={setSelectedModalMatch}
                                onSaveToggle={handleToggleSave}
                                isSaved={isSaved}
                              />
                            );
                          })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-line text-center">
                          <button
                            type="button"
                            onClick={resetAndSearch}
                            className="text-sm font-semibold text-gold-deep hover:text-ink transition-colors cursor-pointer"
                          >
                            ← Run fresh search with new profile details
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            <Testimonials />
            <FaqSection />
          </>
        )}

        {/* TAB 2: LIVE MATCH FINDER ONLY */}
        {activeTab === "search" && (
          <section className="py-12 sm:py-16 px-5 sm:px-8 max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-deep">
                Live Search Tool
              </span>
              <h1 className="font-display text-3xl sm:text-5xl italic text-ink font-bold mt-1">
                Search verified opportunities
              </h1>
              <p className="text-slate text-sm sm:text-base mt-2">
                Enter your background details or pick a quick demo preset below.
              </p>
            </div>

            <SearchPresets onSelectPreset={handleSelectPreset} />

            <div id="search-form-section" className="bg-white/90 border border-line rounded-sm shadow-sm p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="about">In your own words</Label>
                  <TextArea
                    id="about"
                    rows={4}
                    placeholder="Tell us about yourself (e.g. field of study, country of origin, target degree, GPA)..."
                    value={profile.about}
                    onChange={(e) => update("about", e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="country">Your country / nationality</Label>
                    <TextInput
                      id="country"
                      placeholder="e.g. Indonesia"
                      value={profile.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetCountry">Target country for study</Label>
                    <TextInput
                      id="targetCountry"
                      placeholder="e.g. Germany, USA, UK"
                      value={profile.targetCountry}
                      onChange={(e) => update("targetCountry", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldOfStudy">Field of study</Label>
                    <TextInput
                      id="fieldOfStudy"
                      placeholder="e.g. Computer Science"
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
                      <option value="">Select degree level</option>
                      <option value="High school">High school</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate / Master's">Graduate / Master&rsquo;s</option>
                      <option value="Doctoral">Doctoral (PhD)</option>
                      <option value="Early career">Early career / Postdoc</option>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-ink text-paper font-bold rounded-sm hover:bg-ink-soft disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? "Searching Live Web..." : "Find my opportunities"}
                  </button>
                </div>

                {status === "error" && (
                  <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                    {errorMsg}
                  </p>
                )}
              </form>

              {status === "loading" && (
                <div className="border-t border-line mt-8 pt-8 animate-fade-in">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-deep/60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-deep" />
                    </span>
                    <p className="text-sm text-ink-soft font-semibold">{statusMsg}</p>
                  </div>

                  {steps.length > 0 && (
                    <ul className="space-y-2 pl-5">
                      {steps.map((s) => (
                        <li key={s.index} className="flex items-start gap-2 text-sm">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                              s.done ? "bg-moss" : "bg-gold animate-pulse"
                            }`}
                          />
                          <span className={s.done ? "text-slate" : "text-ink-soft font-medium"}>
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
                <div className="border-t border-line mt-8 pt-8 animate-fade-in">
                  {matches.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="font-display text-xl text-ink italic mb-2">
                        No verifiable opportunities matched this query.
                      </p>
                      <p className="text-slate text-sm max-w-sm mx-auto">
                        Try modifying your field or target region and search again.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-2xl text-ink italic font-bold">
                          {matches.length} verified {matches.length === 1 ? "match" : "matches"} found
                        </h3>
                      </div>
                      {searchNotes && <p className="text-xs text-slate mb-6 -mt-3">{searchNotes}</p>}

                      <div className="space-y-5">
                        {matches.map((m, i) => {
                          const isSaved = savedList.some(
                            (s) => (s.id || s.sourceUrl) === (m.id || m.sourceUrl)
                          );
                          return (
                            <MatchCard
                              key={m.id || i}
                              match={m}
                              index={i}
                              onOpenModal={setSelectedModalMatch}
                              onSaveToggle={handleToggleSave}
                              isSaved={isSaved}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: SAVED TRACKER DASHBOARD */}
        {activeTab === "saved" && (
          <SavedTracker
            savedList={savedList}
            onUpdateStatus={handleUpdateSavedStatus}
            onUpdateNotes={handleUpdateSavedNotes}
            onRemove={handleRemoveSaved}
            onOpenDetails={setSelectedModalMatch}
            onGoToSearch={handleStartSearchCTA}
          />
        )}

        {/* TAB 4: FAQ */}
        {activeTab === "faq" && <FaqSection />}
      </main>

      {/* Footer */}
      <Footer onNav={setActiveTab} />

      {/* Opportunity Strategy Modal */}
      {selectedModalMatch && (
        <OpportunityModal
          match={selectedModalMatch}
          profile={profile}
          onClose={() => setSelectedModalMatch(null)}
          onSaveToggle={handleToggleSave}
          isSaved={savedList.some(
            (s) => (s.id || s.sourceUrl) === (selectedModalMatch.id || selectedModalMatch.sourceUrl)
          )}
        />
      )}
    </div>
  );
}
