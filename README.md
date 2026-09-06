# Calisthenics Plan

A mobile-friendly web app for the 6-month calisthenics & strength plan (`Rick_6-Month_Calisthenics_Plan.pdf`). No build step — plain HTML/CSS/JS — deployable straight to GitHub Pages.

## Features

- **Today** — opens on today's scheduled workout (Tue/Wed/Sat/Sun), computed from a start date you set. Check off exercises as you go; check-offs are saved per calendar date.
- **Plan** — the full 6-phase, 24-week plan in one place, with the current phase auto-expanded.
- **Track** — logs the six things the plan asks you to track (body weight, waist, push-up best set, squat, row/pull-up, walking minutes), plus a body-weight trend chart.
- **Guide** — the plan's philosophy, progression rule, walking guidance, weight-loss guidance, equipment list, and references.

All data is stored locally in the browser (`localStorage`) — nothing is sent anywhere. It can also be "installed" to a phone home screen as a standalone app (Add to Home Screen / Install App), via `manifest.json`.

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `calisthenics`) and push this folder to it:
   ```bash
   cd /home/rick/Documents/code/calisthenics
   git init
   git add .
   git commit -m "Initial calisthenics plan app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/calisthenics.git
   git push -u origin main
   ```
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. After a minute, the app will be live at `https://<your-username>.github.io/calisthenics/`.

Open that URL on your phone and use "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome) to use it like a native app.

## Local testing

Since it's a project site, test it from a subpath to catch any path issues before deploying:
```bash
cd /home/rick/Documents/code   # parent of this folder
python3 -m http.server 8000
# then open http://localhost:8000/calisthenics/
```

## Automated tests

Unit tests (Vitest + jsdom) and end-to-end tests (Playwright) live in `tests/`. They require Node.js; run once:
```bash
npm install
npx playwright install chromium
```
Then:
```bash
npm test              # unit tests
npm run test:coverage # unit tests with a coverage report (app.js, threshold 80%)
npm run test:e2e      # end-to-end tests against a local server
```
These dev dependencies aren't part of the deployed app — GitHub Pages only ever serves the plain HTML/CSS/JS files.

## Editing the plan

All workout content lives in `data.js`, transcribed from the PDF. Edit it directly to adjust exercises, sets/reps, or guidance text — the app reads from it at runtime.
