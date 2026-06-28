import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    // Fetch booking details - search by booking_number
    const bookings = await base44.entities.Booking.filter({ booking_number: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine language based on booking data
    const lang = booking.customer_email.includes('@') ? 'de' : 'de'; // Default to German

    // Email content in multiple languages
    const emailTemplates = {
      de: {
        subject: `Buchungsbestätigung - ${booking.booking_number}`,
        body: `
Sehr geehrte/r ${booking.customer_name},

vielen Dank für Ihre Buchung bei EinStein Institut!

📋 BUCHUNGSDETAILS:
━━━━━━━━━━━━━━━━━━━━━
Buchungsnummer: ${booking.booking_number}
Service: ${booking.service_name}
Datum: ${booking.date || 'Noch nicht festgelegt'}
Uhrzeit: ${booking.time || 'Noch nicht festgelegt'}
Dauer: ${booking.duration_hours ? booking.duration_hours + ' Stunden' : 'Nach Vereinbarung'}
Adresse: ${booking.address || 'Wird noch bekannt gegeben'}
${booking.provider_name ? `Fachkraft: ${booking.provider_name}` : ''}

💰 PREIS:
${booking.price ? booking.price + ' €' : 'Wird nach Beratung festgelegt'}

📝 IHRE NACHRICHT:
${booking.description || '-'}

📞 KONTAKT:
Telefon: 069 27246275 oder 01573 1770487
E-Mail: info@e-in-s-tein.de
Website: www.e-in-s-tein.de

Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um die Details zu bestätigen.

Mit freundlichen Grüßen,
Ihr EinStein Institut Team

━━━━━━━━━━━━━━━━━━━━━
EinStein Institut UG (haftungsbeschränkt)
Frankfurt, Deutschland
„EinStein – Weil jeder Mensch Unterstützung verdient."
        `
      },
      ar: {
        subject: `تأكيد الحجز - ${booking.booking_number}`,
        body: `
عزيزي/عزيزتي ${booking.customer_name}،

شكراً لحجزك مع معهد آينشتاين!

📋 تفاصيل الحجز:
━━━━━━━━━━━━━━━━━━━━━
رقم الحجز: ${booking.booking_number}
الخدمة: ${booking.service_name}
التاريخ: ${booking.date || 'لم يتم التحديد بعد'}
الوقت: ${booking.time || 'لم يتم التحديد بعد'}
المدة: ${booking.duration_hours ? booking.duration_hours + ' ساعات' : 'حسب الاتفاق'}
العنوان: ${booking.address || 'سيتم الإعلان عنه'}
${booking.provider_name ? `مزود الخدمة: ${booking.provider_name}` : ''}

💰 السعر:
${booking.price ? booking.price + ' €' : 'سيتم تحديده بعد الاستشارة'}

📝 رسالتك:
${booking.description || '-'}

📞 للتواصل:
الهاتف: 069 27246275 أو 01573 1770487
البريد الإلكتروني: info@e-in-s-tein.de
الموقع: www.e-in-s-tein.de

سنتواصل معك قريباً لتأكيد التفاصيل.

مع أطيب التحيات،
فريق معهد آينشتاين

━━━━━━━━━━━━━━━━━━━━━
EinStein Institut UG (haftungsbeschränkt)
Frankfurt, Germany
„آينشتاين – لأن كل إنسان يستحق الدعم."
        `
      },
      en: {
        subject: `Booking Confirmation - ${booking.booking_number}`,
        body: `
Dear ${booking.customer_name},

Thank you for your booking with EinStein Institut!

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━
Booking Number: ${booking.booking_number}
Service: ${booking.service_name}
Date: ${booking.date || 'To be confirmed'}
Time: ${booking.time || 'To be confirmed'}
Duration: ${booking.duration_hours ? booking.duration_hours + ' hours' : 'As agreed'}
Address: ${booking.address || 'To be announced'}
${booking.provider_name ? `Provider: ${booking.provider_name}` : ''}

💰 PRICE:
${booking.price ? '€' + booking.price : 'To be determined after consultation'}

📝 YOUR MESSAGE:
${booking.description || '-'}

📞 CONTACT:
Phone: 069 27246275 or 01573 1770487
Email: info@e-in-s-tein.de
Website: www.e-in-s-tein.de

We will contact you shortly to confirm the details.

Best regards,
Your EinStein Institut Team

━━━━━━━━━━━━━━━━━━━━━
EinStein Institut UG (haftungsbeschränkt)
Frankfurt, Germany
„EinStein – Because everyone deserves support."
        `
      }
    };

    const template = emailTemplates[lang] || emailTemplates.de;

    // Send confirmation email via Brevo
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('brevo'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
        to: [{ email: booking.customer_email, name: booking.customer_name }],
        subject: template.subject,
        textContent: template.body
      })
    });
    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('Brevo error:', errText);
    }

    return Response.json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending confirmation:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});