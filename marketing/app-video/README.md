# App intro video

The 34-second video on the home page (`front_end/public/video/app-intro-<lang>.mp4`, poster `.jpg`),
one per website language. It shows real app screens with made-up data (no customer data).

- `texts.mjs` – headlines per language (de, ar, en, tr, es, uk). Turkish and Spanish use the English app screens.
- `video.html` – the layout and animation (1280×720, drawn frame by frame).
- `shots.mjs` – screenshots of the Flutter web build with a mocked API.
- `render.mjs` – turns `video.html` + screenshots into MP4s.

## Make it again

```bash
cd mobile/user_einstein && flutter build web --release --dart-define=EINSTEIN_API_BASE_URL=https://api.mock/api
# serve mobile/user_einstein/build/web on http://localhost:8080 (any static server)
cd marketing/app-video
npm i playwright@1.55.1 ffmpeg-static@5.2.0 && npx playwright install chromium
node shots.mjs http://localhost:8080 ./shots
node render.mjs ./shots ../../front_end/public/video        # all languages, or add e.g. "de,ar"
```

`shots.mjs` opens the Jobcenter letter from the "Ask the AI" card on My file (`LETTER_Y`, default 571;
Arabic needs `LETTER_Y=515` because its card text is longer) and scrolls in steps of one 500 wheel event
(`REMINDER_STEPS`, `FOLDER_STEPS`, `REPLY_STEPS`, `ASK_STEPS`). If the app layout changes, run `EXPLORE=1 LOCALES=de node shots.mjs …`
to get `shots/de-explore-<n>.png` every 500 and pick new steps.

Scenes (34 s): intro, upload, sorted, summary, ask the AI, reply & sign, reminders, outro (app.einsteindienstleistung.de).
