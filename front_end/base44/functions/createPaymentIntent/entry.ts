import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, amount } = await req.json();

    if (!booking_id || !amount) {
      return Response.json({ error: 'Missing booking_id or amount' }, { status: 400 });
    }

    // Get booking details
    let booking;
    try {
      booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    } catch (e) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const stripeKey = (Deno.env.get("APIKEY") || "").trim().replace(/[\r\n]/g, "");

    // Create payment intent via Stripe REST API directly (no SDK to avoid cold start issues)
    const params = new URLSearchParams();
    params.append("amount", String(Math.round(amount * 100)));
    params.append("currency", "eur");
    params.append("capture_method", "manual");
    params.append("payment_method_types[]", "card");
    params.append("payment_method_types[]", "klarna");
    params.append("payment_method_options[klarna][preferred_locale]", "de-DE");
    params.append("metadata[booking_id]", booking_id);
    params.append("metadata[booking_number]", booking.booking_number || "");
    params.append("metadata[customer_email]", booking.customer_email || "");
    params.append("receipt_email", booking.customer_email || "");
    params.append("description", `EinStein Institut - ${booking.service_name || booking.category || ""}`);

    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!stripeRes.ok) {
      const errData = await stripeRes.json();
      return Response.json({ error: errData?.error?.message || "Stripe error" }, { status: 500 });
    }

    const paymentIntent = await stripeRes.json();

    // Update booking with payment intent
    await base44.asServiceRole.entities.Booking.update(booking_id, {
      payment_intent_id: paymentIntent.id
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
});