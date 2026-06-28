import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const welcomeContent = {
  de: {
    subject: "🎉 Willkommen im EinStein-Team!",
    body: (name) => `🌟 Willkommen im EinStein-Team, ${name}!

Wir freuen uns sehr, Sie als neues Mitglied unseres Fachkräfte-Netzwerks begrüßen zu dürfen!

Ihr Profil wurde offiziell genehmigt. Ab sofort können Sie sich einloggen und Aufträge annehmen.

✅ Was Sie jetzt tun können:
• Melden Sie sich auf unserer Plattform an
• Vervollständigen Sie Ihr Profil
• Nehmen Sie Buchungsanfragen an

🌐 Zur Plattform: https://institut.einsteindienstleistung.de

📞 Bei Fragen stehen wir Ihnen gerne zur Verfügung:
Telefon: 069 27246275 oder 01573 1770487
E-Mail: info@e-in-s-tein.de

Wir freuen uns auf eine erfolgreiche Zusammenarbeit!

Mit herzlichen Grüßen,
Das EinStein Institut Team

„EinStein – Weil jeder Mensch Unterstützung verdient."`
  },
  ar: {
    subject: "🎉 أهلاً بك في فريق آينشتاين!",
    body: (name) => `🌟 أهلاً وسهلاً بك في فريق آينشتاين، ${name}!

يسعدنا الترحيب بك كعضو جديد في شبكة متخصصينا!

تمت الموافقة على ملفك الشخصي رسمياً. يمكنك الآن تسجيل الدخول وقبول الطلبات.

✅ ما يمكنك فعله الآن:
• قم بتسجيل الدخول إلى المنصة
• أكمل ملفك الشخصي
• ابدأ باستقبال طلبات الحجز

🌐 رابط المنصة: https://institut.einsteindienstleistung.de

📞 للتواصل معنا:
الهاتف: 069 27246275 أو 01573 1770487
البريد الإلكتروني: info@e-in-s-tein.de

نتطلع إلى تعاون ناجح معك!

مع أطيب التحيات،
فريق معهد آينشتاين`
  },
  en: {
    subject: "🎉 Welcome to the EinStein Team!",
    body: (name) => `🌟 Welcome to the EinStein team, ${name}!

We are delighted to welcome you as a new member of our professional network!

Your profile has been officially approved. You can now log in and start accepting orders.

✅ What you can do now:
• Log in to our platform
• Complete your profile
• Start receiving booking requests

🌐 Platform: https://institut.einsteindienstleistung.de

📞 If you have any questions:
Phone: 069 27246275 or 01573 1770487
Email: info@e-in-s-tein.de

We look forward to a successful collaboration!

Best regards,
The EinStein Institut Team`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;

    // Only trigger when status changes TO "approved"
    if (event?.type !== 'update') {
      return Response.json({ skipped: 'not an update event' });
    }

    const newStatus = data?.status;
    const oldStatus = old_data?.status;

    if (newStatus !== 'approved' || oldStatus === 'approved') {
      return Response.json({ skipped: 'status not changed to approved' });
    }

    const providerEmail = data?.email;
    const providerName = data?.full_name;
    const providerLang = data?.notes || 'de'; // notes field stores language preference

    if (!providerEmail || !providerName) {
      return Response.json({ error: 'Missing provider email or name' }, { status: 400 });
    }

    const content = welcomeContent[providerLang] || welcomeContent.de;

    // Get admin email
    const allUsers = await base44.asServiceRole.entities.User.list('', 100);
    const admin = allUsers.find(u => u.role === 'admin');

    // 1. Invite the provider to the app (so they can log in)
    try {
      await base44.asServiceRole.users.inviteUser(providerEmail, 'user');
      console.log("Provider invited to app:", providerEmail);
    } catch(e) {
      console.log("Could not invite provider (may already exist):", e.message);
    }

    const brevoHeaders = { 'api-key': Deno.env.get('brevo'), 'Content-Type': 'application/json' };
    const brevoSender = { name: 'EinStein Institut', email: 'info@einsteindienstleistung.de' };

    // 2. Notify admin
    if (admin) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: brevoHeaders,
        body: JSON.stringify({
          sender: brevoSender,
          to: [{ email: admin.email }],
          subject: `✅ Fachkraft genehmigt & eingeladen: ${providerName}`,
          textContent: `Hallo Admin,\n\nDie Fachkraft ${providerName} (${providerEmail}) wurde genehmigt und eine Einladungs-E-Mail wurde an sie gesendet.\n\nDie Fachkraft kann sich jetzt auf der Plattform anmelden.\n\n---\nEinStein Institut System`
        })
      });
    }

    // 3. Send welcome email directly to provider via Brevo (works for any email)
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify({
        sender: brevoSender,
        to: [{ email: providerEmail, name: providerName }],
        subject: content.subject,
        textContent: content.body(providerName)
      })
    });
    console.log("Welcome email sent to provider:", providerEmail);

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: providerEmail,
      type: "provider_approved",
      title_de: "Profil genehmigt",
      title_ar: "تمت الموافقة على الملف",
      title_en: "Profile Approved",
      message_de: "Ihr Profil wurde genehmigt. Sie können jetzt Aufträge annehmen.",
      message_ar: "تمت الموافقة على ملفك. يمكنك الآن قبول الطلبات.",
      message_en: "Your profile has been approved. You can now accept orders.",
      link: "ProviderDashboard",
      is_read: false
    });

    return Response.json({ success: true, email_sent_to: admin?.email || 'no admin found' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});