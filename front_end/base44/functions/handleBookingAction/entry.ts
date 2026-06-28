import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        // Read body first before creating client (body can only be read once)
        const body = await req.json();
        const { bookingId, action } = body;

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!bookingId || !action) {
            return Response.json({ error: 'Missing bookingId or action' }, { status: 400 });
        }

        if (action === 'accept') {
            const email = user.email?.toLowerCase()?.trim();
            const allProviders = await base44.asServiceRole.entities.ServiceProvider.list();
            const provider = allProviders.find(p =>
                p.email?.toLowerCase()?.trim() === email ||
                p.created_by?.toLowerCase()?.trim() === email
            );

            if (!provider) {
                return Response.json({ error: 'Provider profile not found' }, { status: 404 });
            }

            const updateData = {
                status: 'confirmed',
                provider_id: provider.id,
                provider_name: provider.full_name,
                confirmed_by_provider_id: provider.id,
                confirmed_by_provider_name: provider.full_name,
                confirmed_by_provider_email: provider.email,
                confirmed_at: new Date().toISOString()
            };

            const updated = await base44.asServiceRole.entities.Booking.update(bookingId, updateData);
            console.log('Updated booking:', { bookingId, provider_id: provider.id, updated });

            return Response.json({ success: true, action: 'accepted', booking: updated });

        } else if (action === 'decline') {
            await base44.asServiceRole.entities.Booking.update(bookingId, {
                status: 'cancelled'
            });

            return Response.json({ success: true, action: 'declined' });

        } else if (action === 'complete') {
            await base44.asServiceRole.entities.Booking.update(bookingId, {
                status: 'completed'
            });

            return Response.json({ success: true, action: 'completed' });

        } else {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});