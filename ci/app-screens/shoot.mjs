// Screenshots of the Flutter web build with a mocked API, for design review.
// Usage: node shoot.mjs <web-dir-url> <out-dir>
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:8080';
const out = process.argv[3] || 'shots';
fs.mkdirSync(out, { recursive: true });

const today = new Date();
const inDays = (d) => new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);

const profile = { full_name: 'Amina Haddad', email: 'amina@example.com', phone: '0157 1234567', address: 'Musterstraße 12, 60311 Frankfurt', preferred_language: 'Arabic', role: 'user' };
const documents = [
  { id: 1, folder: 'jobcenter', title: 'Bewilligungsbescheid Bürgergeld', sender: 'Jobcenter Frankfurt', size: 230000, created_at: inDays(-3), uploaded_by: 'customer', ai_status: 'done', summary: 'Ihr Bürgergeld ist bis Ende Februar bewilligt. Stellen Sie rechtzeitig einen Weiterbewilligungsantrag.', deadline: inDays(40), original_name: 'bescheid.pdf' },
  { id: 2, folder: 'auslaenderbehoerde', title: 'Aufenthaltstitel – Kopie', sender: 'Ausländerbehörde Frankfurt', size: 900000, created_at: inDays(-20), uploaded_by: 'einstein', ai_status: 'done', summary: 'Aufenthaltserlaubnis gültig bis in 70 Tagen.', deadline: inDays(70), original_name: 'titel.jpg' },
  { id: 3, folder: 'finanzamt', title: 'Steuerbescheid 2025', sender: 'Finanzamt Frankfurt', size: 120000, created_at: inDays(-40), uploaded_by: 'customer', ai_status: 'done', summary: 'Erstattung 412 €.', deadline: null, original_name: 'steuer.pdf' },
  { id: 4, folder: 'sonstiges', title: 'Brief vom Vermieter', size: 120000, created_at: inDays(0), uploaded_by: 'customer', ai_status: 'pending', original_name: 'brief.pdf' },
];
const reminders = [
  { id: 1, title: 'Weiterbewilligungsantrag stellen', folder: 'jobcenter', due_date: inDays(26), remind_on: inDays(-2), status: 'open', document_id: 1 },
  { id: 2, title: 'Termin bei der Ausländerbehörde zur Verlängerung', folder: 'auslaenderbehoerde', due_date: inDays(70), remind_on: inDays(14), status: 'open', document_id: 2 },
];
const services = [];
const mocks = {
  'auth/me': { data: profile },
  'profile': { data: profile },
  'customer/dashboard': { data: { stats: { total: 3, upcoming: 1, completed: 2, open_payments: 0 }, bookings: [] } },
  'customer/bookings': { data: [
    { id: 11, booking_number: 'ES-2026-0042', category: 'behoerden', service_name: 'Behördenhilfe', booking_date: inDays(3), booking_time: '10:00', status: 'confirmed', payment_status: 'paid', price: 50 },
    { id: 12, booking_number: 'ES-2026-0031', category: 'dokumentabo', service_name: 'Dokumenten-Abo', booking_date: inDays(-12), booking_time: '09:00', status: 'completed', payment_status: 'paid', price: 49 },
  ] },
  'customer/notifications': { data: [
    { id: 1, title_ar: 'تم ترتيب مستند', title_de: 'Dokument sortiert', title_en: 'Document sorted', message_ar: 'تم ترتيب «Bewilligungsbescheid» وترجمته.', message_de: '„Bewilligungsbescheid“ ist sortiert und übersetzt.', message_en: 'Sorted', is_read: false, created_at: inDays(-1) },
  ] },
  'customer/documents': { data: { folders: ['jobcenter','auslaenderbehoerde','finanzamt','familienkasse','krankenkasse','rentenversicherung','wohnen','arbeit','schule','bank','versicherung','sonstiges'], documents } },
  'customer/reminders': { data: reminders },
  'customer/forms': { data: {"personal": [{"key": "full_name", "type": "text", "required": true, "label": {"de": "Vor- und Nachname", "ar": "الاسم الكامل", "en": "Full name"}}, {"key": "birth_date", "type": "date", "required": true, "label": {"de": "Geburtsdatum", "ar": "تاريخ الميلاد", "en": "Date of birth"}}], "forms": [{"key": "jobcenter_wba", "folder": "jobcenter", "authority": "Jobcenter", "recipient_field": "jobcenter_email", "title": {"de": "Weiterbewilligungsantrag (Bürgergeld)", "ar": "طلب استمرار البورغرغيلد (WBA)", "en": "Continuation application"}, "description": {"de": "Bevor Ihr Bewilligungszeitraum endet, beantragen Sie die Weiterzahlung.", "ar": "قبل ما تخلص فترة الموافقة لازم تطلب استمرار الدفع.", "en": "Apply for continued payments."}, "fields": [{"key": "jobcenter_email", "type": "email", "required": true, "label": {"de": "E-Mail des Jobcenters", "ar": "إيميل الجوب سنتر", "en": "Jobcenter e-mail"}}, {"key": "bg_number", "type": "text", "required": true, "label": {"de": "BG-Nr.", "ar": "رقم BG", "en": "BG number"}}], "subject": "Weiterbewilligungsantrag – BG-Nr. {{bg_number}}", "body": "Sehr geehrte Damen und Herren,\n\nhiermit beantrage ich die Weiterbewilligung.\n\nMit freundlichen Grüßen\n{{full_name}}", "conditional": {}}, {"key": "abh_verlaengerung", "folder": "auslaenderbehoerde", "authority": "Ausländerbehörde", "recipient_field": "abh_email", "title": {"de": "Verlängerung der Aufenthaltserlaubnis", "ar": "تمديد الإقامة", "en": "Extension of residence permit"}, "description": {"de": "Vor Ablauf stellen.", "ar": "لازم تبعت الطلب قبل ما تخلص إقامتك.", "en": "Before expiry."}, "fields": [], "subject": "Antrag", "body": "Sehr geehrte Damen und Herren,\n\n{{full_name}}", "conditional": {}}], "data": {"full_name": "Amina Haddad"}, "suggestions": {"jobcenter_email": "jobcenter@example.org"}, "email": "amina@example.com"} },
  'public/services': { data: services },
  'public/offers': { data: [] },
  'customer-support': { data: { faqs: [], requests: [] } },
};

const scenarios = [];
for (const locale of ['ar', 'de']) {
  for (const [name, route, auth] of [
    ['home', '/home', false],
    ['services', '/services', false],
    ['login', '/login', false],
    ['dashboard', '/customer-dashboard', true],
    ['documents', '/documents', true],
    ['booking', '/bookings', true],
    ['my-bookings', '/my-bookings', true],
    ['profile', '/profile', true],
    ['forms', '/forms', true],
  ]) scenarios.push({ name: `${locale}-${name}`, route, auth, locale });
}

const browser = await chromium.launch();
for (const s of scenarios) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.addInitScript(({ auth, locale }) => {
    localStorage.clear();
    localStorage.setItem('flutter.einstein_user_locale', JSON.stringify(locale));
    if (auth) {
      localStorage.setItem('flutter.einstein_user_token', JSON.stringify('mock-token'));
      localStorage.setItem('flutter.einstein_user_email', JSON.stringify('amina@example.com'));
    }
  }, s);
  await page.route('https://api.mock/**', (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api\//, '');
    const key = Object.keys(mocks).find((k) => path === k || path.startsWith(k + '/'));
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(key ? mocks[key] : { data: [] }) });
  });
  try {
    await page.goto(`${base}/#${s.route}`, { waitUntil: 'networkidle', timeout: 60000 });
  } catch {}
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${out}/${s.name}.png` });
  // a second, scrolled view of long screens
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${s.name}-2.png` });
  await ctx.close();
  console.log('shot', s.name);
}
await browser.close();
