import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, hours_until_due } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Get booking details
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      id: booking_id
    });

    const booking = bookings[0];
    if (!booking || !booking.customer_email) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const titles = {
      de: hours_until_due <= 24 ? 'Zahlungsaufforderung fällig!' : 'Zahlungserinnerung',
      ar: hours_until_due <= 24 ? 'تنبيه دفع عاجل!' : 'تذكير الدفع',
      en: hours_until_due <= 24 ? 'Payment Due Soon!' : 'Payment Reminder'
    };

    const messages = {
      de: hours_until_due <= 24 
        ? `Die Zahlung für Buchung #${booking.booking_number} ist ${hours_until_due} Stunden überfällig.`
        : `Die Zahlung für Buchung #${booking.booking_number} wird in ${hours_until_due} Stunden fällig.`,
      ar: hours_until_due <= 24
        ? `الدفع المستحق للحجز #${booking.booking_number} يجب أن يكون في ${hours_until_due} ساعة.`
        : `سيكون الدفع للحجز #${booking.booking_number} مستحقاً في ${hours_until_due} ساعة.`,
      en: hours_until_due <= 24
        ? `Payment for booking #${booking.booking_number} is due within ${hours_until_due} hours!`
        : `Payment for booking #${booking.booking_number} will be due in ${hours_until_due} hours.`
    };

    await base44.asServiceRole.functions.invoke('sendSmartNotification', {
      user_email: booking.customer_email,
      notification_type: 'payment_due',
      booking_id: booking.id,
      title_de: titles.de,
      title_ar: titles.ar,
      title_en: titles.en,
      message_de: messages.de,
      message_ar: messages.ar,
      message_en: messages.en,
      link: `https://institut.einsteindienstleistung.com/Payment?bookingId=${booking.id}`
    });

    return Response.json({ status: 'notification sent' });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});