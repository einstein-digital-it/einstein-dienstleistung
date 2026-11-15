// Renders the app intro video (video.html) frame by frame and encodes one MP4 per language.
// Usage: node render.mjs <shots-dir> <out-dir> [langs]   e.g. node render.mjs ./shots ../../front_end/public/video de,ar
// Needs: playwright (chromium) and ffmpeg-static (or FFMPEG=path/to/ffmpeg).
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TEXTS, SCREEN_LOCALE } from './texts.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.resolve(process.argv[2] || 'shots');
const outDir = path.resolve(process.argv[3] || 'out');
const langs = (process.argv[4] || 'de,ar,en,tr,es,uk').split(',');
const ffmpeg = process.env.FFMPEG || require('ffmpeg-static');
const FPS = 25;
fs.mkdirSync(outDir, { recursive: true });

const dataUrl = (file) => `data:image/${path.extname(file).slice(1)};base64,${fs.readFileSync(file).toString('base64')}`;
const logo = dataUrl(path.resolve(here, '../../front_end/public/brand/einstein-mark.png'));

// EDGE=1 uses the installed Microsoft Edge (when Playwright's own Chromium cannot start)
const browser = await chromium.launch(process.env.EDGE ? { channel: 'msedge', headless: false, args: ['--headless=new'] } : {});
for (const lang of langs) {
  const screenLang = SCREEN_LOCALE[lang];
  const shots = {};
  for (const name of ['documents', 'recent', 'detail', 'reminders', 'services']) {
    const file = path.join(shotsDir, `${screenLang}-${name}.png`);
    if (!fs.existsSync(file)) throw new Error(`missing screenshot ${file}`);
    shots[name] = dataUrl(file);
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(path.join(here, 'video.html')).href);
  await page.evaluate((cfg) => window.setup(cfg), { texts: TEXTS[lang], rtl: lang === 'ar', shots, logo });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const duration = await page.evaluate(() => window.DURATION);

  const frames = fs.mkdtempSync(path.join(outDir, `frames-${lang}-`));
  const total = Math.round(duration * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.setTime(t), i / FPS);
    await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 90 });
    if (i % 125 === 0) console.log(lang, `${i}/${total}`);
  }
  // Poster: the intro frame with everything visible
  await page.evaluate(() => window.setTime(2));
  await page.screenshot({ path: path.join(outDir, `app-intro-${lang}.jpg`), type: 'jpeg', quality: 82 });
  await page.close();

  execFileSync(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.jpg'),
    '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    path.join(outDir, `app-intro-${lang}.mp4`),
  ], { stdio: 'ignore' });
  fs.rmSync(frames, { recursive: true, force: true });
  console.log('done', lang, `${(fs.statSync(path.join(outDir, `app-intro-${lang}.mp4`)).size / 1e6).toFixed(1)} MB`);
}
await browser.close();
