// AI-powered SOAP note generation

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
}): Promise<SoapNoteStructured | null> {
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
  if (params.clientHistory) {
    contextParts.push(`Client history: ${params.clientHistory}`);
  }
  if (params.previousNotes) {
    contextParts.push(`Previous session notes: ${params.previousNotes}`);
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
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a clinical documentation assistant for a Rolfing Structural Integration practitioner. Structure the following voice dictation into a SOAP note.

${context ? `Context:\n${context}\n\n` : ""}Voice dictation transcript:
${params.transcript}

Return a JSON object with these exact fields:
- subjective: Client's reported symptoms, concerns, experience (what the client told you)
- objective: Practitioner's observations, physical findings, assessments (what you found)
- assessment: Clinical assessment and interpretation of findings
- plan: Treatment plan, follow-up recommendations, home care instructions

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
    return JSON.parse(content) as SoapNoteStructured;
  } catch {
    return null;
  }
}
