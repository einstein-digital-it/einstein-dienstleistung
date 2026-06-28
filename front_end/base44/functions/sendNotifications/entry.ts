import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { event } = await req.json();
        const { type, entity_name, entity_id } = event;

        if (entity_name !== 'Booking') {
            return Response.json({ success: false, message: 'Only booking events supported' });
        }

        const booking = await base44.asServiceRole.entities.Booking.get(entity_id);
        if (!booking) {
            return Response.json({ success: false, message: 'Booking not found' });
        }

        const notifications = [];

        if (type === 'create') {
            // New booking request - notify all approved providers for that category
            const providers = await base44.asServiceRole.entities.ServiceProvider.filter({
                status: 'approved',
                categories: { $in: [booking.category] }
            });

            for (const provider of providers) {
                notifications.push({
                    user_email: provider.email,
                    type: 'new_booking_request',
                    title_en: `New ${booking.service_name} Request`,
                    title_ar: `طلب جديد: ${booking.service_name}`,
                    title_de: `Neue Anfrage: ${booking.service_name}`,
                    message_en: `Customer ${booking.customer_name} needs help with ${booking.service_name}`,
                    message_ar: `العميل ${booking.customer_name} يطلب خدمة ${booking.service_name}`,
                    message_de: `Kunde ${booking.customer_name} benötigt ${booking.service_name}`,
                    booking_id: booking.id,
                    link: `/customer-requests`
                });
            }

            // Notify customer that request was created
            notifications.push({
                user_email: booking.customer_email,
                type: 'general',
                title_en: 'Booking Received',
                title_ar: 'تم استقبال طلبك',
                title_de: 'Anfrage erhalten',
                message_en: `Your booking request for ${booking.service_name} has been received`,
                message_ar: `تم استقبال طلب خدمة ${booking.service_name}`,
                message_de: `Ihre Anfrage für ${booking.service_name} wurde empfangen`,
                booking_id: booking.id,
                link: `/customer-dashboard`
            });
        } else if (type === 'update') {
            if (booking.status === 'confirmed' && booking.confirmed_by_provider_email) {
                // Booking confirmed - notify customer
                notifications.push({
                    user_email: booking.customer_email,
                    type: 'booking_confirmed',
                    title_en: 'Booking Confirmed',
                    title_ar: 'تم تأكيد الحجز',
                    title_de: 'Buchung bestätigt',
                    message_en: `${booking.confirmed_by_provider_name} has confirmed your ${booking.service_name} booking for ${booking.date}`,
                    message_ar: `${booking.confirmed_by_provider_name} أكد حجزك لـ ${booking.service_name}`,
                    message_de: `${booking.confirmed_by_provider_name} hat Ihre ${booking.service_name} Buchung bestätigt`,
                    booking_id: booking.id,
                    link: `/customer-dashboard`
                });

                // Notify provider about confirmation
                notifications.push({
                    user_email: booking.confirmed_by_provider_email,
                    type: 'booking_confirmed',
                    title_en: 'Booking Confirmed',
                    title_ar: 'تم تأكيد الحجز',
                    title_de: 'Buchung bestätigt',
                    message_en: `You confirmed booking ${booking.booking_number} with ${booking.customer_name}`,
                    message_ar: `أكدت الحجز ${booking.booking_number} مع ${booking.customer_name}`,
                    message_de: `Sie haben Buchung ${booking.booking_number} mit ${booking.customer_name} bestätigt`,
                    booking_id: booking.id,
                    link: `/provider-dashboard`
                });
            } else if (booking.status === 'cancelled') {
                // Booking cancelled - notify both
                notifications.push({
                    user_email: booking.customer_email,
                    type: 'booking_cancelled',
                    title_en: 'Booking Cancelled',
                    title_ar: 'تم إلغاء الحجز',
                    title_de: 'Buchung storniert',
                    message_en: `Your booking ${booking.booking_number} has been cancelled`,
                    message_ar: `تم إلغاء حجزك ${booking.booking_number}`,
                    message_de: `Ihre Buchung ${booking.booking_number} wurde storniert`,
                    booking_id: booking.id,
                    link: `/customer-dashboard`
                });

                if (booking.confirmed_by_provider_email) {
                    notifications.push({
                        user_email: booking.confirmed_by_provider_email,
                        type: 'booking_cancelled',
                        title_en: 'Booking Cancelled',
                        title_ar: 'تم إلغاء الحجز',
                        title_de: 'Buchung storniert',
                        message_en: `Booking ${booking.booking_number} with ${booking.customer_name} has been cancelled`,
                        message_ar: `تم إلغاء الحجز ${booking.booking_number} مع ${booking.customer_name}`,
                        message_de: `Buchung ${booking.booking_number} mit ${booking.customer_name} wurde storniert`,
                        booking_id: booking.id,
                        link: `/provider-dashboard`
                    });
                }
            } else if (booking.status === 'completed') {
                // Booking completed - notify customer to leave review
                notifications.push({
                    user_email: booking.customer_email,
                    type: 'general',
                    title_en: 'Service Completed',
                    title_ar: 'تم إكمال الخدمة',
                    title_de: 'Service abgeschlossen',
                    message_en: `Your ${booking.service_name} service is complete. Please leave a review!`,
                    message_ar: `تم إكمال خدمة ${booking.service_name}. يرجى ترك تقييم!`,
                    message_de: `Ihr ${booking.service_name} Service ist abgeschlossen. Bitte hinterlassen Sie eine Bewertung!`,
                    booking_id: booking.id,
                    link: `/customer-dashboard`
                });
            }
        }

        // Bulk create notifications
        if (notifications.length > 0) {
            await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
        }

        return Response.json({ 
            success: true, 
            notifications_created: notifications.length 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});