import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("APIKEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.amount_capturable_updated': {
        // Funds are authorized/held — awaiting admin approval
        const piAuth = event.data.object;
        const bookingIdAuth = piAuth.metadata.booking_id;
        if (bookingIdAuth) {
          await base44.asServiceRole.entities.Booking.update(bookingIdAuth, {
            payment_status: 'authorized'
          });
          console.log('Payment authorized for booking:', bookingIdAuth);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        // Fired after admin captures — send email only (status already updated by capturePayment)
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.booking_id;

        if (bookingId) {
          let booking;
          try {
            booking = await base44.asServiceRole.entities.Booking.get(bookingId);
          } catch (e) {
            console.error('Booking not found:', bookingId);
          }

          if (booking) {
            const amountPaid = (paymentIntent.amount / 100).toFixed(2);
            const paymentDate = new Date().toLocaleDateString('de-DE');

            await base44.asServiceRole.integrations.Core.SendEmail({
              to: booking.customer_email,
              subject: `Zahlungsbestätigung - ${booking.booking_number} | EinStein Institut`,
              body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { font-size: 28px; font-weight: bold; }
    .logo span { color: #c9a227; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .amount { font-size: 24px; font-weight: bold; color: #1e3a5f; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ein<span>Stein</span> Institut</div>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Zahlungsbestätigung</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">✓ Zahlung erfolgreich</span>
      </div>
      <p>Sehr geehrte/r ${booking.customer_name},</p>
      <p>vielen Dank für Ihre Zahlung. Hiermit bestätigen wir den Eingang Ihrer Zahlung.</p>
      <div class="details">
        <div class="detail-row"><span>Buchungsnummer:</span><strong>${booking.booking_number}</strong></div>
        <div class="detail-row"><span>Dienstleistung:</span><strong>${booking.service_name || 'Dienstleistung'}</strong></div>
        <div class="detail-row"><span>Datum:</span><strong>${booking.date || '-'}</strong></div>
        <div class="detail-row"><span>Zahlungsdatum:</span><strong>${paymentDate}</strong></div>
        <div class="detail-row"><span>Betrag:</span><span class="amount">${amountPaid} €</span></div>
      </div>
      <p>Mit freundlichen Grüßen,<br><strong>Ihr EinStein Institut Team</strong></p>
    </div>
    <div class="footer"><p>EinStein Institut UG (haftungsbeschränkt)<br>Frankfurt, Deutschland<br>069 27246275 | info@e-in-s-tein.de</p></div>
  </div>
</body>
</html>
              `
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.booking_id;

        if (bookingId) {
          await base44.asServiceRole.entities.Booking.update(bookingId, {
            payment_status: 'failed'
          });
        }
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});