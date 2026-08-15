"use client";

import { useState } from "react";
import type { SavedOpportunity, ApplicationStatus } from "@/lib/types";

interface SavedTrackerProps {
  savedList: SavedOpportunity[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
  onOpenDetails: (opportunity: SavedOpportunity) => void;
  onGoToSearch: () => void;
}

const statusColumns: { key: ApplicationStatus; label: string; bg: string; text: string; border: string }[] = [
  { key: "Interested", label: "Interested", bg: "bg-blue-50/80", text: "text-blue-900", border: "border-blue-200" },
  { key: "Applying", label: "Applying", bg: "bg-amber-50/80", text: "text-amber-900", border: "border-amber-200" },
  { key: "Submitted", label: "Submitted", bg: "bg-purple-50/80", text: "text-purple-900", border: "border-purple-200" },
  { key: "Awarded", label: "Awarded 🎉", bg: "bg-emerald-50/80", text: "text-emerald-900", border: "border-emerald-200" },
];

function getGoogleCalendarUrl(item: SavedOpportunity): string {
  const title = encodeURIComponent(`[Deadline] Scholarship: ${item.name}`);
  const details = encodeURIComponent(
    `Scholarship: ${item.name}\nOrganization: ${item.organization || "N/A"}\nSource URL: ${item.sourceUrl}\nWhy it fits: ${item.whyItFits}`
  );
  const location = encodeURIComponent(item.sourceUrl);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
}

function getDaysRemaining(deadlineStr: string | null): string {
  if (!deadlineStr || deadlineStr.toLowerCase().includes("rolling") || deadlineStr.toLowerCase().includes("unclear")) {
    return "Rolling / Open";
  }
  const dateMatch = deadlineStr.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})|([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
  if (!dateMatch) return deadlineStr;

  try {
    const target = new Date(dateMatch[0]);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (isNaN(diffDays)) return deadlineStr;
    if (diffDays < 0) return "Passed";
    if (diffDays === 0) return "Today!";
    return `⏳ ${diffDays} days left`;
  } catch {
    return deadlineStr;
  }
}

export default function SavedTracker({
  savedList,
  onUpdateStatus,
  onUpdateNotes,
  onRemove,
  onOpenDetails,
  onGoToSearch,
}: SavedTrackerProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  const filtered = savedList.filter((item) => {
    if (filterStatus === "All") return true;
    return item.status === filterStatus;
  });

  function handleSaveNotes(id: string) {
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  }

  function exportCSV() {
    if (savedList.length === 0) return;
    const headers = ["Name", "Organization", "Status", "Deadline", "Source URL", "User Notes"];
    const rows = savedList.map((item) => [
      `"${item.name.replaceAll('"', '""')}"`,
      `"${(item.organization || "").replaceAll('"', '""')}"`,
      `"${item.status}"`,
      `"${item.deadline || "Unclear"}"`,
      `"${item.sourceUrl}"`,
      `"${(item.userNotes || "").replaceAll('"', '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Foundwell_Saved_Scholarships_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportCalendarICS() {
    if (savedList.length === 0) return;
    let icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Foundwell//Scholarship Tracker//EN\n";
    savedList.forEach((item, index) => {
      icsData += "BEGIN:VEVENT\n";
      icsData += `UID:foundwell-${index}-${Date.now()}\n`;
      icsData += `SUMMARY:Scholarship Deadline: ${item.name}\n`;
      icsData += `DESCRIPTION:${item.whyItFits.replaceAll("\n", " ")} | Source: ${item.sourceUrl}\n`;
      icsData += `URL:${item.sourceUrl}\n`;
      icsData += "END:VEVENT\n";
    });
    icsData += "END:VCALENDAR";

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Foundwell_Deadlines.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-10 px-5 sm:px-8">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-deep">
            Personal Application Workspace
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Saved Opportunities ({savedList.length})
          </h2>
        </div>

        {savedList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="bg-white border border-line p-1 rounded-sm flex items-center gap-1 shadow-2xs">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                  viewMode === "kanban" ? "bg-ink text-paper" : "text-slate hover:text-ink"
                }`}
              >
                📋 Kanban Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-ink text-paper" : "text-slate hover:text-ink"
                }`}
              >
                📑 List View
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="px-3.5 py-1.5 bg-white border border-line text-ink text-xs font-semibold rounded-sm hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>

            <button
              onClick={exportCalendarICS}
              className="px-3.5 py-1.5 bg-white border border-line text-ink text-xs font-semibold rounded-sm hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              iCal (.ics)
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats Overview Bar */}
      {savedList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-sm border border-line shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate block">Total Tracked</span>
            <p className="text-2xl font-display font-bold text-ink mt-0.5">
              {savedList.length} <span className="text-xs text-slate font-sans font-normal">opportunities</span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-line shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">In Progress</span>
            <p className="text-2xl font-display font-bold text-amber-900 mt-0.5">
              {savedList.filter((i) => i.status === "Applying" || i.status === "Interested").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-line shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">Submitted</span>
            <p className="text-2xl font-display font-bold text-purple-900 mt-0.5">
              {savedList.filter((i) => i.status === "Submitted").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-line shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Awarded</span>
            <p className="text-2xl font-display font-bold text-emerald-900 mt-0.5">
              {savedList.filter((i) => i.status === "Awarded").length} 🎉
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedList.length === 0 ? (
        <div className="bg-white/80 border border-line rounded-sm p-10 sm:p-14 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-dashed border-line flex items-center justify-center text-slate">
            ★
          </div>
          <h3 className="font-display text-2xl text-ink font-bold mb-2">No saved opportunities yet</h3>
          <p className="text-slate text-sm max-w-md mx-auto mb-6">
            When you run a search, click the star icon on any match to save it to your personal application workspace here.
          </p>
          <button
            onClick={onGoToSearch}
            className="px-6 py-3 bg-ink text-paper text-sm font-semibold rounded-sm hover:bg-ink-soft transition-colors cursor-pointer"
          >
            Start Opportunity Search →
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {statusColumns.map((col) => {
            const colItems = savedList.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className={`${col.bg} border ${col.border} rounded-sm p-3.5 space-y-3 min-h-[420px]`}>
                <div className="flex items-center justify-between px-1 pb-1 border-b border-line/50">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>
                    {col.label}
                  </h3>
                  <span className="text-[11px] font-bold bg-white text-slate px-2 py-0.5 rounded-full border border-line">
                    {colItems.length}
                  </span>
                </div>

                {colItems.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate/60 border border-dashed border-line/60 rounded">
                    No items in {col.label}
                  </div>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-line rounded-sm p-3.5 shadow-2xs hover:border-gold-deep/60 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => onOpenDetails(item)}
                          className="font-display text-base font-bold text-ink hover:text-gold-deep cursor-pointer leading-snug"
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-slate/40 hover:text-red-600 transition-colors p-0.5 cursor-pointer shrink-0"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>

                      {item.organization && (
                        <p className="text-[11px] text-slate line-clamp-1 font-medium">{item.organization}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="bg-stone-100 text-slate px-1.5 py-0.5 rounded border border-line">
                          {getDaysRemaining(item.deadline)}
                        </span>
                        {item.fundingType && (
                          <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                            {item.fundingType}
                          </span>
                        )}
                      </div>

                      {/* Quick Move Selector */}
                      <div className="pt-2 border-t border-line/50 flex items-center justify-between gap-1 text-[11px]">
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value as ApplicationStatus)}
                          className="text-[10px] font-semibold bg-paper border border-line rounded px-1.5 py-0.5 text-ink focus:outline-none focus:border-gold-deep cursor-pointer"
                        >
                          <option value="Interested">Move: Interested</option>
                          <option value="Applying">Move: Applying</option>
                          <option value="Submitted">Move: Submitted</option>
                          <option value="Awarded">Move: Awarded 🎉</option>
                        </select>

                        <a
                          href={getGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-deep hover:text-ink font-semibold flex items-center gap-0.5 shrink-0"
                          title="Sync deadline to Google Calendar"
                        >
                          <span>📅 Cal</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED LIST VIEW */
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "Interested", "Applying", "Submitted", "Awarded"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-ink text-paper border-ink font-semibold"
                    : "bg-white text-slate border-line hover:border-slate"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white/80 border border-line rounded-sm p-8 text-center text-slate">
              No saved items match the filter &ldquo;{filterStatus}&rdquo;.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-line rounded-sm p-5 sm:p-6 shadow-2xs hover:border-gold-deep/50 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-ink/5 border-line text-ink">
                        {item.status}
                      </span>
                      <span className="text-xs text-slate">{getDaysRemaining(item.deadline)}</span>
                    </div>
                    <h3
                      onClick={() => onOpenDetails(item)}
                      className="font-display text-xl font-bold text-ink hover:text-gold-deep cursor-pointer transition-colors"
                    >
                      {item.name}
                    </h3>
                    {item.organization && <p className="text-xs text-slate mt-0.5">{item.organization}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-paper border border-line text-ink text-xs font-semibold rounded-xs hover:border-gold-deep transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>📅 Google Cal</span>
                    </a>

                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as ApplicationStatus)}
                      className="text-xs font-semibold bg-paper border border-line rounded px-2.5 py-1.5 text-ink focus:outline-none focus:border-gold-deep cursor-pointer"
                    >
                      <option value="Interested">Interested</option>
                      <option value="Applying">Applying</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Awarded">Awarded 🎉</option>
                    </select>

                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-slate/60 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate leading-relaxed bg-paper/50 p-3 rounded border border-line/50">
                  {item.whyItFits}
                </p>

                {/* Notes Section */}
                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                  {editingNotesId === item.id ? (
                    <div className="w-full space-y-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add personal notes (e.g. essay deadline, contact person)..."
                        className="w-full text-xs p-2 bg-paper border border-line rounded focus:outline-none focus:border-gold-deep"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-slate hover:text-ink cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(item.id)}
                          className="px-3 py-1 bg-ink text-paper rounded font-semibold cursor-pointer"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-slate italic">
                        {item.userNotes ? `Note: "${item.userNotes}"` : "No personal notes added."}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setTempNotes(item.userNotes || "");
                        }}
                        className="text-gold-deep hover:underline font-medium cursor-pointer"
                      >
                        {item.userNotes ? "Edit Note" : "+ Add Note"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
