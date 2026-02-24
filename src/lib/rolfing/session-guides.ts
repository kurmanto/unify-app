import { TEN_SERIES, type TenSeriesSession } from "./ten-series";

export interface ClientSessionPrep {
  session_number: number;
  session_name: string;
  what_to_expect: string;
  what_to_wear: string;
  post_session: string;
}

export function getClientSessionPrep(
  sessionNumber: number
): ClientSessionPrep | null {
  const session = TEN_SERIES.find((s) => s.session === sessionNumber);
  if (!session) return null;

  return {
    session_number: session.session,
    session_name: session.name,
    what_to_expect: session.client_description,
    what_to_wear:
      "Please wear comfortable underwear or loose shorts. Sports bras are fine for women. You'll be draped appropriately throughout the session.",
    post_session: session.post_session_guidance,
  };
}

export function generatePreSessionBriefing(
  session: TenSeriesSession,
  previousNotes?: string[]
): string {
  let briefing = `## Session ${session.session}: ${session.name}\n`;
  briefing += `**Phase:** ${session.phase}\n\n`;
  briefing += `### Focus Areas\n`;
  briefing += session.focus_areas.map((a) => `- ${a}`).join("\n") + "\n\n";
  briefing += `### Goals\n`;
  briefing += session.goals.map((g) => `- ${g}`).join("\n") + "\n\n";
  briefing += `### Suggested Techniques\n`;
  briefing += session.techniques.map((t) => `- ${t}`).join("\n") + "\n\n";

  if (previousNotes && previousNotes.length > 0) {
    briefing += `### Previous Session Notes\n`;
    previousNotes.forEach((note, i) => {
      briefing += `**Session ${i + 1}:** ${note}\n\n`;
    });
  }

  briefing += `### Philosophy\n${session.philosophy}\n`;

  return briefing;
}
