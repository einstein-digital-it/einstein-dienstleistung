import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email.toLowerCase();

    // Fetch all bookings via service role, then filter by customer_email (case-insensitive)
    const allBookings = await base44.asServiceRole.entities.Booking.list("-created_date", 1000);

    const myBookings = allBookings.filter(b =>
        b.customer_email && b.customer_email.toLowerCase() === userEmail
    );

    return Response.json(myBookings);
});