import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, provider_name } = await req.json();

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

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: booking.customer_email,
      type: 'provider_documents_uploaded',
      title_de: 'Neue Dokumente vom Anbieter',
      title_ar: 'وثائق جديدة من المزود',
      title_en: 'New Documents from Provider',
      message_de: `${provider_name || 'Der Anbieter'} hat neue Dokumente hochgeladen.`,
      message_ar: `قام ${provider_name || 'المزود'} بتحميل وثائق جديدة.`,
      message_en: `${provider_name || 'The provider'} has uploaded new documents.`,
      link: `/CustomerDashboard?tab=bookings&booking=${booking.id}`,
      booking_id: booking.id,
      is_read: false
    });

    // Send email notification
    const titleMap = {
      de: 'Neue Dokumente vom Anbieter',
      ar: 'وثائق جديدة من المزود',
      en: 'New Documents from Provider'
    };

    const messageMap = {
      de: `${provider_name || 'Der Anbieter'} hat neue Dokumente hochgeladen. Bitte melden Sie sich an, um diese anzuzeigen.`,
      ar: `قام ${provider_name || 'المزود'} بتحميل وثائق جديدة. يرجى تسجيل الدخول لعرضها.`,
      en: `${provider_name || 'The provider'} has uploaded new documents. Please login to view them.`
    };

    // Get user's notification preferences if available
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_email: booking.customer_email
    });
    const pref = prefs[0];
    const lang = pref?.notification_language || 'de';

    if (!pref || pref.email_notifications !== false) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': Deno.env.get('brevo'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' },
          to: [{ email: booking.customer_email }],
          subject: titleMap[lang] || titleMap.de,
          htmlContent: `<h2>${titleMap[lang] || titleMap.de}</h2><p>${messageMap[lang] || messageMap.de}</p><p><a href="https://institut.einsteindienstleistung.com/CustomerDashboard">Ansehen</a></p>`
        })
      });
    }

    return Response.json({ status: 'notification sent' });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});