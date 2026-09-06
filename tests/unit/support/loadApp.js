// Loads the real, unmodified data.js + app.js into the current (jsdom) global
// context via vm.runInThisContext — the same way a browser <script> tag would,
// so tests exercise the exact code that ships, with no test-only exports added
// to production files.
//
// Because these are classic (non-module) scripts, top-level `function`
// declarations become properties of the shared global object automatically.
// Top-level `const`/`let` (PLAN_DATA, STORAGE, etc.) do not — those are bridged
// onto `globalThis.__APP__` by a small trailer snippet run in the same vm
// context, so they stay reachable by name across the const/let restriction.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const BRIDGED_CONSTS = [
  'PLAN_DATA', 'WEEKLY_SCHEDULE', 'WALKING_PROGRESSION_NOTE', 'EXERCISE_VIDEO_QUERIES',
  'STORAGE', 'DAY_ORDER', 'WEEKDAY_NUM', 'CHECK_SVG', 'PLAY_SVG',
];

let loaded = false;

export function loadApp() {
  if (loaded) return globalThis.__APP__;
  const dataSrc = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

  vm.runInThisContext(dataSrc, { filename: path.join(ROOT, 'data.js') });
  vm.runInThisContext(appSrc, { filename: path.join(ROOT, 'app.js') });
  const names = BRIDGED_CONSTS.join(', ');
  vm.runInThisContext(
    `globalThis.__APP__ = { ${names} };\n` +
      BRIDGED_CONSTS.map((n) => `globalThis.${n} = ${n};`).join('\n') +
      // `selectedDayKey` is a module-level `let` with no setter of its own;
      // tests need to reset it between cases so the day-chip selection from
      // one test doesn't leak into the next.
      `\nglobalThis.__resetSelectedDay = () => { selectedDayKey = null; };`,
    { filename: 'bridge.js' }
  );

  loaded = true;
  return globalThis.__APP__;
}

export function loadIndexHtmlBody() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const match = html.match(/<body>([\s\S]*)<\/body>/);
  return match[1];
}
