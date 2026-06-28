import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'update') {
      return Response.json({ status: 'skipped', reason: 'Not an update event' });
    }

    const booking = data;
    if (!booking) {
      return Response.json({ error: 'No booking data' }, { status: 400 });
    }

    const notificationTitles = {
      de: {
        confirmed: 'Buchung bestätigt',
        changed: 'Buchung geändert',
        cancelled: 'Buchung storniert',
        in_progress: 'Buchung läuft',
        completed: 'Buchung abgeschlossen'
      },
      ar: {
        confirmed: 'تم تأكيد الحجز',
        changed: 'تم تغيير الحجز',
        cancelled: 'تم إلغاء الحجز',
        in_progress: 'الحجز جاري',
        completed: 'تم إنجاز الحجز'
      },
      en: {
        confirmed: 'Booking Confirmed',
        changed: 'Booking Changed',
        cancelled: 'Booking Cancelled',
        in_progress: 'Booking In Progress',
        completed: 'Booking Completed'
      }
    };

    const notificationMessages = {
      de: {
        confirmed: `Ihre Buchung #${booking.booking_number} wurde bestätigt.`,
        changed: `Ihre Buchung #${booking.booking_number} wurde geändert.`,
        cancelled: `Ihre Buchung #${booking.booking_number} wurde storniert.`,
        in_progress: `Ihre Buchung #${booking.booking_number} ist in Bearbeitung.`,
        completed: `Ihre Buchung #${booking.booking_number} ist abgeschlossen.`
      },
      ar: {
        confirmed: `تم تأكيد حجزك #${booking.booking_number}.`,
        changed: `تم تغيير حجزك #${booking.booking_number}.`,
        cancelled: `تم إلغاء حجزك #${booking.booking_number}.`,
        in_progress: `حجزك #${booking.booking_number} قيد المعالجة.`,
        completed: `تم إنجاز حجزك #${booking.booking_number}.`
      },
      en: {
        confirmed: `Your booking #${booking.booking_number} has been confirmed.`,
        changed: `Your booking #${booking.booking_number} has been changed.`,
        cancelled: `Your booking #${booking.booking_number} has been cancelled.`,
        in_progress: `Your booking #${booking.booking_number} is in progress.`,
        completed: `Your booking #${booking.booking_number} is completed.`
      }
    };

    const statusMap = {
      confirmed: 'booking_confirmed',
      changed: 'booking_changed',
      cancelled: 'booking_cancelled',
      in_progress: 'in_progress',
      completed: 'completed'
    };

    const notificationType = statusMap[booking.status] || 'booking_changed';

    // Send notification to customer
    if (booking.customer_email) {
      // For completed bookings, link to the bookings tab (where they can leave a review)
      const customerLink = booking.status === 'completed'
        ? `CustomerDashboard?tab=bookings&booking=${booking.id}`
        : `CustomerDashboard?tab=bookings`;

      const completedTitles = {
        de: `Bewertung abgeben – Buchung #${booking.booking_number}`,
        ar: `قيّم خدمتك – الحجز #${booking.booking_number}`,
        en: `Rate your service – Booking #${booking.booking_number}`
      };
      const completedMessages = {
        de: `Ihre Buchung ist abgeschlossen. Klicken Sie hier, um eine Bewertung zu hinterlassen.`,
        ar: `اكتمل حجزك. اضغط هنا لتقييم الخدمة.`,
        en: `Your booking is completed. Click here to leave a review.`
      };

      await base44.asServiceRole.functions.invoke('sendSmartNotification', {
        user_email: booking.customer_email,
        notification_type: notificationType,
        booking_id: booking.id,
        title_de: booking.status === 'completed' ? completedTitles.de : notificationTitles.de[booking.status],
        title_ar: booking.status === 'completed' ? completedTitles.ar : notificationTitles.ar[booking.status],
        title_en: booking.status === 'completed' ? completedTitles.en : notificationTitles.en[booking.status],
        message_de: booking.status === 'completed' ? completedMessages.de : notificationMessages.de[booking.status],
        message_ar: booking.status === 'completed' ? completedMessages.ar : notificationMessages.ar[booking.status],
        message_en: booking.status === 'completed' ? completedMessages.en : notificationMessages.en[booking.status],
        link: customerLink
      });
    }

    // Send notification to provider if confirmed
    if (booking.confirmed_by_provider_email && booking.status === 'confirmed') {
      await base44.asServiceRole.functions.invoke('sendSmartNotification', {
        user_email: booking.confirmed_by_provider_email,
        notification_type: 'booking_confirmed',
        booking_id: booking.id,
        title_de: `Buchung #${booking.booking_number} bestätigt`,
        title_ar: `تم تأكيد الحجز #${booking.booking_number}`,
        title_en: `Booking #${booking.booking_number} confirmed`,
        message_de: 'Ihr Booking wurde vom Kunden akzeptiert.',
        message_ar: 'تم قبول حجزك من قبل العميل.',
        message_en: 'Your booking has been accepted by the customer.',
        link: `https://institut.einsteindienstleistung.com/ProviderDashboard?tab=bookings&booking=${booking.id}`
      });
    }

    return Response.json({ status: 'notifications sent' });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});