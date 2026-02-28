// AI-powered SOAP note generation

import type { AiSoapSuggestions } from "@/types";

export interface SoapNoteStructured {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export async function generateSoapNote(params: {
  transcript: string;
  sessionNumber?: number;
  sessionName?: string;
  clientHistory?: string;
  previousNotes?: string;
  tenSeriesGuide?: {
    goals: string[];
    focus_areas: string[];
    techniques: string[];
    philosophy: string;
  };
  recordingMode?: "dictation" | "live_intake";
}): Promise<AiSoapSuggestions | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const contextParts: string[] = [];
  if (params.sessionNumber) {
    contextParts.push(
      `This is Session ${params.sessionNumber}${params.sessionName ? ` (${params.sessionName})` : ""} of the Rolfing Ten Series.`
    );
  }
  if (params.tenSeriesGuide) {
    contextParts.push(`Session goals: ${params.tenSeriesGuide.goals.join(", ")}`);
    contextParts.push(`Recommended focus areas: ${params.tenSeriesGuide.focus_areas.join(", ")}`);
    contextParts.push(`Suggested techniques: ${params.tenSeriesGuide.techniques.join(", ")}`);
  }
  if (params.clientHistory) {
    contextParts.push(`Client health history: ${params.clientHistory}`);
  }
  if (params.previousNotes) {
    contextParts.push(`Previous session notes: ${params.previousNotes}`);
  }
  if (params.recordingMode) {
    contextParts.push(
      params.recordingMode === "live_intake"
        ? "This is a live intake recording (practitioner-client conversation). Extract both reported symptoms and clinical observations."
        : "This is a post-session dictation by the practitioner. Structure as clinical documentation."
    );
  }

  const context = contextParts.join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: `You are a clinical documentation assistant for a Rolfing Structural Integration practitioner. Structure the following voice dictation into a SOAP note with additional session details.

${context ? `Context:\n${context}\n\n` : ""}Voice dictation transcript:
${params.transcript}

Return a JSON object with these exact fields:
- subjective: Client's reported symptoms, concerns, experience (what the client told the practitioner)
- objective: Practitioner's observations, physical findings, tissue quality, posture assessment (what was found)
- assessment: Clinical assessment and interpretation of findings, progress toward goals
- plan: Treatment plan, follow-up recommendations, home care instructions, next session focus
- techniques: Array of technique names used (from: Broad Fascial Spreading, Myofascial Release, Cross-Fiber Work, Deep Tissue, Visceral Mobilization, Cranial Work, Intraoral Work, Nerve Mobilization, Joint Mobilization, Movement Education, Diaphragm Release, Psoas Release)
- focus_areas: Array of body regions worked on (from: head, jaw, neck, shoulders, chest, upper_back, mid_back, lower_back, arms, forearms, hands, abdomen, pelvis, hips, sacrum, glutes, upper_legs, knees, lower_legs, ankles, feet, it_band, inner_legs, side_body)
- session_goals: Array of session goals achieved or addressed

Write in professional clinical language. Be thorough but concise. Return ONLY the JSON object.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI generation failed: ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) return null;

  try {
    // Handle potential markdown code blocks in response
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as AiSoapSuggestions;
  } catch {
    return null;
  }
}
