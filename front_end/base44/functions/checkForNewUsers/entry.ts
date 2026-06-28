import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Get all users sorted by creation date
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
    
    if (allUsers.length === 0) {
      return new Response(JSON.stringify({ message: "No users found." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Get all notification records
    const notificationRecords = await base44.asServiceRole.entities.UserNotification.list('', 1000);
    const notifiedEmails = new Set(notificationRecords.map(n => n.user_email));

    // 3. Find users who haven't been notified
    const newUsers = allUsers.filter(user => !notifiedEmails.has(user.email));

    if (newUsers.length === 0) {
      return new Response(JSON.stringify({ message: "No new users to notify." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Find an admin to email
    const admins = allUsers.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      console.warn("No admin user found to send notification email to.");
      return new Response(JSON.stringify({ message: "No admin user found. Notification not sent." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const adminEmail = admins[0].email;

    // 5. Process each new user
    let notificationsSent = 0;
    for (const user of newUsers) {
      const subject = `Ein neuer Benutzer hat sich registriert: ${user.full_name || user.email}`;
      const body = `
        Hallo Admin,<br><br>
        Ein neuer Benutzer hat sich auf der EinStein Institut-Plattform registriert.<br><br>
        <strong>Name:</strong> ${user.full_name || 'Nicht angegeben'}<br>
        <strong>E-Mail:</strong> ${user.email}<br>
        <strong>Registrierungsdatum:</strong> ${new Date(user.created_date).toLocaleString('de-DE')}<br><br>
        Sie können das Profil im Admin-Dashboard einsehen.
      `;

      // Send email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: subject,
        body: body,
        from_name: "EinStein System"
      });

      // Create notification record
      await base44.asServiceRole.entities.UserNotification.create({
        user_email: user.email,
        notification_sent: true,
        sent_date: new Date().toISOString()
      });
      
      notificationsSent++;
    }

    return new Response(JSON.stringify({ success: true, message: `${notificationsSent} notification(s) sent to ${adminEmail}` }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in checkForNewUsers function:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});