import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.email?.toLowerCase()?.trim();

        // Use service role to bypass RLS
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email: email });
        const provider = providers?.[0] || null;

        return Response.json({ provider });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});