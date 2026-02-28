import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionGuide } from "@/lib/rolfing/ten-series";
import type { PreSessionBriefing } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointment_id } = await request.json();
  if (!appointment_id) {
    return NextResponse.json({ error: "appointment_id required" }, { status: 400 });
  }

  // Fetch appointment with relations
  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, client:clients(*), session_type:session_types(*)")
    .eq("id", appointment_id)
    .single();

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const client = appointment.client as Record<string, unknown> | null;
  const clientId = appointment.client_id;

  // Fetch previous SOAP notes for this client
  const { data: previousNotes } = await supabase
    .from("soap_notes")
    .select("*, appointment:appointments(starts_at, session_number)")
    .eq("practitioner_id", user.id)
    .eq("appointment_id", appointment_id)
    .neq("appointment_id", appointment_id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Actually fetch by client_id via appointments
  const { data: clientNotes } = await supabase
    .from("soap_notes")
    .select("subjective, objective, assessment, plan, techniques_used, focus_areas, session_goals, appointment:appointments!inner(starts_at, session_number, client_id)")
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Filter to this client's notes
  const clientPreviousNotes = (clientNotes || []).filter((note) => {
    const apt = note.appointment as unknown as Record<string, unknown> | null;
    return apt?.client_id === clientId;
  });

  // Get Ten Series guide if applicable
  const sessionGuide = appointment.session_number
    ? getSessionGuide(appointment.session_number)
    : null;

  // Build static briefing
  const lastNote = clientPreviousNotes[0] || null;
  const briefing: PreSessionBriefing = {
    last_session_plan: lastNote?.plan || null,
    client_concerns: [],
    ten_series_guide: sessionGuide
      ? {
          session: sessionGuide.session,
          name: sessionGuide.name,
          goals: sessionGuide.goals,
          focus_areas: sessionGuide.focus_areas,
          techniques: sessionGuide.techniques,
          philosophy: sessionGuide.philosophy,
        }
      : null,
    recommended_techniques: sessionGuide?.techniques || [],
    follow_up_areas: lastNote?.focus_areas
      ? (lastNote.focus_areas as { area: string; notes: string }[]).map((fa) => fa.area)
      : [],
    ai_briefing: null,
  };

  // Extract concerns from recent subjective notes
  if (clientPreviousNotes.length > 0) {
    const recentSubjective = clientPreviousNotes
      .slice(0, 3)
      .map((n) => n.subjective)
      .filter(Boolean);
    if (recentSubjective.length > 0) {
      briefing.client_concerns = recentSubjective as string[];
    }
  }

  // Try to generate AI briefing if Claude is available
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicApiKey && clientPreviousNotes.length > 0) {
    try {
      const healthHistory = client?.health_history as Record<string, unknown> | null;
      const noteSummaries = clientPreviousNotes.slice(0, 5).map((n, i) => {
        const apt = n.appointment as unknown as Record<string, unknown> | null;
        return `Session ${apt?.session_number || "?"} — S: ${n.subjective || "N/A"} | A: ${n.assessment || "N/A"} | P: ${n.plan || "N/A"}`;
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicApiKey,
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `You are a clinical assistant for a Rolfing Structural Integration practitioner. Generate a brief pre-session briefing.

Client: ${client?.first_name} ${client?.last_name}
${healthHistory ? `Health history: ${JSON.stringify(healthHistory)}` : ""}
${sessionGuide ? `This is Session ${sessionGuide.session} (${sessionGuide.name}) of the Ten Series.\nSession goals: ${sessionGuide.goals.join(", ")}` : ""}

Recent session notes (most recent first):
${noteSummaries.join("\n")}

Write a concise 2-3 sentence briefing highlighting: what to pay attention to, areas to follow up on, and any recommended focus for today's session. Be specific and clinical.`,
            },
          ],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        briefing.ai_briefing = result.content?.[0]?.text || null;
      }
    } catch {
      // AI briefing is optional — fail silently
    }
  }

  return NextResponse.json(briefing);
}
