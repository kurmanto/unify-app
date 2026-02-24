import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If sending, fetch recipients and send via Resend
  if (body.action === "send") {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@unifyrolfing.com";

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Resend not configured" },
        { status: 500 }
      );
    }

    // Get the campaign
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", body.campaign_id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get target clients
    let clientQuery = supabase.from("clients").select("id, email, first_name");
    if (campaign.segment_tags.length > 0) {
      clientQuery = clientQuery.overlaps("tags", campaign.segment_tags);
    }
    const { data: clients } = await clientQuery;

    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: "No matching clients" }, { status: 400 });
    }

    // Update campaign status
    await supabase
      .from("campaigns")
      .update({ status: "sending" })
      .eq("id", campaign.id);

    // Send emails via Resend
    for (const client of clients) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: client.email,
          subject: campaign.subject,
          html: campaign.body_html.replace("{{first_name}}", client.first_name),
        }),
      });

      const sentAt = response.ok ? new Date().toISOString() : null;

      await supabase.from("campaign_recipients").insert({
        campaign_id: campaign.id,
        client_id: client.id,
        sent_at: sentAt,
      });
    }

    // Mark as sent
    await supabase
      .from("campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaign.id);

    return NextResponse.json({ sent: clients.length });
  }

  // Create new campaign
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...body, practitioner_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
