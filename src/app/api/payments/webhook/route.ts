import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // In production, verify the webhook signature using stripe.webhooks.constructEvent
  // For now, parse the event directly
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Use service role key for webhook processing (no user session)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await supabase
        .from("payments")
        .update({
          status: "succeeded",
          card_last_four: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || null,
        })
        .eq("processor_payment_id", paymentIntent.id);

      // Update appointment payment status
      if (paymentIntent.metadata?.appointment_id) {
        await supabase
          .from("appointments")
          .update({ payment_status: "paid" })
          .eq("id", paymentIntent.metadata.appointment_id);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const failedIntent = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("processor_payment_id", failedIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
