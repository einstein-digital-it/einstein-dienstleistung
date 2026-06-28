import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_URL = "https://institut.einsteindienstleistung.de";

const welcomeContent = {
  de: {
    subject: "🎉 Herzlichen Glückwunsch! Ihr Antrag wurde genehmigt – EinStein",
    body: (name, email) => `🌟 Herzlichen Glückwunsch, ${name}!

Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Antrag als Fachkraft bei EinStein offiziell GENEHMIGT wurde!

━━━━━━━━━━━━━━━━━━━━━━━━
📋 SO REGISTRIEREN SIE SICH – WICHTIG!
━━━━━━━━━━━━━━━━━━━━━━━━

Um Zugang zu Ihrem Fachkraft-Dashboard zu erhalten, müssen Sie sich mit GENAU DIESER E-Mail-Adresse registrieren:

📧 ${email}

⚠️  Bitte verwenden Sie unbedingt diese E-Mail-Adresse bei der Registrierung, da Ihr Profil damit verknüpft ist.

🔗 Registrieren / Anmelden:
👉 ${APP_URL}

Schritte:
1. Klicken Sie auf den obigen Link
2. Klicken Sie auf "Anmelden"
3. Registrieren Sie sich mit der oben genannten E-Mail-Adresse
4. Nach der Anmeldung sehen Sie Ihr Fachkraft-Dashboard

━━━━━━━━━━━━━━━━━━━━━━━━
✅ Was Sie nach der Anmeldung tun können:
• Buchungsanfragen von Kunden einsehen und annehmen
• Ihr Profil vervollständigen
• Ihre Verfügbarkeit und Arbeitszeiten festlegen
━━━━━━━━━━━━━━━━━━━━━━━━

📞 Bei Fragen stehen wir Ihnen gerne zur Verfügung:
Telefon: 069 27246275 oder 01573 1770487
E-Mail: info@einsteindienstleistung.de

Wir freuen uns auf eine erfolgreiche Zusammenarbeit!

Mit herzlichen Grüßen,
Das EinStein Institut Team
„EinStein – Weil jeder Mensch Unterstützung verdient."`
  },
  ar: {
    subject: "🎉 تهانينا! تمت الموافقة على طلبك – آينشتاين",
    body: (name, email) => `🌟 تهانينا ${name}!

يسعدنا إخبارك بأن طلبك للانضمام كمزود خدمة في آينشتاين قد تمت الموافقة عليه رسمياً!

━━━━━━━━━━━━━━━━━━━━━━━━
📋 كيف تسجّل – مهم جداً!
━━━━━━━━━━━━━━━━━━━━━━━━

للوصول إلى لوحة تحكم مزود الخدمة، يجب أن تسجّل باستخدام نفس هذا البريد الإلكتروني تحديداً:

📧 ${email}

⚠️  من الضروري استخدام هذا البريد الإلكتروني عند التسجيل لأن ملفك الشخصي مرتبط به.

🔗 رابط التسجيل / تسجيل الدخول:
👉 ${APP_URL}

الخطوات:
1. اضغط على الرابط أعلاه
2. اضغط على "تسجيل الدخول"
3. سجّل بالبريد الإلكتروني المذكور أعلاه
4. بعد تسجيل الدخول ستجد لوحة تحكم مزود الخدمة

━━━━━━━━━━━━━━━━━━━━━━━━
✅ ما يمكنك فعله بعد تسجيل الدخول:
• عرض طلبات الحجز وقبولها
• إكمال ملفك الشخصي
• تحديد أوقات توفرك
━━━━━━━━━━━━━━━━━━━━━━━━

📞 للتواصل معنا:
الهاتف: 069 27246275 أو 01573 1770487
البريد الإلكتروني: info@einsteindienstleistung.de

نتطلع إلى تعاون ناجح معك!

مع أطيب التحيات،
فريق معهد آينشتاين`
  },
  en: {
    subject: "🎉 Congratulations! Your application has been approved – EinStein",
    body: (name, email) => `🌟 Congratulations, ${name}!

We are pleased to inform you that your application to become a service provider at EinStein has been officially APPROVED!

━━━━━━━━━━━━━━━━━━━━━━━━
📋 HOW TO REGISTER – IMPORTANT!
━━━━━━━━━━━━━━━━━━━━━━━━

To access your provider dashboard, you must register using EXACTLY this email address:

📧 ${email}

⚠️  Please make sure to use this email address when registering, as your profile is linked to it.

🔗 Register / Login:
👉 ${APP_URL}

Steps:
1. Click the link above
2. Click "Login"
3. Register with the email address mentioned above
4. After logging in, you will see your Provider Dashboard

━━━━━━━━━━━━━━━━━━━━━━━━
✅ What you can do after logging in:
• View and accept customer booking requests
• Complete your profile
• Set your availability and working hours
━━━━━━━━━━━━━━━━━━━━━━━━

📞 If you have any questions:
Phone: 069 27246275 or 01573 1770487
Email: info@einsteindienstleistung.de

We look forward to a successful collaboration!

Best regards,
The EinStein Institut Team`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { provider_email, provider_name, provider_lang } = body;

    if (!provider_email || !provider_name) {
      return Response.json({ error: 'provider_email and provider_name are required' }, { status: 400 });
    }

    const lang = provider_lang || 'de';
    const content = welcomeContent[lang] || welcomeContent.de;

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('brevo'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Einstein', email: 'info@einsteindienstleistung.de' },
        to: [{ email: provider_email, name: provider_name }],
        subject: content.subject,
        textContent: content.body(provider_name, provider_email)
      })
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      throw new Error(`Brevo error: ${errText}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});