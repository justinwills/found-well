import { NextRequest, NextResponse } from "next/server";
import type { StudentProfile, OpportunityMatch, SOPStrategy } from "@/lib/types";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

export const maxDuration = 60;

const MODEL = "openrouter/free";

const SOP_SYSTEM_PROMPT = `You are Foundwell's elite Academic Application Strategy Consultant.
Your mission is to generate a compelling, tailored Statement of Purpose (SOP) strategy blueprint for a student applying to a specific scholarship or funded program.

Analyze the student's background and the target opportunity. Craft a high-impact strategy that aligns the student's background with the specific values and objectives of the target scholarship (e.g. leadership for Chevening, research rigor for DAAD/NSF, ambassadorial impact for Fulbright, academic excellence for university awards).

Respond with ONLY a JSON object (no markdown, no prose wrapper) matching this exact shape:

{
  "targetProgram": "string — program name",
  "winningAngle": "string — 1-2 sentence core narrative hook/angle for this specific award",
  "recommendedTheme": "string — e.g. Leadership & Social Innovation / Applied AI for Climate Resilience",
  "essayOutline": {
    "hook": "string — opening paragraph angle & personal catalyst",
    "academicBackground": "string — paragraph 2 angle: linking past accomplishments & technical skills to program demands",
    "whyThisProgram": "string — paragraph 3 angle: specific courses, faculty, or values of this award",
    "futureImpact": "string — paragraph 4 angle: return-home impact or 5-year career vision"
  },
  "cvRecommendations": [
    "string — actionable CV tweak 1",
    "string — actionable CV tweak 2",
    "string — actionable CV tweak 3"
  ],
  "recommendationLetterTips": [
    "string — recommendation talking point 1",
    "string — recommendation talking point 2"
  ]
}`;

export async function POST(req: NextRequest) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    return NextResponse.json(
      { error: "Server is missing OPENROUTER_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { profile, match }: { profile?: StudentProfile; match?: OpportunityMatch } = body;

    if (!match || !match.name) {
      return NextResponse.json({ error: "Missing opportunity match details." }, { status: 400 });
    }

    const userPrompt = `Student Background:
- Description: ${profile?.about || "Not specified"}
- Nationality: ${profile?.country || "International"}
- Current Field: ${profile?.fieldOfStudy || "Not specified"}
- Target Degree: ${profile?.degreeLevel || "Graduate / Master's"}
- Target Country: ${profile?.targetCountry || "Any"}

Target Scholarship / Opportunity:
- Name: ${match.name}
- Organization: ${match.organization || "Academic Institution / Foundation"}
- Match Fit Notes: ${match.whyItFits}
- Funding Type: ${match.fundingType || "Fully Funded"}

Generate the SOP Strategy Blueprint now in JSON format.`;

    const res = await fetchWithRetry(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://foundwell.app",
          "X-Title": "Foundwell AI SOP Strategy",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SOP_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
        signal: req.signal,
      },
      2,
      1000,
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`SOP strategy: OpenRouter returned ${res.status}:`, errText.slice(0, 500));
      return NextResponse.json(
        { error: `The strategy service had a problem (${res.status}). Please try again.` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content ?? "";

    if (!rawText.trim()) {
      const fullResponseData = JSON.stringify(data, null, 2);
      console.error("SOP strategy: OpenRouter returned an empty response.", fullResponseData.slice(0, 1000));
      
      // Check for specific error patterns
      let userMessage = "No response came back from the strategy service. Please try again.";
      if (data.error?.message?.includes("quota")) {
        userMessage = "Service quota exceeded. Please try again later.";
      } else if (data.error?.message?.includes("authentication")) {
        userMessage = "Server authentication issue. Please try again.";
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: 502 },
      );
    }

    // Extract JSON from response
    let jsonText = rawText.trim();
    const fenced = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      jsonText = fenced[1].trim();
    } else {
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        jsonText = jsonText.slice(start, end + 1);
      }
    }

    let parsed: SOPStrategy;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      // The model responded, but not with valid JSON — a real failure, not
      // a network blip. Fail honestly rather than silently substituting
      // generic advice the user would mistake for a tailored result.
      console.error("SOP strategy: failed to parse model JSON:", e, "\nRaw text:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Couldn't read the strategy response. Please try again." },
        { status: 502 },
      );
    }

    // Sanity-check the shape actually matches what the UI expects. A model
    // can return syntactically valid JSON that's still missing fields.
    const hasRequiredShape =
      typeof parsed?.targetProgram === "string" &&
      typeof parsed?.winningAngle === "string" &&
      typeof parsed?.essayOutline?.hook === "string" &&
      Array.isArray(parsed?.cvRecommendations) &&
      Array.isArray(parsed?.recommendationLetterTips);

    if (!hasRequiredShape) {
      console.error("SOP strategy: model JSON parsed but missing required fields:", JSON.stringify(parsed).slice(0, 500));
      return NextResponse.json(
        { error: "The strategy response was incomplete. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed satisfies SOPStrategy);
  } catch (e) {
    // A genuine unexpected error (network failure reaching OpenRouter,
    // request body issues, etc). Return a real error — never silently swap
    // in identical generic advice a user could mistake for a tailored
    // result. If this keeps happening, it belongs in server logs, not
    // papered over.
    console.error("SOP strategy route error:", e);
    return NextResponse.json(
      { error: "Something went wrong while building the strategy. Please try again." },
      { status: 500 },
    );
  }
}
