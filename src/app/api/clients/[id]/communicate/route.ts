import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, buildAppointmentReminderEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, custom_message } = body as {
    type: "reminder" | "intake_request" | "follow_up";
    custom_message?: string;
  };

  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  let subject = "";
  let html = "";

  switch (type) {
    case "reminder": {
      // Find next upcoming appointment
      const { data: nextApt } = await supabase
        .from("appointments")
        .select("*, session_type:session_types(name)")
        .eq("client_id", id)
        .gte("starts_at", new Date().toISOString())
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true })
        .limit(1)
        .single();

      if (!nextApt) {
        return NextResponse.json(
          { error: "No upcoming appointment found" },
          { status: 400 }
        );
      }

      const sessionType = nextApt.session_type as { name: string } | null;
      const aptDate = new Date(nextApt.starts_at);
      const emailContent = buildAppointmentReminderEmail({
        clientName: client.first_name,
        sessionType: sessionType?.name || "Session",
        date: aptDate.toLocaleDateString("en-CA", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        time: aptDate.toLocaleTimeString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      subject = emailContent.subject;
      html = emailContent.html;
      break;
    }

    case "intake_request": {
      subject = "Please Complete Your Intake Forms";
      html = `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #000;">Intake Form Request</h2>
          <p>Hi ${client.first_name},</p>
          <p>To prepare for your upcoming session, please complete your intake forms at your earliest convenience.</p>
          <p>This helps us understand your health history and provide the best care possible.</p>
          ${custom_message ? `<p><em>${custom_message}</em></p>` : ""}
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — Unify Rolfing Structural Integration
          </p>
        </div>
      `;
      break;
    }

    case "follow_up": {
      subject = "Following Up on Your Session";
      html = `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #000;">Follow-Up</h2>
          <p>Hi ${client.first_name},</p>
          <p>${custom_message || "I wanted to check in and see how you're feeling after your recent session. Please don't hesitate to reach out if you have any questions or concerns."}</p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — Unify Rolfing Structural Integration
          </p>
        </div>
      `;
      break;
    }

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const result = await sendEmail({
      to: client.email,
      subject,
      html,
    });

    // Record communication
    await supabase.from("client_communications").insert({
      client_id: id,
      practitioner_id: user.id,
      type,
      subject,
      body_html: html,
      status: "sent",
      resend_message_id: result?.id || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Record failed communication
    await supabase.from("client_communications").insert({
      client_id: id,
      practitioner_id: user.id,
      type,
      subject,
      body_html: html,
      status: "failed",
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
