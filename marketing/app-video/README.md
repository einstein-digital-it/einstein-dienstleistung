# App intro video

The 30-second video on the home page (`front_end/public/video/app-intro-<lang>.mp4`, poster `.jpg`),
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

`shots.mjs` taps the first folder tile and the first letter by position; if the app layout changes,
check `shots/<lang>-folder.png` and `-detail.png` and adjust the click positions (`DOC_Y`).
