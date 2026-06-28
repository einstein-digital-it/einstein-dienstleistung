import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id } = await req.json();
    if (!booking_id) return Response.json({ error: 'Missing booking_id' }, { status: 400 });

    // Get booking with service role to verify ownership
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    // Verify the booking belongs to this customer
    if (booking.customer_email?.toLowerCase() !== user.email?.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow cancellation of pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return Response.json({ error: 'Cannot cancel this booking' }, { status: 400 });
    }

    // If there's a payment intent that's authorized, cancel it (refund)
    if (booking.payment_intent_id && booking.payment_status === 'authorized') {
      const stripeKey = (Deno.env.get("APIKEY") || "").trim().replace(/[\r\n]/g, "");
      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${booking.payment_intent_id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Stripe cancel error:', err);
      }
      await base44.asServiceRole.entities.Booking.update(booking_id, {
        status: 'cancelled',
        payment_status: 'refunded'
      });
    } else {
      await base44.asServiceRole.entities.Booking.update(booking_id, { status: 'cancelled' });
    }

    // Send notification to customer
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.customer_email,
        type: 'booking_cancelled',
        title_de: 'Buchung storniert',
        title_ar: 'تم إلغاء الحجز',
        title_en: 'Booking Cancelled',
        message_de: `Ihre Buchung ${booking.booking_number} wurde storniert.`,
        message_ar: `تم إلغاء حجزك ${booking.booking_number}.`,
        message_en: `Your booking ${booking.booking_number} has been cancelled.`,
        link: '/CustomerDashboard',
        booking_id: booking_id,
        is_read: false
      });
    } catch(e) {}

    return Response.json({ success: true });
  } catch (error) {
    console.error('cancelBooking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});