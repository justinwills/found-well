# Foundwell

Tell it about yourself. It searches the live web and returns real scholarships
and funded opportunities, each with a plain-language "why this fits" and a
source link you can verify.

Built for the ML Empowerment Build Challenge.

## How it works

1. You fill in a short profile (free text plus a few optional fields).
2. The server sends that profile to an open-source model on OpenRouter, with
   a real web-search tool attached (backed by Tavily).
3. The model searches multiple times, reads the results, and picks the best
   3–6 matches.
4. Before anything reaches the screen, the server checks every match against
   the URLs that search actually returned this run. No real, verified source
   → the match is dropped. This is enforced in code, not just prompted for —
   see `sanitizeMatches` in `app/api/match/route.ts`.

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

Open [http://localhost:3000](http://localhost:3000).

## Notes on the model

The app requests `openrouter/free` — OpenRouter's own auto-router — rather
than a specific model ID. OpenRouter's free-model lineup rotates often
(models get added and pulled with little notice), so pinning one specific
`:free` model risked the app breaking mid-review. The auto-router picks
among free models that support tool calling, so this keeps working as the
underlying roster changes. If you want to pin a specific model instead, edit
the `MODEL` constant in `app/api/match/route.ts`.

## Deploying

Any Next.js host works (Vercel is the path of least resistance). Set the
same two environment variables in the host's dashboard — don't commit
`.env.local`, it's already gitignored.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · OpenRouter ·
Tavily Search API
