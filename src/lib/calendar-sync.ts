// Google Calendar sync utility functions
// OAuth flow and token management would be implemented here

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: { email: string }[];
}

export function buildCalendarEvent(params: {
  clientName: string;
  sessionType: string;
  startsAt: string;
  endsAt: string;
  clientEmail?: string;
  notes?: string;
}): CalendarEvent {
  return {
    summary: `${params.sessionType} - ${params.clientName}`,
    description: params.notes || `Rolfing session with ${params.clientName}`,
    start: params.startsAt,
    end: params.endsAt,
    attendees: params.clientEmail
      ? [{ email: params.clientEmail }]
      : undefined,
  };
}
