import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { booking_id, action } = await req.json(); // action: 'capture' or 'cancel'
    
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });
    
    const stripeKey = (Deno.env.get("APIKEY") || "").trim().replace(/[\r\n]/g, "");
    const paymentIntentId = booking.payment_intent_id;

    // Get customer language preference
    let lang = 'de';
    try {
      const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ user_email: booking.customer_email });
      if (prefs?.[0]?.notification_language) lang = prefs[0].notification_language;
    } catch(e) {}

    const emailTexts = {
      confirm: {
        de: {
          subject: `Ihre Buchung wurde bestätigt - ${booking.booking_number}`,
          body: `Sehr geehrte/r ${booking.customer_name},\n\nWir freuen uns, Ihnen mitteilen zu können, dass Ihre Buchung (${booking.booking_number}) erfolgreich bestätigt wurde. Wir werden uns in Kürze mit Ihnen in Verbindung setzen.\n\nMit freundlichen Grüßen,\nIhr EinStein Institut Team`
        },
        ar: {
          subject: `تم قبول طلبك - ${booking.booking_number}`,
          body: `عزيزي/عزيزتي ${booking.customer_name}،\n\nيسعدنا إخبارك بأنه تم قبول طلبك (${booking.booking_number}) بنجاح. سنتواصل معك قريباً لتحديد التفاصيل.\n\nمع أطيب التحيات،\nفريق معهد آينشتاين`
        },
        en: {
          subject: `Your booking has been confirmed - ${booking.booking_number}`,
          body: `Dear ${booking.customer_name},\n\nWe are pleased to inform you that your booking (${booking.booking_number}) has been successfully confirmed. We will be in touch shortly.\n\nBest regards,\nEinStein Institut Team`
        },
        tr: {
          subject: `Rezervasyonunuz onaylandı - ${booking.booking_number}`,
          body: `Sayın ${booking.customer_name},\n\n(${booking.booking_number}) numaralı rezervasyonunuzun başarıyla onaylandığını bildirmekten memnuniyet duyarız. Kısa süre içinde sizinle iletişime geçeceğiz.\n\nSaygılarımızla,\nEinStein Institut Ekibi`
        },
        es: {
          subject: `Tu reserva ha sido confirmada - ${booking.booking_number}`,
          body: `Estimado/a ${booking.customer_name},\n\nNos complace informarle que su reserva (${booking.booking_number}) ha sido confirmada exitosamente. Nos pondremos en contacto pronto.\n\nAtentamente,\nEquipo EinStein Institut`
        }
      },
      cancel: {
        de: {
          subject: `Bezüglich Ihrer Buchung - ${booking.booking_number}`,
          body: `Sehr geehrte/r ${booking.customer_name},\n\nLeider konnten wir Ihre Buchung (${booking.booking_number}) derzeit nicht bearbeiten. Der bezahlte Betrag wird innerhalb von 5-10 Werktagen auf Ihr Konto zurückerstattet.\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen,\nIhr EinStein Institut Team`
        },
        ar: {
          subject: `بخصوص طلبك - ${booking.booking_number}`,
          body: `عزيزي/عزيزتي ${booking.customer_name}،\n\nنأسف لإخبارك بأنه لم يتمكن فريقنا من معالجة طلبك (${booking.booking_number}) في الوقت الحالي. سيتم استرداد المبلغ المدفوع إلى حسابك خلال 5-10 أيام عمل.\n\nللاستفسار يرجى التواصل معنا.\n\nمع أطيب التحيات،\nفريق معهد آينشتاين`
        },
        en: {
          subject: `Regarding your booking - ${booking.booking_number}`,
          body: `Dear ${booking.customer_name},\n\nUnfortunately, we were unable to process your booking (${booking.booking_number}) at this time. Your payment will be refunded within 5-10 business days.\n\nPlease contact us if you have any questions.\n\nBest regards,\nEinStein Institut Team`
        },
        tr: {
          subject: `Rezervasyonunuz hakkında - ${booking.booking_number}`,
          body: `Sayın ${booking.customer_name},\n\nMaalesef (${booking.booking_number}) numaralı rezervasyonunuzu şu anda işleme alamadık. Ödenen tutar 5-10 iş günü içinde hesabınıza iade edilecektir.\n\nSorularınız için bizimle iletişime geçin.\n\nSaygılarımızla,\nEinStein Institut Ekibi`
        },
        es: {
          subject: `Sobre su reserva - ${booking.booking_number}`,
          body: `Estimado/a ${booking.customer_name},\n\nLamentablemente, no pudimos procesar su reserva (${booking.booking_number}) en este momento. El monto pagado será reembolsado en 5-10 días hábiles.\n\nContáctenos si tiene preguntas.\n\nAtentamente,\nEquipo EinStein Institut`
        }
      }
    };

    if (!paymentIntentId) {
      // No payment intent (cash or manual), just update status
      const newStatus = action === 'capture' ? 'confirmed' : 'cancelled';
      await base44.asServiceRole.entities.Booking.update(booking_id, { status: newStatus });
      return Response.json({ success: true });
    }

    if (action === 'capture') {
      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data?.error?.message || 'Stripe capture error' }, { status: 500 });

      await base44.asServiceRole.entities.Booking.update(booking_id, {
        status: 'confirmed',
        payment_status: 'paid'
      });

      // Notify customer
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: booking.customer_email,
          type: 'booking_confirmed',
          title_de: 'Buchung bestätigt & Zahlung eingegangen',
          title_ar: 'تم تأكيد الحجز وقبول الدفع',
          title_en: 'Booking Confirmed & Payment Received',
          message_de: `Ihre Buchung ${booking.booking_number} wurde bestätigt und Ihre Zahlung wurde eingezogen.`,
          message_ar: `تم تأكيد حجزك ${booking.booking_number} وتم خصم المبلغ.`,
          message_en: `Your booking ${booking.booking_number} has been confirmed and payment captured.`,
          link: '/CustomerDashboard',
          booking_id: booking_id,
          is_read: false
        });

        // Send confirmation email
        const confirmText = emailTexts.confirm[lang] || emailTexts.confirm.de;
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': Deno.env.get('brevo'), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
            to: [{ email: booking.customer_email, name: booking.customer_name }],
            subject: confirmText.subject,
            textContent: confirmText.body
          })
        });
      } catch(e) {}

    } else if (action === 'cancel') {
      // Cancel the payment intent → automatic refund for authorized payments
      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data?.error?.message || 'Stripe cancel error' }, { status: 500 });

      await base44.asServiceRole.entities.Booking.update(booking_id, {
        status: 'cancelled',
        payment_status: 'refunded'
      });

      // Notify customer
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: booking.customer_email,
          type: 'booking_cancelled',
          title_de: 'Buchung abgelehnt – Erstattung eingeleitet',
          title_ar: 'تم رفض الحجز - سيتم استرداد المبلغ',
          title_en: 'Booking Rejected - Refund Initiated',
          message_de: `Ihre Buchung ${booking.booking_number} wurde leider abgelehnt. Ihre Zahlung wird innerhalb von 5-10 Werktagen erstattet.`,
          message_ar: `تم رفض حجزك ${booking.booking_number}. سيتم استرداد مبلغك خلال 5-10 أيام عمل.`,
          message_en: `Your booking ${booking.booking_number} was rejected. Your payment will be refunded within 5-10 business days.`,
          link: '/CustomerDashboard',
          booking_id: booking_id,
          is_read: false
        });

        // Send rejection email
        const cancelText = emailTexts.cancel[lang] || emailTexts.cancel.de;
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': Deno.env.get('brevo'), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
            to: [{ email: booking.customer_email, name: booking.customer_name }],
            subject: cancelText.subject,
            textContent: cancelText.body
          })
        });
      } catch(e) {}
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('capturePayment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});