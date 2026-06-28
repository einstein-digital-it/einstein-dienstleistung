import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, hours_until_appointment } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Get booking details
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      id: booking_id
    });

    const booking = bookings[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const reminderType = hours_until_appointment === 24 ? '24h' : '1h';

    const titles = {
      de: `Termin ${reminderType === '24h' ? 'morgen' : 'in 1 Stunde'}`,
      ar: `موعدك ${reminderType === '24h' ? 'غداً' : 'بعد ساعة'}`,
      en: `Appointment ${reminderType === '24h' ? 'tomorrow' : 'in 1 hour'}`
    };

    const messages = {
      de: `Erinnerung: ${booking.service_name} am ${booking.date} um ${booking.time} Uhr bei ${booking.provider_name}.`,
      ar: `تذكير: ${booking.service_name} في ${booking.date} الساعة ${booking.time} مع ${booking.provider_name}.`,
      en: `Reminder: ${booking.service_name} on ${booking.date} at ${booking.time} with ${booking.provider_name}.`
    };

    // Notify customer
    if (booking.customer_email) {
      await base44.asServiceRole.functions.invoke('sendSmartNotification', {
        user_email: booking.customer_email,
        notification_type: 'appointment_reminder',
        booking_id: booking.id,
        title_de: titles.de,
        title_ar: titles.ar,
        title_en: titles.en,
        message_de: messages.de,
        message_ar: messages.ar,
        message_en: messages.en,
        link: `https://institut.einsteindienstleistung.com/CustomerDashboard?tab=bookings&booking=${booking.id}`
      });
    }

    // Notify provider
    if (booking.confirmed_by_provider_email) {
      await base44.asServiceRole.functions.invoke('sendSmartNotification', {
        user_email: booking.confirmed_by_provider_email,
        notification_type: 'appointment_reminder',
        booking_id: booking.id,
        title_de: `Termin: ${booking.customer_name}`,
        title_ar: `موعد: ${booking.customer_name}`,
        title_en: `Appointment: ${booking.customer_name}`,
        message_de: `${titles.de}: Termin mit ${booking.customer_name} am ${booking.date} um ${booking.time} Uhr.`,
        message_ar: `${titles.ar}: موعد مع ${booking.customer_name} في ${booking.date} الساعة ${booking.time}.`,
        message_en: `${titles.en}: Appointment with ${booking.customer_name} on ${booking.date} at ${booking.time}.`,
        link: `https://institut.einsteindienstleistung.com/ProviderDashboard?tab=bookings&booking=${booking.id}`
      });
    }

    return Response.json({ status: 'notifications sent' });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});