import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_URL = "https://institut.einsteindienstleistung.de";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get tomorrow's date (for reminders 24 hours before)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch all confirmed/pending bookings for tomorrow
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      date: tomorrowStr,
      status: { $in: ['pending', 'confirmed'] }
    });

    console.log(`Found ${bookings.length} bookings for ${tomorrowStr}`);

    let sentCount = 0;

    for (const booking of bookings) {
      try {
        // Confirmation & cancellation links
        const confirmLink = `${APP_URL}/CustomerDashboard?tab=bookings&booking=${booking.id}&action=confirm`;
        const cancelLink = `${APP_URL}/CustomerDashboard?tab=bookings&booking=${booking.id}&action=cancel`;

        const emailTemplates = {
          de: {
            subject: `⏰ Erinnerung: Ihr Termin morgen – ${booking.service_name}`,
            body: `Sehr geehrte/r ${booking.customer_name},

dies ist eine freundliche Erinnerung an Ihren Termin MORGEN bei EinStein Institut.

📋 TERMINDETAILS:
━━━━━━━━━━━━━━━━━━━━━
Buchungsnummer: ${booking.booking_number || booking.id}
Service: ${booking.service_name || ''}
Datum: ${booking.date}
Uhrzeit: ${booking.time || ''}
Adresse: ${booking.address || 'Wird noch bekannt gegeben'}
${booking.provider_name ? `Fachkraft: ${booking.provider_name}` : ''}
━━━━━━━━━━━━━━━━━━━━━

✅ Anwesenheit bestätigen:
${confirmLink}

❌ Termin stornieren:
${cancelLink}

Bitte melden Sie sich bei Fragen so früh wie möglich:
📞 069 27246275 | 01573 1770487
📧 info@einsteindienstleistung.de

Mit freundlichen Grüßen,
Ihr EinStein Institut Team`
          },
          ar: {
            subject: `⏰ تذكير: موعدك غداً – ${booking.service_name}`,
            body: `عزيزي/عزيزتي ${booking.customer_name}،

هذا تذكير بموعدك غداً مع معهد آينشتاين.

📋 تفاصيل الموعد:
━━━━━━━━━━━━━━━━━━━━━
رقم الحجز: ${booking.booking_number || booking.id}
الخدمة: ${booking.service_name || ''}
التاريخ: ${booking.date}
الوقت: ${booking.time || ''}
العنوان: ${booking.address || 'سيتم الإعلان لاحقاً'}
${booking.provider_name ? `مزود الخدمة: ${booking.provider_name}` : ''}
━━━━━━━━━━━━━━━━━━━━━

✅ تأكيد الحضور:
${confirmLink}

❌ إلغاء الموعد:
${cancelLink}

للتواصل معنا:
📞 069 27246275 | 01573 1770487
📧 info@einsteindienstleistung.de

مع أطيب التحيات،
فريق معهد آينشتاين`
          },
          en: {
            subject: `⏰ Reminder: Your appointment tomorrow – ${booking.service_name}`,
            body: `Dear ${booking.customer_name},

This is a friendly reminder about your appointment TOMORROW with EinStein Institut.

📋 APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━
Booking Number: ${booking.booking_number || booking.id}
Service: ${booking.service_name || ''}
Date: ${booking.date}
Time: ${booking.time || ''}
Address: ${booking.address || 'To be announced'}
${booking.provider_name ? `Provider: ${booking.provider_name}` : ''}
━━━━━━━━━━━━━━━━━━━━━

✅ Confirm attendance:
${confirmLink}

❌ Cancel appointment:
${cancelLink}

For any questions, please contact us:
📞 069 27246275 | 01573 1770487
📧 info@einsteindienstleistung.de

Best regards,
EinStein Institut Team`
          }
        };

        // Use German as default
        const template = emailTemplates.de;

        // Send via Brevo
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
          const err = await brevoRes.text();
          console.error(`Brevo error for ${booking.customer_email}: ${err}`);
          continue;
        }

        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: booking.customer_email,
          type: 'booking_reminder',
          title_de: 'Terminerinnerung für morgen',
          title_ar: 'تذكير بالموعد غداً',
          title_en: 'Appointment Reminder for Tomorrow',
          message_de: `Ihr Termin: ${booking.service_name} am ${booking.date} um ${booking.time} Uhr`,
          message_ar: `موعدك: ${booking.service_name} في ${booking.date} الساعة ${booking.time}`,
          message_en: `Your appointment: ${booking.service_name} on ${booking.date} at ${booking.time}`,
          link: 'CustomerDashboard',
          booking_id: booking.id,
          is_read: false
        });

        sentCount++;
        console.log(`Sent reminder to ${booking.customer_email} for booking ${booking.booking_number}`);

      } catch (error) {
        console.error(`Error sending reminder for booking ${booking.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      bookingsChecked: bookings.length,
      remindersSent: sentCount,
      date: tomorrowStr
    });

  } catch (error) {
    console.error('Error in sendBookingReminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});