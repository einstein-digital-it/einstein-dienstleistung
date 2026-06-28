import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, date, time } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Fetch booking to verify ownership
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify customer owns this booking
    if (booking.customer_email?.toLowerCase() !== user.email?.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow editing pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return Response.json({ error: 'Cannot edit this booking' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.Booking.update(booking_id, { date, time });

    return Response.json({ success: true, booking: updated });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});