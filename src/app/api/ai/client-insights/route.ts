import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TEN_SERIES } from "@/lib/rolfing/ten-series";
import { TECHNIQUES } from "@/lib/rolfing/techniques";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { client_id } = (await request.json()) as { client_id: string };
  if (!client_id) {
    return NextResponse.json({ error: "client_id required" }, { status: 400 });
  }

  // Fetch all client data
  const [
    { data: client },
    { data: appointments },
    { data: series },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", client_id).single(),
    supabase
      .from("appointments")
      .select("*, session_type:session_types(name)")
      .eq("client_id", client_id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("series")
      .select("*")
      .eq("client_id", client_id)
      .order("started_at", { ascending: false }),
  ]);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Fetch SOAP notes
  const aptIds = (appointments || []).map((a) => a.id);
  let soapNotes: Array<Record<string, unknown>> = [];
  if (aptIds.length > 0) {
    const { data } = await supabase
      .from("soap_notes")
      .select("*")
      .in("appointment_id", aptIds)
      .order("created_at", { ascending: true });
    soapNotes = data || [];
  }

  // Check cache
  const { data: cached } = await supabase
    .from("ai_insight_cache")
    .select("*")
    .eq("client_id", client_id)
    .eq("practitioner_id", user.id)
    .single();

  if (cached && cached.soap_note_count === soapNotes.length && soapNotes.length > 0) {
    return NextResponse.json(cached.insights);
  }

  // Build prompt
  const activeSeries = (series || []).find((s) => s.status === "active");
  const nextSessionNum = activeSeries ? activeSeries.current_session + 1 : null;
  const nextSessionGuide = nextSessionNum
    ? TEN_SERIES.find((s) => s.session === nextSessionNum)
    : null;

  const healthHistory = client.health_history as Record<string, unknown> | null;

  const prompt = `You are an AI assistant for a Rolfing Structural Integration practitioner. Analyze the following client data and provide treatment insights.

CLIENT: ${client.first_name} ${client.last_name}

HEALTH HISTORY:
${healthHistory ? JSON.stringify(healthHistory, null, 2) : "None recorded"}

SERIES STATUS:
${activeSeries ? `Active Ten Series - currently on session ${activeSeries.current_session} of ${activeSeries.total_sessions}` : "No active series"}

${nextSessionGuide ? `NEXT SESSION GUIDE (Session ${nextSessionGuide.session}: ${nextSessionGuide.name}):
Phase: ${nextSessionGuide.phase}
Goals: ${nextSessionGuide.goals.join(", ")}
Focus Areas: ${nextSessionGuide.focus_areas.join(", ")}
Techniques: ${nextSessionGuide.techniques.join(", ")}
Philosophy: ${nextSessionGuide.philosophy}` : ""}

SOAP NOTES (chronological):
${soapNotes.map((n, i) => `Session ${i + 1}:
S: ${n.subjective || "N/A"}
O: ${n.objective || "N/A"}
A: ${n.assessment || "N/A"}
P: ${n.plan || "N/A"}
Focus: ${JSON.stringify(n.focus_areas || [])}
Techniques: ${JSON.stringify(n.techniques_used || [])}`).join("\n\n")}

AVAILABLE TECHNIQUES:
${TECHNIQUES.map((t) => `${t.name} (${t.category}): ${t.description}`).join("\n")}

Return a JSON object with:
- next_session_recommendations: string[] (3-5 specific recommendations for the next session)
- treatment_patterns: string[] (2-4 patterns observed across sessions)
- progress_summary: string (brief summary of overall progress)
- areas_of_concern: string[] (0-3 areas needing attention)
- body_area_frequency: Record<string, number> (body area name -> frequency count)
- pre_session_briefing: string (2-3 sentence briefing for the next session)

Return ONLY the JSON object.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 }
    );
  }

  try {
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
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in AI response");
    }

    const insights = JSON.parse(content);

    // Cache the result
    if (cached) {
      await supabase
        .from("ai_insight_cache")
        .update({
          insights,
          generated_at: new Date().toISOString(),
          soap_note_count: soapNotes.length,
        })
        .eq("id", cached.id);
    } else {
      await supabase.from("ai_insight_cache").insert({
        client_id,
        practitioner_id: user.id,
        insights,
        soap_note_count: soapNotes.length,
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate insights",
      },
      { status: 500 }
    );
  }
}
