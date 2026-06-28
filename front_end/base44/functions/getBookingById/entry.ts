import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Use service role to bypass RLS - anyone with the booking ID can view it
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    return Response.json(booking);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});