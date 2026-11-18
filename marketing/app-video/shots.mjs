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
const qaFor = (lang) => ({"de":["Bis wann muss ich den Antrag stellen?","Ihr Bürgergeld ist bis Ende Februar bewilligt. Stellen Sie den Weiterbewilligungsantrag am besten bis Ende Januar."],"ar":["متى يجب أن أقدّم الطلب؟","تمت الموافقة على إعانة المواطن حتى نهاية فبراير. يُفضّل أن تقدّم طلب الاستمرار قبل نهاية يناير."],"en":["By when do I have to apply?","Your Bürgergeld is approved until the end of February. Best apply for continued payments by the end of January."],"uk":["До коли треба подати заяву?","Ваш Bürgergeld схвалено до кінця лютого. Краще подайте заяву на продовження до кінця січня."]})[lang];
const reasonFor = (lang) => ({"de":["Das Jobcenter braucht Ihren Weiterbewilligungsantrag.","Unterschreiben Sie die Antwort und senden Sie sie per E-Mail."],"ar":["يحتاج مركز العمل إلى طلب الاستمرار الخاص بك.","وقّع الرد وأرسله بالبريد الإلكتروني."],"en":["The Jobcenter needs your application for continued payments.","Sign the reply and send it by e-mail."],"uk":["Джобцентру потрібна ваша заява на продовження.","Підпишіть відповідь і надішліть її поштою."]})[lang];
const draftFor = (lang) => ({
  id: 1, reply_needed: 'required', reason: reasonFor(lang)[0], next_steps: reasonFor(lang)[1], deadline: inDays(26),
  recipient_email: 'jobcenter-frankfurt@jobcenter-ge.de', subject: 'Weiterbewilligungsantrag – BG 12345BG0001234',
  letter: 'Amina Haddad\nMusterstraße 12, 60311 Frankfurt\n\nJobcenter Frankfurt\n\nFrankfurt, ' + new Date().toLocaleDateString('de-DE') + '\n\nWeiterbewilligungsantrag\n\nSehr geehrte Damen und Herren,\nhiermit beantrage ich die Weiterbewilligung des Bürgergeldes ab März.\n\nMit freundlichen Grüßen\nAmina Haddad',
  form_fields: [], attachments: [], missing: [], needs_signature: true, send_by: 'email',
});
const mocksFor = (lang) => ({
  'customer/documents/1/questions': { data: [{ id: 1, question: qaFor(lang)[0], answer: qaFor(lang)[1], created_at: inDays(0) }] },
  'customer/documents/1/draft': { data: draftFor(lang) },
  'auth/me': { data: profile },
  'profile': { data: profile },
  'customer/dashboard': { data: { summary: { total_bookings: 3, upcoming: 1, completed: 2, open_payments: 0 }, profile, upcoming_bookings: [] } },
  'customer/bookings': { data: [] },
  'customer/notifications': { data: [] },
  'customer/subscription': { data: { active: true, status: 'active', price: 6.99, used: 4, limit: 50, free: false, plan: 'silver', questions_used: 3, questions_limit: 20, plans: [{ key: 'basic', price: 6.99, questions: 10 }, { key: 'silver', price: 11.99, questions: 20 }, { key: 'unlimited', price: 17.99, questions: null }] } },
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
    // Every letter has the same answered question and prepared reply
    const perDoc = path.match(/^customer\/documents\/\d+\/(draft|questions)$/);
    if (perDoc) return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(mocks[`customer/documents/1/${perDoc[1]}`]) });
    const key = Object.keys(mocks).sort((a, b) => b.length - a.length).find((k) => path === k || path.startsWith(k + '/'));
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(key ? mocks[key] : { data: [] }) });
  });

  const shot = async (name) => { await page.waitForTimeout(2500); await page.screenshot({ path: `${out}/${locale}-${name}.png` }); console.log('shot', locale, name); };
  const go = async (route) => { try { await page.goto(`${base}/#${route}`, { waitUntil: 'networkidle', timeout: 60000 }); } catch { /* keep going */ } await page.waitForTimeout(4000); };

  await go('/documents');
  // EXPLORE=1: screenshots every 500 px down "My file", to find the scroll steps below
  if (process.env.EXPLORE) {
    await page.mouse.move(195, 500);
    for (let i = 0; i < 9; i++) { await shot(`explore-${i * 500}`); await page.mouse.wheel(0, 500); }
    await ctx.close();
    continue;
  }
  await shot('documents');                       // upload card + AI card
  // Scroll steps as in EXPLORE=1 (each step = one 500 wheel event)
  await page.mouse.move(195, 500);
  const down = async (steps) => { for (let i = 0; i < Math.abs(steps); i++) { await page.mouse.wheel(0, Math.sign(steps) * 500); await page.waitForTimeout(120); } };
  await down(Number(process.env.REMINDER_STEPS || 8));
  await shot('reminders');                       // reminders
  await down(Number(process.env.FOLDER_STEPS || 3));
  await shot('recent');                          // folders
  // Open the Jobcenter letter from the "Ask the AI" card
  await go('/documents');
  await page.mouse.click(195, Number(process.env.LETTER_Y || 571));
  await shot('detail');                          // top of the letter: summary
  await page.mouse.move(195, 500);
  await down(Number(process.env.REPLY_STEPS || 3));
  await shot('reply');                           // the prepared reply
  await down(Number(process.env.ASK_STEPS || 6));
  await shot('ask');                             // questions to the AI
  await ctx.close();
}
await browser.close();
