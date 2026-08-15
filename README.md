# Foundwell

Tell it about yourself. It searches the live web and returns real scholarships
and funded opportunities — each with a plain-language "why this fits," a
verifiable source link, and a clear read on the deadline. Save the ones you
like, track your application progress, and get an AI-drafted strategy for
your Statement of Purpose.

Built for the ML Empowerment Build Challenge.

## What it does

**Find real, current opportunities.** Fill in a short profile — free text
plus a few optional fields — and Foundwell searches the live web multiple
times, reads what comes back, and picks the best matches for you. Every
match ships with a source link you can click and verify yourself.

**Never invents a scholarship.** Every match is checked, in code, against
the URLs that a real search actually returned during that run. No verified
source → the match never reaches your screen. This isn't a prompt asking
the model to behave — it's a server-side filter in `sanitizeMatches`
(`app/api/match/route.ts`) that runs regardless of what the model outputs.

**Tells you what it isn't sure about.** Deadlines are classified as `open`
(confirmed, still ahead of today), `rolling` (no fixed deadline), or
`unclear` (found, but the date couldn't be pinned down with confidence). An
unclear deadline is always shown with a "verify on source" flag — never
hidden — because a real opportunity is worth a double-check, not a guess.

**Filters out forums and discussion sites** at the search layer itself
(Reddit, Quora, Facebook, and similar) before results ever reach the model,
so matches come from actual program pages and reputable databases, not
secondhand chatter.

**Helps you apply, not just find.** Save an opportunity and Foundwell
drafts an SOP strategy blueprint — a winning angle, an essay outline, CV
tweaks, and recommendation-letter talking points, tailored to that specific
program and your background.

**Tracks your applications.** A saved-opportunities workspace with a Kanban
board and a list view, per-item notes, status tracking (Interested →
Applying → Submitted → Awarded), and one-click export to CSV or your
calendar (Google Calendar links, plus a downloadable `.ics` file).

## How it's grounded

Two different AI features here work two different ways, and it's worth
knowing which is which:

- **Matching** is search-grounded. The model calls a real web-search tool,
  reads real results, and every match is checked against those results
  before display. This is where the hallucination guardrail lives.
- **SOP strategy** is generative. There's no external "correct answer" for
  essay strategy or CV advice to verify against — it's the model reasoning
  from your background and the matched program, the same way a writing
  coach would. It doesn't search, and it doesn't need to.

## Setup

You need two free API keys — neither requires a credit card.

1. **OpenRouter** (runs the open-source model):
   [openrouter.ai/keys](https://openrouter.ai/keys) → sign up → create a key.
2. **Tavily** (gives the model real web search):
   [tavily.com](https://tavily.com) → sign up → grab your key from the
   dashboard. Free tier: 1,000 searches/month.

Then:

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in both keys:

```
OPENROUTER_API_KEY=sk-or-v1-...
TAVILY_API_KEY=tvly-...
```

Run it:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — note the app runs on
port **3001**, not the Next.js default of 3000.

## Notes on the model

The app requests `openrouter/free` — OpenRouter's own auto-router — rather
than a specific model ID. OpenRouter's free-model lineup rotates often
(models get added and pulled with little notice), so pinning one specific
`:free` model risked the app breaking mid-review. The auto-router picks
among free models that support tool calling, so this keeps working as the
underlying roster changes. If you want to pin a specific model instead, edit
the `MODEL` constant in `app/api/match/route.ts` and
`app/api/sop-strategy/route.ts`.

Network calls to OpenRouter and Tavily retry automatically on transient
failures (timeouts, connection drops, 502/503/504) with exponential
backoff — see `fetchWithRetry` in `app/api/match/route.ts` — since flaky
wifi shouldn't mean a failed search.

## Your data

Saved opportunities, notes, and application status live in your browser's
`localStorage` (key: `foundwell_saved_opps`) — there's no account and no
server-side database, so your saved list is local to the browser you used
to save it. This keeps the app simple and fast to ship, at the cost of not
syncing across devices.

## Deploying

Any Next.js host works (Vercel is the path of least resistance). Set the
same two environment variables in the host's dashboard — don't commit
`.env.local`, it's already gitignored.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
OpenRouter · Tavily Search API
