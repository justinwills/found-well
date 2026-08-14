import { NextRequest, NextResponse } from "next/server";
import type { StudentProfile, OpportunityMatch, SOPStrategy } from "@/lib/types";

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

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `LLM API Error (${res.status}): ${errText.slice(0, 200)}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content ?? "";

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

    const parsed: SOPStrategy = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch {
    // Return a structured fallback if LLM parsing fails or openrouter returns non-JSON
    return NextResponse.json({
      targetProgram: "Target Opportunity Strategy",
      winningAngle: "Highlight your unique cross-cultural background and technical trajectory alignment with the host institution's strategic goals.",
      recommendedTheme: "Academic Excellence & Regional Social Impact",
      essayOutline: {
        hook: "Begin with a pivotal moment in your academic or professional journey that sparked your specialization in this field.",
        academicBackground: "Detail 2-3 key achievements, projects, or thesis work that prove your capability to excel in advanced coursework.",
        whyThisProgram: "Specify distinct research labs, faculty members, or curriculum modules unique to this scholarship's host organization.",
        futureImpact: "Articulate a clear 5-year vision demonstrating how this degree will empower you to solve challenges in your target sector."
      },
      cvRecommendations: [
        "Quantify project outcomes (e.g. 'Improved model accuracy by 14%', 'Managed $5K research budget').",
        "Place relevant publications, leadership roles, or honors in the top third of your resume.",
        "Add a dedicated 'Key Skills & Frameworks' section tailored to the program's requirements."
      ],
      recommendationLetterTips: [
        "Ask recommenders to speak to your initiative, analytical rigor, and resilience under deadline pressures.",
        "Provide your recommenders with a 1-page summary of your top achievements and your target SOP draft."
      ]
    });
  }
}
