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

  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
  const squareLocationId = process.env.SQUARE_LOCATION_ID;
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT || "sandbox";

  if (!squareAccessToken || !squareLocationId) {
    return NextResponse.json(
      { error: "Square not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { appointment_id, client_id, amount_cents, tax_cents } = body;

  const baseUrl =
    squareEnvironment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  // Create a Square payment
  const response = await fetch(`${baseUrl}/v2/payments`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      amount_money: {
        amount: amount_cents + tax_cents,
        currency: "CAD",
      },
      location_id: squareLocationId,
      source_id: body.source_id, // nonce from Square Web Payments SDK
      note: `Appointment: ${appointment_id || "N/A"}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      {
        error:
          error.errors?.[0]?.detail || "Square payment failed",
      },
      { status: 500 }
    );
  }

  const result = await response.json();
  const payment = result.payment;

  // Record payment in database
  const { error: dbError } = await supabase.from("payments").insert({
    appointment_id: appointment_id || null,
    client_id,
    practitioner_id: user.id,
    amount_cents,
    tax_cents,
    currency: "CAD",
    processor: "square",
    processor_payment_id: payment.id,
    status: payment.status === "COMPLETED" ? "succeeded" : "pending",
    card_last_four: payment.card_details?.card?.last_4 || null,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Update appointment payment status
  if (appointment_id && payment.status === "COMPLETED") {
    await supabase
      .from("appointments")
      .update({ payment_status: "paid" })
      .eq("id", appointment_id);
  }

  return NextResponse.json({
    payment_id: payment.id,
    status: payment.status,
  });
}
