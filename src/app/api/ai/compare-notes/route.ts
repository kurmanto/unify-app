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

  const { note_ids } = (await request.json()) as { note_ids: string[] };
  if (!note_ids || note_ids.length < 2 || note_ids.length > 3) {
    return NextResponse.json(
      { error: "Provide 2–3 note IDs" },
      { status: 400 }
    );
  }

  // Fetch notes with appointment data
  const { data: notes, error } = await supabase
    .from("soap_notes")
    .select("*, appointment:appointments(starts_at, session_number, session_type:session_types(name))")
    .in("id", note_ids)
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !notes || notes.length < 2) {
    return NextResponse.json(
      { error: "Could not fetch notes" },
      { status: 404 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 500 }
    );
  }

  // Build comparison prompt
  const noteSummaries = notes.map((note, i) => {
    const apt = note.appointment as Record<string, unknown> | null;
    const sessionType = apt?.session_type as { name: string } | null;
    const date = apt?.starts_at
      ? new Date(apt.starts_at as string).toLocaleDateString("en-CA")
      : "Unknown date";

    return `--- Session ${i + 1}: ${sessionType?.name || "Session"} ${apt?.session_number ? `#${apt.session_number}` : ""} (${date}) ---
Subjective: ${note.subjective || "N/A"}
Objective: ${note.objective || "N/A"}
Assessment: ${note.assessment || "N/A"}
Plan: ${note.plan || "N/A"}
Techniques: ${(note.techniques_used as string[] | null)?.join(", ") || "N/A"}
Focus Areas: ${(note.focus_areas as { area: string }[] | null)?.map((fa) => fa.area).join(", ") || "N/A"}`;
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a clinical documentation assistant for a Rolfing Structural Integration practitioner. Compare the following ${notes.length} SOAP notes and provide a clinical comparison summary.

${noteSummaries.join("\n\n")}

Provide a JSON object with these fields:
- progress_patterns: Array of 2-4 sentences about observable progress trends
- recurring_issues: Array of 1-3 recurring client concerns or tissue findings
- technique_evolution: Array of 1-3 observations about how the treatment approach has evolved
- recommended_focus: Array of 2-3 suggestions for the next session focus

Write in professional clinical language. Be concise. Return ONLY the JSON object.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "AI comparison failed" },
      { status: 500 }
    );
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;
  if (!content) {
    return NextResponse.json(
      { error: "No AI response" },
      { status: 500 }
    );
  }

  try {
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const summary = JSON.parse(cleaned);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }
}
