// Real app screens for the intro video: the Flutter web build with made-up data.
// Usage: node shots.mjs <web-build-url> <out-dir>   (e.g. http://localhost:8080 ./shots)
// Needs: npm i playwright@1.48.2 && npx playwright install chromium
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:8080';
const out = process.argv[3] || 'shots';
fs.mkdirSync(out, { recursive: true });

const today = new Date();
const inDays = (d) => new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);

// Made-up customer: never real data
const profile = { full_name: 'Amina Haddad', email: 'amina@example.com', phone: '0157 1234567', address: 'Musterstraße 12, 60311 Frankfurt', role: 'user' };
const summaries = {
  ar: 'تمت الموافقة على إعانة المواطن حتى نهاية فبراير. قدّم طلب الاستمرار قبل ذلك.',
  de: 'Ihr Bürgergeld ist bis Ende Februar bewilligt. Stellen Sie rechtzeitig einen Weiterbewilligungsantrag.',
  en: 'Your Bürgergeld is approved until the end of February. Apply for continued payments in time.',
  uk: 'Ваш Bürgergeld схвалено до кінця лютого. Вчасно подайте заяву на продовження.',
};
const docsFor = (lang) => [
  { id: 1, folder: 'jobcenter', title: 'Bewilligungsbescheid Bürgergeld', sender: 'Jobcenter Frankfurt', size: 230000, created_at: inDays(-1), uploaded_by: 'customer', ai_status: 'done', summary: summaries[lang], translation: null, translation_language: lang, deadline: inDays(40), original_name: 'bescheid.pdf' },
  { id: 2, folder: 'auslaenderbehoerde', title: 'Aufenthaltserlaubnis', sender: 'Ausländerbehörde Frankfurt', size: 900000, created_at: inDays(-6), uploaded_by: 'customer', ai_status: 'done', summary: summaries[lang], translation_language: lang, deadline: inDays(70), original_name: 'titel.jpg' },
  { id: 3, folder: 'finanzamt', title: 'Steuerbescheid 2025', sender: 'Finanzamt Frankfurt', size: 120000, created_at: inDays(-12), uploaded_by: 'customer', ai_status: 'done', summary: summaries[lang], translation_language: lang, original_name: 'steuer.pdf' },
  { id: 4, folder: 'krankenkasse', title: 'Beitragsbescheinigung', sender: 'AOK Hessen', size: 120000, created_at: inDays(-20), uploaded_by: 'customer', ai_status: 'done', summary: summaries[lang], translation_language: lang, original_name: 'aok.pdf' },
];
const reminders = [
  { id: 1, title: 'Weiterbewilligungsantrag (WBA) stellen', folder: 'jobcenter', kind: 'expiry', due_date: inDays(26), remind_on: inDays(-1), status: 'open', customer_document_id: 1 },
  { id: 2, title: 'Aufenthaltserlaubnis verlängern', folder: 'auslaenderbehoerde', kind: 'expiry', due_date: inDays(70), remind_on: inDays(14), status: 'open', customer_document_id: 2 },
];
// Services as in "Dienste verwalten" (texts from the backend defaults, usual prices)
const PRICES = { office: [40, 'hour'], secretariat: [45, 'hour'], forms: [40, 'hour'], admin: [40, 'hour'], coordination: [30, 'hour'], mercosur: [150, null], print: [1, null], eur1: [150, null], dokumentabo: [49, 'month'], bueromanagement: [200, 'month'] };
const services = JSON.parse(fs.readFileSync(new URL('../../backend/database/data/default_services.json', import.meta.url), 'utf8'))
  .map((s, i) => ({ id: i + 1, status: 'active', name: s.name_de, description: s.description_de, price_from: String(PRICES[s.category]?.[0] ?? ''), price_unit: PRICES[s.category]?.[1] ?? null, ...s }));
const mocksFor = (lang) => ({
  'auth/me': { data: profile },
  'profile': { data: profile },
  'customer/dashboard': { data: { summary: { total_bookings: 3, upcoming: 1, completed: 2, open_payments: 0 }, profile, upcoming_bookings: [] } },
  'customer/bookings': { data: [] },
  'customer/notifications': { data: [] },
  'customer/subscription': { data: { active: true, status: 'active', price: 6.99, used: 4, limit: 50, free: false } },
  'customer/files': { data: [] },
  'customer/documents': { data: { folders: ['jobcenter', 'auslaenderbehoerde', 'finanzamt', 'familienkasse', 'krankenkasse', 'rentenversicherung', 'wohnen', 'arbeit', 'schule', 'bank', 'versicherung', 'sonstiges'], documents: docsFor(lang) } },
  'customer/reminders': { data: reminders },
  'public/services': { data: services },
  'public/pricing': { data: [] },
  'public/offers': { data: [] },
  'customer-support': { data: { faqs: [], requests: [] } },
});

// EDGE=1 uses the installed Microsoft Edge (when Playwright's own Chromium cannot start)
const browser = await chromium.launch(process.env.EDGE ? { channel: 'msedge', headless: false, args: ['--headless=new'] } : {});
for (const locale of (process.env.LOCALES || 'de,ar,en,uk').split(',')) {
  const mocks = mocksFor(locale);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(({ locale }) => {
    localStorage.clear();
    localStorage.setItem('flutter.einstein_user_locale', JSON.stringify(locale));
    localStorage.setItem('flutter.einstein_user_token', JSON.stringify('mock-token'));
    localStorage.setItem('flutter.einstein_user_email', JSON.stringify('amina@example.com'));
  }, { locale });
  await page.route('https://api.mock/**', (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api\//, '');
    const key = Object.keys(mocks).sort((a, b) => b.length - a.length).find((k) => path === k || path.startsWith(k + '/'));
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(key ? mocks[key] : { data: [] }) });
  });

  const shot = async (name) => { await page.waitForTimeout(2500); await page.screenshot({ path: `${out}/${locale}-${name}.png` }); console.log('shot', locale, name); };
  const go = async (route) => { try { await page.goto(`${base}/#${route}`, { waitUntil: 'networkidle', timeout: 60000 }); } catch { /* keep going */ } await page.waitForTimeout(4000); };

  await go('/documents');
  await shot('documents');                       // upload card
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 650);
  await shot('reminders');                       // reminders
  await page.mouse.wheel(0, 900);
  await shot('folders');                         // folders
  await page.mouse.wheel(0, 900);
  await shot('recent');                          // newest letters
  // Open the Jobcenter folder (first tile in the 'recent' view), then its letter
  await page.mouse.click(locale === 'ar' ? 315 : 75, 372); // first tile (right-to-left in Arabic)
  await shot('folder');
  await page.mouse.click(195, Number(process.env.DOC_Y || 100));
  await shot('detail');
  await go('/services');
  await shot('services');
  await ctx.close();
}
await browser.close();
