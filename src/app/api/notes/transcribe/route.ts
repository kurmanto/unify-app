import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSoapNote } from "@/lib/ai/soap-generator";
import { getSessionGuide } from "@/lib/rolfing/ten-series";
import type { TranscriptWord } from "@/types";

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
  const appointmentId = formData.get("appointment_id") as string | null;
  const clientId = formData.get("client_id") as string | null;
  const sessionNumber = formData.get("session_number") as string | null;
  const recordingMode = formData.get("recording_mode") as string | null;

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

  // Send to Deepgram with utterances for word-level timestamps
  const audioBuffer = await audioFile.arrayBuffer();

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&paragraphs=true&utterances=true",
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

  // Extract word-level timestamps
  const rawWords = result.results?.channels?.[0]?.alternatives?.[0]?.words || [];
  const words: TranscriptWord[] = rawWords.map(
    (w: { word: string; start: number; end: number; confidence: number }) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      confidence: w.confidence,
    })
  );

  // Fetch context for AI structuring
  let previousNoteSummary: string | undefined;
  let sessionGuide: ReturnType<typeof getSessionGuide> | undefined;
  let clientHistory: string | undefined;

  if (clientId) {
    // Fetch previous notes for this client
    const { data: prevNotes } = await supabase
      .from("soap_notes")
      .select("subjective, assessment, plan, appointment:appointments!inner(session_number, client_id)")
      .eq("practitioner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const clientNotes = (prevNotes || []).filter((n) => {
      const apt = n.appointment as unknown as Record<string, unknown> | null;
      return apt?.client_id === clientId;
    });

    if (clientNotes.length > 0) {
      previousNoteSummary = clientNotes
        .slice(0, 3)
        .map((n) => `S: ${n.subjective || "N/A"} | A: ${n.assessment || "N/A"} | P: ${n.plan || "N/A"}`)
        .join("\n");
    }

    // Fetch client health history
    const { data: client } = await supabase
      .from("clients")
      .select("health_history")
      .eq("id", clientId)
      .single();

    if (client?.health_history) {
      clientHistory = JSON.stringify(client.health_history);
    }
  }

  if (sessionNumber) {
    sessionGuide = getSessionGuide(parseInt(sessionNumber, 10));
  }

  // AI structuring
  let structuredNote = null;
  if (transcript) {
    try {
      structuredNote = await generateSoapNote({
        transcript,
        sessionNumber: sessionNumber ? parseInt(sessionNumber, 10) : undefined,
        sessionName: sessionGuide?.name,
        clientHistory,
        previousNotes: previousNoteSummary,
        tenSeriesGuide: sessionGuide
          ? {
              goals: sessionGuide.goals,
              focus_areas: sessionGuide.focus_areas,
              techniques: sessionGuide.techniques,
              philosophy: sessionGuide.philosophy,
            }
          : undefined,
        recordingMode: recordingMode as "dictation" | "live_intake" | undefined,
      });
    } catch {
      // AI structuring is optional — return transcript regardless
    }
  }

  // Optionally store audio in Supabase Storage
  let audioUrl: string | null = null;
  if (appointmentId) {
    try {
      const fileName = `soap-recordings/${user.id}/${appointmentId}-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, audioBuffer, {
          contentType: audioFile.type || "audio/webm",
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(fileName);
        audioUrl = urlData.publicUrl;
      }
    } catch {
      // Storage upload is optional
    }
  }

  return NextResponse.json({
    transcript,
    words,
    structured_note: structuredNote,
    audio_url: audioUrl,
  });
}
