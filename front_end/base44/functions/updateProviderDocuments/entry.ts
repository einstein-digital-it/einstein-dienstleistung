import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, document_urls, provider_name, customer_email } = await req.json();

    if (!booking_id || !document_urls?.length) {
      return Response.json({ error: 'Missing booking_id or document_urls' }, { status: 400 });
    }

    // Get booking
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking with documents
    await base44.asServiceRole.entities.Booking.update(booking.id, {
      provider_documents_urls: [
        ...(booking.provider_documents_urls || []),
        ...document_urls
      ]
    });

    // Create in-app notification
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: customer_email,
        type: 'provider_documents_uploaded',
        title_de: 'Neue Dokumente vom Anbieter',
        title_ar: 'وثائق جديدة من المزود',
        title_en: 'New Documents from Provider',
        message_de: `${provider_name || 'Der Anbieter'} hat neue Dokumente hochgeladen.`,
        message_ar: `قام ${provider_name || 'المزود'} بتحميل وثائق جديدة.`,
        message_en: `${provider_name || 'The provider'} has uploaded new documents.`,
        link: `https://institut.einsteindienstleistung.com/CustomerDashboard?tab=bookings&booking=${booking.id}`,
        booking_id: booking.id,
        is_read: false
      });
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
    }

    return Response.json({ status: 'success' });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});