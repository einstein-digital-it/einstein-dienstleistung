import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.email?.toLowerCase()?.trim();
        console.log('getProviderBookings - user email:', email);

        // Get all providers using service role to bypass RLS
        const allProviders = await base44.asServiceRole.entities.ServiceProvider.list();
        console.log('getProviderBookings - total providers:', allProviders.length);
        console.log('getProviderBookings - provider emails:', allProviders.map(p => p.email));

        // Match by email OR created_by
        const provider = allProviders.find(p => 
            p.email?.toLowerCase()?.trim() === email ||
            p.created_by?.toLowerCase()?.trim() === email
        );

        console.log('getProviderBookings - matched provider:', provider?.id, provider?.email, provider?.status);

        if (!provider) {
            return Response.json({ provider: null, bookings: [] });
        }

        // Get ALL bookings using service role (bypasses RLS)
        let allBookings = [];
        try {
            allBookings = await base44.asServiceRole.entities.Booking.list('-created_date', 500);
        } catch (err) {
            console.error('Error listing bookings:', err.message);
            allBookings = [];
        }
        console.log('getProviderBookings - total bookings:', allBookings.length);

        const relevant = allBookings.filter(b => {
            if (b.provider_id === provider.id) return true;
            if (b.confirmed_by_provider_email?.toLowerCase() === provider.email?.toLowerCase()) return true;
            if (b.confirmed_by_provider_id === provider.id) return true;
            // Open pending bookings (not yet assigned to anyone)
            if (b.status === 'pending' && !b.provider_id && !b.confirmed_by_provider_id) return true;
            return false;
        });

        // Deduplicate
        const seen = new Set();
        const unique = relevant.filter(b => {
            if (seen.has(b.id)) return false;
            seen.add(b.id);
            return true;
        });

        console.log('getProviderBookings - relevant bookings:', unique.length);

        return Response.json({ 
            provider, 
            bookings: unique,
            success: true
        });
    } catch (error) {
        console.error('getProviderBookings error:', error.message, error.stack);
        return Response.json({ error: error.message }, { status: 500 });
    }
});