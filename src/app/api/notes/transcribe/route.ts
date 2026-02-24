import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramApiKey) {
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 500 }
    );
  }

  // Send to Deepgram for transcription
  const audioBuffer = await audioFile.arrayBuffer();

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&paragraphs=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        "Content-Type": audioFile.type || "audio/webm",
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `Transcription failed: ${errorText}` },
      { status: 500 }
    );
  }

  const result = await response.json();
  const transcript =
    result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

  // Optionally structure the transcript into SOAP format using AI
  let structuredNote = null;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicApiKey && transcript) {
    const sessionContext = formData.get("session_context") as string;

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are a clinical documentation assistant for a Rolfing Structural Integration practitioner. Structure the following voice dictation into SOAP note format.

${sessionContext ? `Session context: ${sessionContext}` : ""}

Voice dictation transcript:
${transcript}

Return a JSON object with these fields:
- subjective: Client's reported symptoms, concerns, experience
- objective: Practitioner's observations and findings
- assessment: Clinical assessment
- plan: Treatment plan and follow-up

Return ONLY the JSON object, no other text.`,
          },
        ],
      }),
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      const content = aiResult.content?.[0]?.text;
      if (content) {
        try {
          structuredNote = JSON.parse(content);
        } catch {
          // If parsing fails, just use the raw transcript
        }
      }
    }
  }

  return NextResponse.json({
    transcript,
    structured_note: structuredNote,
  });
}
