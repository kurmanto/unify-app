// Resend email utility functions

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@unifyrolfing.com";

  if (!apiKey) {
    throw new Error("Resend API key not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return response.json();
}

export function buildAppointmentConfirmationEmail(params: {
  clientName: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  price?: string;
}): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed — ${params.sessionType}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #000;">Booking Confirmed</h2>
        <p>Hi ${params.clientName},</p>
        <p>Your session has been confirmed:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Session:</strong> ${params.sessionType}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${params.date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${params.time}</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${params.duration} minutes</p>
          ${params.price ? `<p style="margin: 4px 0;"><strong>Price:</strong> ${params.price} + HST</p>` : ""}
        </div>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          — Unify Rolfing Structural Integration
        </p>
      </div>
    `,
  };
}

export function buildAppointmentReminderEmail(params: {
  clientName: string;
  sessionType: string;
  date: string;
  time: string;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: ${params.sessionType} Tomorrow`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #000;">Session Reminder</h2>
        <p>Hi ${params.clientName},</p>
        <p>This is a friendly reminder about your upcoming session:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Session:</strong> ${params.sessionType}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${params.date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${params.time}</p>
        </div>
        <p>Please wear comfortable clothing. We look forward to seeing you!</p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          — Unify Rolfing Structural Integration
        </p>
      </div>
    `,
  };
}
