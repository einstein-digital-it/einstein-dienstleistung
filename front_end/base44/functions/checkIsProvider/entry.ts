import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ isProvider: false }, { status: 200 });
        }

        const email = user.email?.toLowerCase()?.trim();
        
        // Use service role to bypass RLS and find provider by email
        const allProviders = await base44.asServiceRole.entities.ServiceProvider.list();
        const providerEmails = allProviders.map(p => p.email?.toLowerCase()?.trim());
        const matchedProvider = allProviders.find(p => p.email?.toLowerCase()?.trim() === email);
        const isProvider = !!matchedProvider;
        
        console.log('checkIsProvider - user email:', email);
        console.log('checkIsProvider - all provider emails:', providerEmails);
        console.log('checkIsProvider - matched:', isProvider, 'status:', matchedProvider?.status);
        
        return Response.json({ isProvider, email, providerStatus: matchedProvider?.status || null });
    } catch (error) {
        return Response.json({ isProvider: false, error: error.message }, { status: 200 });
    }
});