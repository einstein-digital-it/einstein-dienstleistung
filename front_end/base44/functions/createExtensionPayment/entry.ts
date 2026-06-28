import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { extension_id } = await req.json();

    if (!extension_id) {
      return Response.json({ error: 'Missing extension_id' }, { status: 400 });
    }

    // Get extension record
    const extensions = await base44.entities.ServiceExtension.filter({ id: extension_id });
    const extension = extensions?.[0];

    if (!extension) {
      return Response.json({ error: 'Extension not found' }, { status: 404 });
    }

    const amount = extension.amount || 15;
    const totalWithVat = amount * 1.19; // 15€ + 19% VAT

    const stripeKey = (Deno.env.get("APIKEY") || "").trim().replace(/[\r\n]/g, "");

    const params = new URLSearchParams();
    params.append("amount", String(Math.round(totalWithVat * 100)));
    params.append("currency", "eur");
    params.append("capture_method", "manual");
    params.append("payment_method_types[]", "card");
    params.append("metadata[extension_id]", extension_id);
    params.append("metadata[booking_id]", extension.booking_id || "");
    params.append("metadata[customer_email]", user.email);
    params.append("receipt_email", user.email);
    params.append("description", `EinStein - Antrag Erweiterung (${extension.booking_number || extension.booking_id})`);

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

    // Update extension with payment intent id
    await base44.entities.ServiceExtension.update(extension_id, {
      payment_intent_id: paymentIntent.id
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalWithVat
    });

  } catch (error) {
    console.error('Extension payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});