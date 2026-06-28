import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function isFakeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const e = email.toLowerCase();
  const fakeDomains = [
    'example.com', 'example.org', 'example.net', 'mailinator.com', 'tempmail',
    'yopmail', '10minutemail', 'fake', 'test'
  ];
  return e.includes('test@') || fakeDomains.some((d) => e.includes(d));
}

function looksLikeTestString(v) {
  if (!v || typeof v !== 'string') return false;
  return /(^|\b)test(\b|$)/i.test(v) || /(dummy|fake|sample)/i.test(v);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch (_) { /* no body provided */ }
    const dryRun = Boolean(body?.dryRun);

    // Fetch a large batch of bookings (all time). If you have huge data, run multiple times or extend limit.
    const limit = body?.limit && Number.isFinite(body.limit) ? Math.max(1, Math.min(20000, Number(body.limit))) : 10000;
    const all = await base44.asServiceRole.entities.Booking.filter({}, '-created_date', limit);

    const suspects = (all || []).filter((b) => {
      const priceIsZero = b.price === 0 || b.price === '0' || b.price === null || typeof b.price === 'undefined';
      const emailIsFake = isFakeEmail(b.customer_email);
      const hasTestFlag = looksLikeTestString(b.customer_name) || looksLikeTestString(b.service_name) ||
                          looksLikeTestString(b.description) || looksLikeTestString(b.booking_number) ||
                          looksLikeTestString(b.address);
      return emailIsFake || priceIsZero || hasTestFlag;
    });

    if (dryRun) {
      return Response.json({
        dryRun: true,
        totalFetched: all?.length || 0,
        candidates: suspects.length,
        sample: suspects.slice(0, 20).map((b) => ({ id: b.id, email: b.customer_email, price: b.price, booking_number: b.booking_number }))
      });
    }

    let deleted = 0;
    for (const b of suspects) {
      try {
        await base44.asServiceRole.entities.Booking.delete(b.id);
        deleted += 1;
      } catch (err) {
        // keep going, collect minimal info
        console.error('Failed to delete', b.id, err?.message);
      }
    }

    return Response.json({
      success: true,
      totalFetched: all?.length || 0,
      deleted,
      note: 'Criteria: email looks fake OR price is 0/empty OR any text contains "test/dummy/fake/sample".'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});