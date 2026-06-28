import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      user_email, 
      notification_type, 
      booking_id,
      title_de,
      title_ar,
      title_en,
      message_de,
      message_ar,
      message_en,
      link
    } = await req.json();

    if (!user_email || !notification_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user preferences
    const preferences = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_email: user_email
    });

    const prefs = preferences[0] || {};

    // Check if this notification type is enabled
    const notificationTypeMap = {
      'booking_confirmed': 'booking_confirmed',
      'booking_changed': 'booking_changed',
      'booking_cancelled': 'booking_cancelled',
      'appointment_reminder': 'appointment_reminder',
      'provider_documents_uploaded': 'provider_documents_uploaded',
      'payment_due_reminder': 'payment_due_reminder',
      'payment_received': 'payment_received',
      'review_request': 'review_request'
    };

    const prefKey = notificationTypeMap[notification_type];
    if (prefKey && prefs[prefKey] === false) {
      return Response.json({ status: 'skipped', reason: 'User disabled this notification type' });
    }

    // Create in-app notification if enabled
    if (prefs.in_app_notifications !== false) {
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: notification_type,
        title_de,
        title_ar,
        title_en,
        message_de,
        message_ar,
        message_en,
        link,
        booking_id,
        is_read: false
      });
    }

    // Send email if enabled
    if (prefs.email_notifications !== false) {
      const langPref = prefs.notification_language || 'de';
      const titleMap = {
        de: title_de,
        ar: title_ar,
        en: title_en
      };
      const messageMap = {
        de: message_de,
        ar: message_ar,
        en: message_en
      };

      const emailTitle = titleMap[langPref] || title_de;
      const emailMessage = messageMap[langPref] || message_de;

      const linkText = {
        de: 'Details anzeigen',
        ar: 'عرض التفاصيل',
        en: 'View Details'
      };

      const body = `<h2>${emailTitle}</h2><p>${emailMessage}</p>`;
      const htmlBody = link 
        ? body + `<p><a href="https://institut.einsteindienstleistung.com${link}">${linkText[langPref] || 'View'}</a></p>`
        : body;

      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': Deno.env.get('brevo'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
          to: [{ email: user_email }],
          subject: emailTitle,
          htmlContent: htmlBody
        })
      });
      if (!brevoRes.ok) {
        const errText = await brevoRes.text();
        console.error('Brevo error:', errText);
      }
    }

    return Response.json({
      status: 'sent',
      notification_type,
      in_app: prefs.in_app_notifications !== false,
      email: prefs.email_notifications !== false
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});