import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Scheduled function: runs every 30 minutes
// Cancels confirmed bookings that weren't paid within 24 hours
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allBookings = await base44.asServiceRole.entities.Booking.list('-created_date', 500);

    const now = new Date();
    const cancelled = [];

    for (const booking of allBookings) {
      if (booking.status !== 'confirmed' || booking.payment_status === 'paid') continue;

      // confirmed_at is when it was confirmed - check if more than 24h ago
      const confirmedAt = booking.confirmed_at ? new Date(booking.confirmed_at) : null;
      if (!confirmedAt) continue;

      const hoursSinceConfirmed = (now - confirmedAt) / (1000 * 60 * 60);
      if (hoursSinceConfirmed < 24) continue;

      // Cancel the booking
      await base44.asServiceRole.entities.Booking.update(booking.id, {
        status: 'cancelled',
        notes: (booking.notes || '') + '\n[Auto-cancelled: payment not received within 24 hours]'
      });

      // Send cancellation email
      try {
        const appUrl = 'https://e-in-s-tein.de';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.customer_email,
          subject: `تم إلغاء حجزك / Buchung storniert - ${booking.booking_number}`,
          body: `
عزيزي/عزيزتي ${booking.customer_name}،

للأسف، تم إلغاء حجزك (${booking.booking_number}) تلقائياً لعدم إتمام الدفع خلال 24 ساعة من تأكيده.
يمكنك إجراء حجز جديد عبر الموقع: ${appUrl}

مع أطيب التحيات،
فريق معهد آينشتاين

━━━━━━━━━━━━━━━━━━━━━

Sehr geehrte/r ${booking.customer_name},

Leider wurde Ihre Buchung (${booking.booking_number}) automatisch storniert, 
da die Zahlung nicht innerhalb von 24 Stunden nach Bestätigung eingegangen ist.
Sie können eine neue Buchung über unsere Website vornehmen: ${appUrl}

Mit freundlichen Grüßen,
Ihr EinStein Institut Team
          `
        });
      } catch (emailErr) {
        console.error('Failed to send cancellation email:', emailErr.message);
      }

      // In-app notification
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: booking.customer_email,
          type: 'booking_cancelled',
          title_ar: 'تم إلغاء حجزك',
          title_de: 'Buchung storniert',
          title_en: 'Booking Cancelled',
          message_ar: `تم إلغاء الحجز رقم ${booking.booking_number} لعدم إتمام الدفع خلال 24 ساعة.`,
          message_de: `Buchung ${booking.booking_number} wurde storniert – Zahlung nicht rechtzeitig eingegangen.`,
          message_en: `Booking ${booking.booking_number} was cancelled – payment not received within 24 hours.`,
          booking_id: booking.id,
          is_read: false
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr.message);
      }

      cancelled.push(booking.booking_number);
    }

    return Response.json({ success: true, cancelled_count: cancelled.length, cancelled });
  } catch (error) {
    console.error('Error in cancelUnpaidBookings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});