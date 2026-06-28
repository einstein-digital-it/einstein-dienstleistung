import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, payment_intent_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Verify the payment intent status with Stripe
    const stripeKey = (Deno.env.get("APIKEY") || "").trim().replace(/[\r\n]/g, "");
    
    let paymentSucceeded = false;
    
    if (payment_intent_id) {
      const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${payment_intent_id}`, {
        headers: { "Authorization": `Bearer ${stripeKey}` }
      });
      
      if (stripeRes.ok) {
        const pi = await stripeRes.json();
        paymentSucceeded = pi.status === 'succeeded';
      }
    }

    if (!paymentSucceeded) {
      return Response.json({ error: 'Payment not confirmed by Stripe' }, { status: 400 });
    }

    // Update booking status as service role
    await base44.asServiceRole.entities.Booking.update(booking_id, {
      payment_status: 'paid',
      status: 'confirmed',
      payment_intent_id: payment_intent_id
    });

    // Generate invoice
    let invoice_url = null;
    try {
      const invoiceRes = await base44.asServiceRole.functions.invoke('generateInvoice', { bookingId: booking_id });
      invoice_url = invoiceRes?.invoice_url;
    } catch (e) {
      console.error('Invoice generation failed:', e.message);
    }

    return Response.json({ success: true, invoice_url });

  } catch (error) {
    console.error('Confirm payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});