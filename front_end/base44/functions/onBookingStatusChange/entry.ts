import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (!data || !old_data) {
        return Response.json({ success: true, message: 'Skipped - Missing data' });
    }

    // Auto-generate invoice ONLY when booking is completed AND paid
    if (data.status === "completed" && old_data.status !== "completed") {
      if (data.payment_status === "paid") {
        try {
          await base44.asServiceRole.functions.invoke('generateInvoice', { bookingId: data.id });
        } catch (invoiceError) {
          console.error('Invoice generation failed:', invoiceError.message);
        }
        return Response.json({ success: true, message: 'Invoice generated for completed+paid booking' });
      } else {
        // Booking completed but not paid yet - don't generate invoice
        return Response.json({ success: true, message: 'Booking completed but not paid - invoice skipped' });
      }
    }

    // Also generate invoice when payment_status changes to "paid" on a completed booking
    if (data.payment_status === "paid" && old_data.payment_status !== "paid" && data.status === "completed") {
      if (!data.invoice_url) {
        try {
          await base44.asServiceRole.functions.invoke('generateInvoice', { bookingId: data.id });
        } catch (invoiceError) {
          console.error('Invoice generation failed:', invoiceError.message);
        }
      }
      return Response.json({ success: true, message: 'Invoice generated after payment confirmed' });
    }
    
    // Only proceed if status changed to "confirmed"
    if (old_data.status === "confirmed" || data.status !== "confirmed") {
        return Response.json({ success: true, message: 'Status is not newly confirmed. Skipped.' });
    }

    // If payment is already authorized or paid (new pre-payment flow), skip the payment email
    if (data.payment_status === 'authorized' || data.payment_status === 'paid') {
        return Response.json({ success: true, message: 'Payment already handled. Skipped payment email.' });
    }

    const booking = { ...data, id: data.id || event?.entity_id };

    // 1. Send Email
    const appUrl = 'https://institut.einsteindienstleistung.com'; 
    const paymentLink = `${appUrl}/Payment?booking=${booking.id}`;

    const emailBody = `
عزيزي/عزيزتي ${booking.customer_name}،

تم تأكيد حجزك (${booking.booking_number}) بنجاح!

لإتمام العملية، يرجى المتابعة لإجراء الدفع بالضغط على الرابط التالي:
${paymentLink}

مع أطيب التحيات،
فريق معهد آينشتاين

━━━━━━━━━━━━━━━━━━━━━

Sehr geehrte/r ${booking.customer_name},

Ihre Buchung (${booking.booking_number}) wurde bestätigt!

Um den Vorgang abzuschließen, bitten wir Sie, die Zahlung vorzunehmen.
Bitte klicken Sie auf den folgenden Link:
${paymentLink}

Mit freundlichen Grüßen,
Ihr EinStein Institut Team
    `;
    
    const emailSubject = `تم تأكيد حجزك / Buchung bestätigt - ${booking.booking_number}`;

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('brevo'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
        to: [{ email: booking.customer_email, name: booking.customer_name }],
        subject: emailSubject,
        textContent: emailBody
      })
    });
    if (!brevoRes.ok) {
      console.error('Brevo error:', await brevoRes.text());
    }

    // 2. Create in-app Notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: booking.customer_email,
      type: "booking_confirmed",
      title_ar: "تم تأكيد حجزك! يرجى الدفع",
      title_de: "Buchung bestätigt! Bitte bezahlen",
      title_en: "Booking Confirmed! Please pay",
      message_ar: `تم تأكيد الحجز رقم ${booking.booking_number}. اضغط هنا لإتمام الدفع.`,
      message_de: `Buchung ${booking.booking_number} wurde bestätigt. Klicken Sie hier zum Bezahlen.`,
      message_en: `Booking ${booking.booking_number} is confirmed. Click here to pay.`,
      link: `/CustomerDashboard`,
      booking_id: booking.id,
      is_read: false
    });

    return Response.json({ success: true, message: 'Confirmation notification sent' });
  } catch (error) {
    console.error('Error in onBookingStatusChange:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});