import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // This is a scheduled job, so we use service role
        const bookings = await base44.asServiceRole.entities.Booking.filter({
            status: 'confirmed'
        });

        const notifications = [];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // Find bookings scheduled for tomorrow
        for (const booking of bookings) {
            if (!booking.date) continue;
            
            const bookingDate = new Date(booking.date);
            bookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDate.getTime() === tomorrow.getTime()) {
                // Notify customer
                notifications.push({
                    user_email: booking.customer_email,
                    type: 'booking_reminder',
                    title_en: 'Appointment Tomorrow',
                    title_ar: 'موعد غداً',
                    title_de: 'Termin morgen',
                    message_en: `Your ${booking.service_name} appointment with ${booking.confirmed_by_provider_name || 'provider'} is scheduled for tomorrow at ${booking.time}`,
                    message_ar: `موعدك لـ ${booking.service_name} مع ${booking.confirmed_by_provider_name || 'المزود'} غداً الساعة ${booking.time}`,
                    message_de: `Ihr ${booking.service_name} Termin mit ${booking.confirmed_by_provider_name || 'Anbieter'} ist für morgen um ${booking.time} geplant`,
                    booking_id: booking.id,
                    link: `/customer-dashboard`
                });

                // Notify provider
                if (booking.confirmed_by_provider_email) {
                    notifications.push({
                        user_email: booking.confirmed_by_provider_email,
                        type: 'booking_reminder',
                        title_en: 'Appointment Tomorrow',
                        title_ar: 'موعد غداً',
                        title_de: 'Termin morgen',
                        message_en: `You have a confirmed appointment with ${booking.customer_name} for ${booking.service_name} tomorrow at ${booking.time}`,
                        message_ar: `لديك موعد مؤكد مع ${booking.customer_name} لـ ${booking.service_name} غداً الساعة ${booking.time}`,
                        message_de: `Sie haben einen bestätigten Termin mit ${booking.customer_name} für ${booking.service_name} morgen um ${booking.time}`,
                        booking_id: booking.id,
                        link: `/provider-dashboard`
                    });
                }
            }
        }

        // Bulk create reminders
        if (notifications.length > 0) {
            await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
        }

        return Response.json({ 
            success: true, 
            reminders_sent: notifications.length 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});