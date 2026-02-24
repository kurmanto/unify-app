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

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { appointment_id, client_id, amount_cents, tax_cents } = body;

  // Create a Stripe PaymentIntent
  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: String(amount_cents + tax_cents),
      currency: "cad",
      "metadata[appointment_id]": appointment_id || "",
      "metadata[client_id]": client_id,
      "metadata[practitioner_id]": user.id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.error?.message || "Stripe error" },
      { status: 500 }
    );
  }

  const paymentIntent = await response.json();

  // Record payment in our database
  const { error: dbError } = await supabase.from("payments").insert({
    appointment_id: appointment_id || null,
    client_id,
    practitioner_id: user.id,
    amount_cents,
    tax_cents,
    currency: "CAD",
    processor: "stripe",
    processor_payment_id: paymentIntent.id,
    status: "pending",
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
  });
}
