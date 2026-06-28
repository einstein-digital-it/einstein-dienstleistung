import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { provider_id, action } = await req.json();

        if (!provider_id || !['approve', 'reject'].includes(action)) {
            return Response.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Get provider details
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ id: provider_id });
        const provider = providers[0];
        
        if (!provider) {
            return Response.json({ error: 'Provider not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Update provider status to approved first
            await base44.asServiceRole.entities.ServiceProvider.update(provider_id, {
                status: 'approved'
            });

            // Try to invite User account
            try {
                await base44.users.inviteUser(provider.email, 'user');
                console.log('User invite sent to:', provider.email);
            } catch (e) {
                console.log('User invite sent or already exists:', e.message);
            }

            // Send detailed welcome email via sendWelcomeEmail function
            try {
                const providerLang = provider.notes || 'de'; // notes field stores the language
                await base44.asServiceRole.functions.invoke('sendWelcomeEmail', {
                    provider_email: provider.email,
                    provider_name: provider.full_name,
                    provider_lang: providerLang,
                    automation_key: Deno.env.get("BASE44_APP_ID")
                });
                console.log('Welcome email sent to:', provider.email);
            } catch (e) {
                console.error('Error sending welcome email:', e.message);
                // Fallback: send basic email
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: provider.email,
                    subject: '🎉 تم قبول طلب التسجيل | Your Application Has Been Approved',
                    body: `تم قبول طلبك ليصبح مزود خدمة في آينشتاين.\nYour application to become a service provider at EinStein has been approved.\n\nيمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني.\nYou can now login with your email.\n\n🌐 https://institut.einsteindienstleistung.de`
                });
            }

            return Response.json({ success: true, message: 'Provider approved' });
        } else {
            // Update provider status to rejected
            await base44.asServiceRole.entities.ServiceProvider.update(provider_id, {
                status: 'rejected'
            });

            // Send rejection email
            await base44.integrations.Core.SendEmail({
                to: provider.email,
                subject: 'تم رفض طلب التسجيل | Your Application Has Been Rejected',
                body: `للأسف، تم رفض طلبك ليصبح مزود خدمة.\nUnfortunately, your application to become a service provider has been rejected.`
            });

            return Response.json({ success: true, message: 'Provider rejected' });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});