import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
    if (allUsers.length === 0) return Response.json({ message: 'No users' });

    // Get already-notified emails
    const notified = await base44.asServiceRole.entities.UserNotification.list('', 1000);
    const notifiedEmails = new Set(notified.map(n => n.user_email));

    // Find new users not yet notified
    const newUsers = allUsers.filter(u => !notifiedEmails.has(u.email));
    if (newUsers.length === 0) return Response.json({ message: 'No new users' });

    // Get admins
    const admins = allUsers.filter(u => u.role === 'admin');
    if (admins.length === 0) return Response.json({ message: 'No admins found' });

    for (const user of newUsers) {
      // Send email to all admins
      for (const admin of admins) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': Deno.env.get('brevo'), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'EinStein System', email: 'info@einsteindienstleistung.de' },
            to: [{ email: admin.email }],
            subject: `👤 مستخدم جديد: ${user.full_name || user.email}`,
            textContent: `مرحباً،\n\nتم تسجيل مستخدم جديد على منصة آينشتاين:\n\nالاسم: ${user.full_name || 'غير محدد'}\nالإيميل: ${user.email}\nتاريخ التسجيل: ${new Date(user.created_date).toLocaleString('de-DE')}\n\nفريق آينشتاين`
          })
        });
      }

      // Mark as notified
      await base44.asServiceRole.entities.UserNotification.create({
        user_email: user.email,
        notification_sent: true,
        sent_date: new Date().toISOString()
      });
    }

    return Response.json({ success: true, notified: newUsers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});