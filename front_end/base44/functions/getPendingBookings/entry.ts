import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use service role to bypass RLS and get ALL pending unassigned bookings
        const allPending = await base44.asServiceRole.entities.Booking.filter({
            status: 'pending'
        }, '-created_date', 200);

        // Filter unassigned (no provider yet)
        const unassigned = allPending.filter(b => !b.provider_id && !b.confirmed_by_provider_id);

        return Response.json({ bookings: unassigned });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});