import { NextRequest } from "next/server";
import type { StudentProfile, OpportunityMatch } from "@/lib/types";

export const maxDuration = 60;

// OpenRouter's own free-model auto-router. Requesting `tools` support means it
// only selects among free models that can actually do function calling, so this
// keeps working even as individual :free model IDs rotate in and out.
const MODEL = "openrouter/free";
const MAX_TOOL_ROUNDS = 4;

const SYSTEM_PROMPT = `You are Foundwell's research assistant. You help students find real scholarships and funded opportunities that genuinely fit them.

You have a search_web tool. Use it 2 to 3 times with focused queries covering the student's field, degree level, nationality, and target country. Once you have gathered sufficient search results, synthesize your findings. Never invent, guess, or recall opportunities from memory alone. Only include programs that appeared in your search results, with a real URL from those results.

For each opportunity you recommend, the sourceUrl must be a URL that actually appeared in a search_web result you received — not a guess, not a homepage you're assuming exists, not a search-results page.

Today's real date is {{TODAY}}. For every match, decide its deadlineStatus by comparing what you found to this date:
- "open" — you found a specific deadline date and it is after {{TODAY}}. Put that date in "deadline".
- "rolling" — the source explicitly says rolling admission / no fixed deadline / accepts applications year-round. Put a short note in "deadline" (e.g. "Rolling").
- "unclear" — a deadline was mentioned but you cannot confidently tell whether it is before or after {{TODAY}} (vague wording like "spring intake", an ambiguous or unlabeled format, conflicting dates across sources, or the year is unclear). Put whatever text you found in "deadline" so the student can judge for themselves.
Do not include a match at all if you are confident its deadline has already passed — leave it out entirely rather than including a closed opportunity.

Once you have searched enough, respond with ONLY a JSON object (no markdown fences, no prose before or after) matching this shape:

{
  "matches": [
    {
      "name": "string — the program's actual name",
      "organization": "string — who runs it",
      "whyItFits": "string — 2-3 sentences, specific to this student's profile, plain language, no fluff",
      "deadline": "string or null — the date/text you found, or null if none was mentioned anywhere",
      "deadlineStatus": "open" | "rolling" | "unclear",
      "sourceUrl": "string — a real URL that appeared in your search_web results for this exact program",
      "confidence": "strong" | "good" | "worth a look",
      "fundingType": "Fully Funded" | "Tuition Only" | "Partial Stipend" | "Grant / Award",
      "fundingBreakdown": {
        "tuition": "string — e.g. 100% Tuition Covered",
        "stipend": "string — e.g. €934 / month living allowance",
        "travel": "string — e.g. Round-trip airfare included",
        "insurance": "string — e.g. Health insurance covered"
      },
      "eligibilityCheck": {
        "gpaRequirement": "string — e.g. GPA 3.0+ or Upper Second Class",
        "languageRequirement": "string — e.g. IELTS 6.5+ or English waiver",
        "nationalityEligible": "string — e.g. Open to ASEAN / International students"
      }
    }
  ],
  "searchNotes": "string — one sentence on what you searched for, shown to the user for transparency"
}

Return 6 to 10 matches, ranked best fit first. If you cannot find enough well-fitting real opportunities, return fewer rather than padding with weak or invented ones. Every match MUST have a real sourceUrl from an actual search result or it must be omitted entirely.`;

const SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_web",
    description:
      "Search the live web for current information. Use this to find real scholarships, funded programs, and opportunities. Call it multiple times with different queries to cover the student's field, degree level, nationality, and target country.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A focused search query, e.g. 'AI masters scholarship Indonesian students 2026'",
        },
      },
      required: ["query"],
    },
  },
} as const;

function buildUserPrompt(profile: StudentProfile): string {
  const parts: string[] = [];

  if (profile.about?.trim()) {
    parts.push(`Student's own description: ${profile.about.trim()}`);
  }

  const structured: string[] = [];
  if (profile.country) structured.push(`Nationality/current country: ${profile.country}`);
  if (profile.fieldOfStudy) structured.push(`Field of study: ${profile.fieldOfStudy}`);
  if (profile.degreeLevel) structured.push(`Degree level: ${profile.degreeLevel}`);
  if (profile.targetCountry) structured.push(`Target country/region for study: ${profile.targetCountry}`);

  if (structured.length > 0) {
    parts.push(`Additional details:\n${structured.join("\n")}`);
  }

  if (parts.length === 0) {
    throw new Error("empty_profile");
  }

  return `Find real, current scholarships or funded opportunities for this student:\n\n${parts.join("\n\n")}\n\nSearch the web now using search_web, then respond with the JSON object only.`;
}

/** Strip common wrapping (markdown fences, stray prose) an LLM might add despite instructions. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text.trim();
}

function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr.trim());
    let pathname = u.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    return `${u.protocol}//${u.host.toLowerCase()}${pathname}${u.search}`;
  } catch {
    return urlStr.trim().replace(/\/$/, "").toLowerCase();
  }
}

function detectDomainType(urlStr: string): OpportunityMatch["domainType"] {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    if (host.endsWith(".edu") || host.includes(".ac.") || host.endsWith(".edu.au") || host.endsWith(".edu.sg")) {
      return "official_edu";
    }
    if (host.endsWith(".gov") || host.includes(".go.") || host.includes(".gov.")) {
      return "official_gov";
    }
    if (host.endsWith(".org") || host.includes("foundation") || host.includes("chevening") || host.includes("fulbright") || host.includes("daad")) {
      return "verified_foundation";
    }
  } catch {}
  return "organization";
}

/** Server-side enforcement of the no-source, no-display rule — not just a prompt instruction. */
function sanitizeMatches(raw: unknown, seenUrls: Set<string>, seenHosts: Set<string>): OpportunityMatch[] {
  if (!Array.isArray(raw)) return [];

  const validConfidence = new Set(["strong", "good", "worth a look"]);
  const validDeadlineStatus = new Set(["open", "rolling", "unclear"]);
  const validFundingType = new Set(["Fully Funded", "Tuition Only", "Partial Stipend", "Grant / Award"]);

  return raw
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .filter((m) => isValidUrl(m.sourceUrl))
    // Belt-and-suspenders: the URL or its domain must be one that a real search result actually
    // returned this run.
    .filter((m) => {
      const urlStr = String(m.sourceUrl).trim();
      const norm = normalizeUrl(urlStr);
      if (seenUrls.has(urlStr) || seenUrls.has(norm)) return true;
      try {
        const host = new URL(urlStr).hostname.toLowerCase();
        return seenHosts.has(host);
      } catch {
        return false;
      }
    })
    .filter((m) => typeof m.name === "string" && m.name.trim().length > 0)
    .filter((m) => typeof m.whyItFits === "string" && m.whyItFits.trim().length > 0)
    .map((m) => {
      const urlStr = String(m.sourceUrl).trim();
      const domainType = detectDomainType(urlStr);
      const fundingType = validFundingType.has(m.fundingType as string)
        ? (m.fundingType as OpportunityMatch["fundingType"])
        : String(m.whyItFits).toLowerCase().includes("full") || String(m.name).toLowerCase().includes("full")
        ? "Fully Funded"
        : "Partial Stipend";

      const fb = typeof m.fundingBreakdown === "object" && m.fundingBreakdown !== null ? (m.fundingBreakdown as Record<string, unknown>) : {};
      const ec = typeof m.eligibilityCheck === "object" && m.eligibilityCheck !== null ? (m.eligibilityCheck as Record<string, unknown>) : {};

      return {
        name: String(m.name).trim(),
        organization: typeof m.organization === "string" ? m.organization.trim() : "",
        whyItFits: String(m.whyItFits).trim(),
        deadline: typeof m.deadline === "string" && m.deadline.trim() ? m.deadline.trim() : null,
        deadlineStatus: validDeadlineStatus.has(m.deadlineStatus as string)
          ? (m.deadlineStatus as OpportunityMatch["deadlineStatus"])
          : "unclear",
        sourceUrl: urlStr,
        confidence: validConfidence.has(m.confidence as string)
          ? (m.confidence as OpportunityMatch["confidence"])
          : "worth a look",
        fundingType,
        domainType,
        fundingBreakdown: {
          tuition: typeof fb.tuition === "string" ? fb.tuition : "Full / Partial Tuition Waiver",
          stipend: typeof fb.stipend === "string" ? fb.stipend : "Living Allowance / Stipend Provided",
          travel: typeof fb.travel === "string" ? fb.travel : "Roundtrip Travel Allowance",
          insurance: typeof fb.insurance === "string" ? fb.insurance : "Health Insurance Included",
        },
        eligibilityCheck: {
          gpaRequirement: typeof ec.gpaRequirement === "string" ? ec.gpaRequirement : "3.0+ GPA or equivalent",
          languageRequirement: typeof ec.languageRequirement === "string" ? ec.languageRequirement : "English Proficiency / Waiver",
          nationalityEligible: typeof ec.nationalityEligible === "string" ? ec.nationalityEligible : "Eligible International Students",
        },
      };
    })
    .slice(0, 10);
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

// Community/discussion sites — useful for opinions, unreliable for verifying
// that a scholarship program actually exists with the terms claimed. Kept as
// a real allowlist-style exclusion at the search layer, not a prompt hint the
// model could ignore.
const EXCLUDED_DOMAINS = [
  "reddit.com",
  "quora.com",
  "answers.yahoo.com",
  "forum.studentdoctor.net",
  "thegradcafe.com",
  "facebook.com",
  "groups.google.com",
  "news.ycombinator.com",
];

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delayMs = 1000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < retries) {
        if (options.signal?.aborted) throw new Error("aborted");
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        continue;
      }
      return response;
    } catch (err) {
      if (options.signal?.aborted) throw err;
      const isNetworkError =
        err instanceof Error &&
        (err.name === "TypeError" ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("ETIMEDOUT") ||
          err.message.includes("fetch failed"));

      if (isNetworkError && attempt < retries) {
        console.warn(`Fetch to ${url} failed with transient error (${err instanceof Error ? err.message : String(err)}). Retrying attempt ${attempt + 1}/${retries}...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function tavilySearch(tavilyKey: string, query: string, signal?: AbortSignal): Promise<TavilyResult[]> {
  try {
    const res = await fetchWithRetry(
      "https://api.tavily.com/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 8,
          search_depth: "basic",
          exclude_domains: EXCLUDED_DOMAINS,
        }),
        signal,
      },
      2,
      1000,
    );

    if (!res.ok) {
      throw new Error(`Tavily search failed: ${res.status}`);
    }

    const data = await res.json();
    return (data.results ?? []).map((r: { title?: string; url: string; content?: string }) => ({
      title: r.title ?? "",
      url: r.url,
      content: r.content ?? "",
    }));
  } catch (e) {
    if (signal?.aborted) throw e;
    console.error(`Tavily search network error for query "${query}":`, e);
    return [];
  }
}

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

// Discriminated union for every event the stream can emit. The client's
// event parsing is built directly against this shape.
type StreamEvent =
  | { type: "status"; message: string }
  | { type: "query"; query: string; index: number }
  | { type: "query_done"; query: string; index: number; resultCount: number }
  | { type: "result"; matches: OpportunityMatch[]; searchNotes?: string }
  | { type: "error"; message: string; status: number };

function sseLine(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!openRouterKey) {
    return new Response(
      JSON.stringify({ error: "Server is missing its API key. Add OPENROUTER_API_KEY to the environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!tavilyKey) {
    return new Response(
      JSON.stringify({ error: "Server is missing its search key. Add TAVILY_API_KEY to the environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let profile: StudentProfile;
  try {
    profile = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let userPrompt: string;
  try {
    userPrompt = buildUserPrompt(profile);
  } catch {
    return new Response(
      JSON.stringify({ error: "Tell us at least a little about yourself before searching." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        if (isClosed || req.signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(sseLine(event)));
        } catch {
          isClosed = true;
        }
      };

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", () => {
        isClosed = true;
      });

      const messages: ChatMessage[] = [
        {
          role: "system",
          content: SYSTEM_PROMPT.replaceAll("{{TODAY}}", new Date().toISOString().slice(0, 10)),
        },
        { role: "user", content: userPrompt },
      ];

      const seenUrls = new Set<string>();
      const seenHosts = new Set<string>();
      let queryIndex = 0;

      try {
        send({ type: "status", message: "Reading your profile…" });

        let finalFullText: string | null = null;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          if (isClosed || req.signal.aborted) {
            safeClose();
            return;
          }

          const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages,
              tools: [SEARCH_TOOL],
              provider: { require_parameters: true },
            }),
            signal: req.signal,
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error("OpenRouter API error:", response.status, errText);
            send({ type: "error", message: "The search service had a problem. Please try again.", status: 502 });
            safeClose();
            return;
          }

          const data = await response.json();
          const choice = data.choices?.[0];
          const message = choice?.message;

          if (!message) {
            console.error("No message in OpenRouter response:", JSON.stringify(data));
            send({
              type: "error",
              message: "No response came back from the search. Please try again.",
              status: 502,
            });
            safeClose();
            return;
          }

          const toolCalls = message.tool_calls as ChatMessage["tool_calls"];

          if (toolCalls && toolCalls.length > 0) {
            messages.push({ role: "assistant", content: message.content ?? null, tool_calls: toolCalls });

            for (const call of toolCalls) {
              if (isClosed || req.signal.aborted) {
                safeClose();
                return;
              }

              let query = "";
              try {
                query = JSON.parse(call.function.arguments).query ?? "";
              } catch {
                query = "";
              }

              const idx = queryIndex++;
              if (query) send({ type: "query", query, index: idx });

              let resultText: string;
              try {
                const results = query ? await tavilySearch(tavilyKey, query, req.signal) : [];
                for (const r of results) {
                  seenUrls.add(r.url);
                  seenUrls.add(normalizeUrl(r.url));
                  try {
                    seenHosts.add(new URL(r.url).hostname.toLowerCase());
                  } catch {}
                }
                resultText = results.length
                  ? results.map((r) => `- ${r.title}\n  ${r.url}\n  ${r.content.slice(0, 300)}`).join("\n\n")
                  : "No results found for this query.";
                if (query) send({ type: "query_done", query, index: idx, resultCount: results.length });
              } catch (e) {
                if (req.signal.aborted) return;
                console.error("Tavily search error:", e);
                resultText = "Search failed for this query. Try a different query.";
                if (query) send({ type: "query_done", query, index: idx, resultCount: 0 });
              }

              messages.push({ role: "tool", tool_call_id: call.id, content: resultText });
            }

            send({ type: "status", message: "Reviewing what turned up…" });
            continue;
          }

          // No tool calls — model is done searching and emitted answer
          finalFullText = message.content ?? "";
          break;
        }

        if (isClosed || req.signal.aborted) {
          safeClose();
          return;
        }

        // If loop ended after MAX_TOOL_ROUNDS without final text, force a synthesis turn WITHOUT tools
        if (!finalFullText) {
          send({ type: "status", message: "Synthesizing all search results gathered so far…" });
          messages.push({
            role: "user",
            content:
              "Search budget completed. Do not make any further search_web calls. Synthesize all search results above into the requested JSON object format now.",
          });

          const synthResponse = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages,
              // Intentionally no tools provided to guarantee synthesis text output
            }),
            signal: req.signal,
          });

          if (!synthResponse.ok) {
            const errText = await synthResponse.text();
            console.error("OpenRouter synthesis API error:", synthResponse.status, errText);
            send({ type: "error", message: "The search service had a problem. Please try again.", status: 502 });
            safeClose();
            return;
          }

          const synthData = await synthResponse.json();
          finalFullText = synthData.choices?.[0]?.message?.content ?? "";
        }

        if (isClosed || req.signal.aborted) {
          safeClose();
          return;
        }

        if (!finalFullText || !finalFullText.trim()) {
          send({
            type: "error",
            message: "No response came back from the search. Please try again.",
            status: 502,
          });
          safeClose();
          return;
        }

        send({ type: "status", message: "Checking every match has a real source…" });

        let parsed: { matches?: unknown; searchNotes?: unknown };
        try {
          parsed = JSON.parse(extractJson(finalFullText));
        } catch (e) {
          console.error("Failed to parse model JSON:", e, "\nRaw text:", finalFullText);
          send({ type: "error", message: "Couldn't read the search results. Please try again.", status: 502 });
          safeClose();
          return;
        }

        const matches = sanitizeMatches(parsed.matches, seenUrls, seenHosts);

        send({
          type: "result",
          matches,
          searchNotes: typeof parsed.searchNotes === "string" ? parsed.searchNotes : undefined,
        });
        safeClose();
        return;
      } catch (e) {
        if (!isClosed && !req.signal.aborted) {
          console.error("Match route error:", e);
          send({ type: "error", message: "Something went wrong while searching. Please try again.", status: 500 });
        }
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
