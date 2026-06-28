import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bookingId } = await req.json();
  if (!bookingId) {
    return Response.json({ error: 'bookingId required' }, { status: 400 });
  }

  const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
  const booking = bookings[0];

  if (!booking) {
    return Response.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.payment_status !== 'unpaid' && booking.payment_status !== 'failed') {
    return Response.json({ error: 'Can only delete unpaid or failed bookings' }, { status: 400 });
  }

  // Cancel Stripe PaymentIntent if exists
  if (booking.payment_intent_id) {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("APIKEY");
    if (stripeKey) {
      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${booking.payment_intent_id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (!res.ok) {
        const err = await res.json();
        // If already cancelled or doesn't exist, continue with deletion
        if (err?.error?.code !== 'payment_intent_unexpected_state' && err?.error?.code !== 'resource_missing') {
          console.error('Stripe cancel error:', err);
        }
      }
    }
  }

  await base44.asServiceRole.entities.Booking.delete(bookingId);

  return Response.json({ success: true });
});