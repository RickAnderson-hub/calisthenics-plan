/* Rick's Calisthenics Plan — app logic. No build step, no framework. */

const STORAGE = {
  startDate: 'cal.startDate',
  weekOverride: 'cal.weekOverride',
  sessionPrefix: 'cal.session.', // + isoDate
  tracking: 'cal.tracking',
};

const DAY_ORDER = ['tuesday', 'wednesday', 'saturday', 'sunday'];
const WEEKDAY_NUM = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

// ---------- storage helpers (private mode / disabled storage safe) ----------
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); return true; } catch (e) { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* noop */ }
}
function getJSON(key, fallback) {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}
function setJSON(key, val) { return safeSet(key, JSON.stringify(val)); }

// ---------- date helpers ----------
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function todayMidnight() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function fmtShort(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function getStartDate() {
  const raw = safeGet(STORAGE.startDate);
  return raw ? parseISO(raw) : null;
}
function getWeekOverride() {
  const raw = safeGet(STORAGE.weekOverride);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function computeCurrentWeek() {
  const override = getWeekOverride();
  const start = getStartDate();
  if (!start) return { week: 1, hasStart: false, overridden: !!override };
  if (override) return { week: clamp(override, 1, 24), hasStart: true, overridden: true };
  const diffDays = Math.floor((todayMidnight() - start) / 86400000);
  const week = clamp(Math.floor(diffDays / 7) + 1, 1, 24);
  return { week, hasStart: true, overridden: false };
}
function weekStartDate(week) {
  const start = getStartDate() || todayMidnight();
  return addDays(start, (week - 1) * 7);
}
function dateForWeekday(week, weekdayKey) {
  const targetNum = WEEKDAY_NUM[weekdayKey];
  const ws = weekStartDate(week);
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i);
    if (d.getDay() === targetNum) return d;
  }
  return ws;
}
function getPhaseForWeek(week) {
  return PLAN_DATA.phases.find(p => week >= p.weekRange[0] && week <= p.weekRange[1]) || PLAN_DATA.phases[0];
}

// ---------- session (checkbox) storage ----------
function getSession(iso) { return getJSON(STORAGE.sessionPrefix + iso, {}); }
function setSession(iso, obj) { setJSON(STORAGE.sessionPrefix + iso, obj); }
function toggleExerciseDone(iso, key) {
  const s = getSession(iso);
  s[key] = !s[key];
  setSession(iso, s);
  return s[key];
}

// ---------- tracking entries ----------
function getEntries() {
  return getJSON(STORAGE.tracking, []).sort((a, b) => a.date.localeCompare(b.date));
}
function saveEntry(entry) {
  const entries = getJSON(STORAGE.tracking, []);
  const existingIdx = entries.findIndex(e => e.date === entry.date);
  if (existingIdx >= 0) entries[existingIdx] = { ...entries[existingIdx], ...entry };
  else entries.push(entry);
  setJSON(STORAGE.tracking, entries);
}
function deleteEntry(id) {
  const entries = getJSON(STORAGE.tracking, []).filter(e => e.id !== id);
  setJSON(STORAGE.tracking, entries);
}

// ---------- svg icon for checkmark ----------
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14l11-7z"/></svg>';

// ---------- exercise video links ----------
function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
function exerciseVideoLink(name) {
  const query = EXERCISE_VIDEO_QUERIES[name];
  if (!query) return null;
  return el('a', {
    class: 'video-link',
    href: youtubeSearchUrl(query),
    target: '_blank',
    rel: 'noopener noreferrer',
    html: PLAY_SVG + '<span>How to</span>',
    'aria-label': `Watch ${name} tutorial videos on YouTube`,
  });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('data-')) node.setAttribute(k, v);
    else node[k] = v;
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

// ================= STATE =================
let selectedDayKey = null; // set on init

// ================= NAV =================
function initNav() {
  document.querySelectorAll('#bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('#bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'track') renderChart();
}

// ================= TODAY VIEW =================
function defaultSelectedDay(week, overridden) {
  const today = todayMidnight();
  const isRealCurrentWeek = !overridden;
  if (isRealCurrentWeek) {
    const todayNum = today.getDay();
    const match = DAY_ORDER.find(k => WEEKDAY_NUM[k] === todayNum);
    if (match) return match;
  }
  return 'tuesday';
}

function renderToday() {
  const { week, hasStart, overridden } = computeCurrentWeek();
  const phase = getPhaseForWeek(week);
  const sub = hasStart ? `Week ${week} of 24 — ${phase.name}` : 'Set a start date to begin';
  document.getElementById('header-sub').textContent = sub;

  if (!selectedDayKey) selectedDayKey = defaultSelectedDay(week, overridden);

  const hero = document.getElementById('today-hero');
  hero.innerHTML = '';
  if (!hasStart) {
    hero.appendChild(el('h2', {}, 'Get started'));
    hero.appendChild(el('div', { class: 'phase-line' }, "Pick a plan start date in Settings and this screen will always open on today's workout."));
    const btn = el('button', { class: 'btn', style: 'margin-top:12px;background:var(--accent-ink);color:var(--accent);' }, 'Open settings');
    btn.addEventListener('click', openSettings);
    hero.appendChild(btn);
  } else {
    hero.appendChild(el('h2', {}, `Phase ${phase.id} of 6${overridden ? ' · manual' : ''}`));
    hero.appendChild(el('div', { class: 'week-line' }, `Week ${week} of 24`));
    hero.appendChild(el('div', { class: 'phase-line' }, `${phase.name} — ${phase.goal}`));
    const track = el('div', { class: 'progress-track' });
    track.appendChild(el('div', { class: 'progress-fill', style: `width:${(week / 24) * 100}%` }));
    hero.appendChild(track);
  }

  // day chips
  const chipWrap = document.getElementById('today-day-select');
  chipWrap.innerHTML = '';
  DAY_ORDER.forEach(dayKey => {
    const d = dateForWeekday(week, dayKey);
    const label = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
    const chip = el('button', { class: 'day-chip' + (dayKey === selectedDayKey ? ' active' : '') }, `${label} · ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);
    chip.addEventListener('click', () => { selectedDayKey = dayKey; renderToday(); });
    chipWrap.appendChild(chip);
  });

  renderWorkoutFor(phase, week, selectedDayKey, document.getElementById('today-workout'), true);
}

function genericConditioningNode(dayKey, isoStr, doneKey) {
  const wrap = el('div', { class: 'card' });
  const label = dayKey === 'wednesday' ? WALKING_GUIDE_LABEL('Wednesday', '30 → 45 min') : WALKING_GUIDE_LABEL('Sunday', '40 → 60 min');
  wrap.appendChild(el('h3', {}, dayKey === 'wednesday' ? 'Conditioning' : 'Easy Conditioning'));
  wrap.appendChild(el('p', { class: 'overview-p' }, label));
  wrap.appendChild(el('p', { class: 'overview-p' }, WALKING_PROGRESSION_NOTE));
  wrap.appendChild(checkableRow('Walking session', doneKey, isoStr));
  return wrap;
}
function WALKING_GUIDE_LABEL(day, range) {
  return `${day}: progressing ${range} (see the Walking card in the Guide tab for the full plan).`;
}

function checkableRow(label, key, isoStr) {
  const session = getSession(isoStr);
  const doneNow = !!session[key];
  const row = el('div', { class: 'exercise-row' + (doneNow ? ' done' : '') });
  const box = el('button', { class: 'exercise-check' + (doneNow ? ' checked' : ''), html: CHECK_SVG, 'aria-label': 'Mark complete' });
  box.addEventListener('click', () => {
    const nowDone = toggleExerciseDone(isoStr, key);
    box.classList.toggle('checked', nowDone);
    row.classList.toggle('done', nowDone);
  });
  row.appendChild(box);
  row.appendChild(el('div', { class: 'exercise-info' }, el('div', { class: 'exercise-name' }, label)));
  return row;
}

function renderWorkoutFor(phase, week, dayKey, container, interactive) {
  container.innerHTML = '';
  const day = phase.days[dayKey];
  if (!day) return;
  const isoStr = isoDate(dateForWeekday(week, dayKey));

  if (day.generic) {
    container.appendChild(interactive ? genericConditioningNode(dayKey, isoStr, 'walk') : staticGenericNode(dayKey));
    return;
  }

  const card = el('div', { class: 'card' });
  card.appendChild(el('h3', {}, day.title));
  if (day.warmup) card.appendChild(el('p', { class: 'overview-p' }, `Warm-up: ${day.warmup}`));
  if (day.walk) card.appendChild(el('p', { class: 'overview-p' }, day.walk));

  if (day.exercises) {
    day.exercises.forEach((ex, idx) => {
      const key = `${dayKey}-${idx}-${ex.name}`;
      const session = getSession(isoStr);
      const doneNow = interactive && !!session[key];
      const row = el('div', { class: 'exercise-row' + (doneNow ? ' done' : '') });
      if (interactive) {
        const box = el('button', { class: 'exercise-check' + (doneNow ? ' checked' : ''), html: CHECK_SVG, 'aria-label': 'Mark complete' });
        box.addEventListener('click', () => {
          const nowDone = toggleExerciseDone(isoStr, key);
          box.classList.toggle('checked', nowDone);
          row.classList.toggle('done', nowDone);
        });
        row.appendChild(box);
      }
      const info = el('div', { class: 'exercise-info' });
      const nameLine = el('div', { class: 'exercise-name' });
      if (ex.pair) nameLine.appendChild(el('span', { class: 'pair-tag' }, ex.pair));
      nameLine.appendChild(document.createTextNode(ex.name));
      info.appendChild(nameLine);
      info.appendChild(el('div', { class: 'exercise-meta' }, `${ex.sets} × ${ex.reps}`));
      const link = exerciseVideoLink(ex.name);
      if (link) info.appendChild(link);
      row.appendChild(info);
      card.appendChild(row);
    });
  }

  if (day.mobility) {
    const list = el('ul', { class: 'mobility-list' });
    day.mobility.forEach(m => list.appendChild(el('li', {}, m)));
    card.appendChild(list);
  }
  if (day.optional) card.appendChild(el('p', { class: 'overview-p' }, day.optional));
  if (day.note) card.appendChild(el('div', { class: 'note-box' }, day.note));
  if (interactive && (day.exercises || day.mobility || day.optional)) {
    card.appendChild(checkableRow('Session complete', `${dayKey}-complete`, isoStr));
  }
  container.appendChild(card);

  if (phase.days.goal && (dayKey === 'tuesday' || dayKey === 'saturday')) {
    const goalCard = el('div', { class: 'warn-box' });
    goalCard.appendChild(el('strong', {}, 'Goal'));
    goalCard.appendChild(document.createTextNode(phase.days.goal));
    container.appendChild(goalCard);
  }
}

function staticGenericNode(dayKey) {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h3', {}, dayKey === 'wednesday' ? 'Conditioning' : 'Easy Conditioning'));
  wrap.appendChild(el('p', { class: 'overview-p' }, 'Predominantly walking — see the Walking card in the Guide tab for the weekly progression.'));
  return wrap;
}

// ================= PLAN VIEW =================
function renderPlan() {
  const body = document.getElementById('weekly-schedule-body');
  body.innerHTML = '';
  WEEKLY_SCHEDULE.forEach(row => {
    body.appendChild(el('tr', {}, [
      el('td', {}, row.day),
      el('td', {}, row.session),
      el('td', {}, row.focus),
    ]));
  });

  const { week } = computeCurrentWeek();
  const currentPhase = getPhaseForWeek(week);
  const list = document.getElementById('phase-list');
  list.innerHTML = '';
  PLAN_DATA.phases.forEach(phase => {
    const isCurrent = phase.id === currentPhase.id;
    const acc = el('div', { class: 'phase-accordion' + (isCurrent ? ' open' : '') });
    const head = el('button', { class: 'phase-head' + (isCurrent ? ' current' : '') });
    const left = el('div', {}, [
      el('div', { class: 'phase-head-title' }, `Phase ${phase.id} — ${phase.name}`),
      el('div', { class: 'phase-head-sub' }, `Weeks ${phase.weekRange[0]}–${phase.weekRange[1]} · ${phase.goal}`),
    ]);
    head.appendChild(left);
    head.appendChild(el('svg', { class: 'chev', html: '', viewBox: '0 0 24 24', fill: 'none' }));
    head.querySelector('svg').innerHTML = '<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    head.addEventListener('click', () => acc.classList.toggle('open'));

    const bodyEl = el('div', { class: 'phase-body' });
    if (phase.intro) bodyEl.appendChild(el('p', { class: 'overview-p' }, phase.intro));
    ['tuesday', 'saturday'].forEach(dk => {
      const day = phase.days[dk];
      if (!day) return;
      bodyEl.appendChild(el('h4', {}, day.title));
      const tableWrap = el('div', { class: 'table-wrap' });
      const table = el('table');
      const thead = el('thead');
      const headRow = el('tr');
      if (day.hasPairs) headRow.appendChild(el('th', {}, 'Pair'));
      headRow.appendChild(el('th', {}, 'Exercise'));
      headRow.appendChild(el('th', {}, 'Sets × Reps'));
      thead.appendChild(headRow);
      table.appendChild(thead);
      const tbody = el('tbody');
      day.exercises.forEach(ex => {
        const tr = el('tr');
        if (day.hasPairs) tr.appendChild(el('td', {}, ex.pair || ''));
        const nameCell = el('td', {}, ex.name);
        const link = exerciseVideoLink(ex.name);
        if (link) nameCell.appendChild(link);
        tr.appendChild(nameCell);
        tr.appendChild(el('td', {}, `${ex.sets} × ${ex.reps}`));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      bodyEl.appendChild(tableWrap);
      if (day.warmup) bodyEl.appendChild(el('p', { class: 'overview-p' }, `Warm-up: ${day.warmup}`));
      if (day.note) bodyEl.appendChild(el('div', { class: 'note-box' }, day.note));
    });
    if (phase.days.wednesday && phase.days.wednesday.mobility) {
      bodyEl.appendChild(el('h4', {}, 'Wednesday — Conditioning'));
      bodyEl.appendChild(el('p', { class: 'overview-p' }, phase.days.wednesday.walk));
      const list2 = el('ul', { class: 'mobility-list' });
      phase.days.wednesday.mobility.forEach(m => list2.appendChild(el('li', {}, m)));
      bodyEl.appendChild(list2);
    }
    if (phase.days.sunday && phase.days.sunday.walk) {
      bodyEl.appendChild(el('h4', {}, 'Sunday — Easy Conditioning'));
      bodyEl.appendChild(el('p', { class: 'overview-p' }, phase.days.sunday.walk));
      if (phase.days.sunday.optional) bodyEl.appendChild(el('p', { class: 'overview-p' }, phase.days.sunday.optional));
    }
    if (phase.days.goal) {
      const goalCard = el('div', { class: 'warn-box' });
      goalCard.appendChild(el('strong', {}, 'Goal'));
      goalCard.appendChild(document.createTextNode(phase.days.goal));
      bodyEl.appendChild(goalCard);
    }
    acc.appendChild(head);
    acc.appendChild(bodyEl);
    list.appendChild(acc);
  });
}

// ================= TRACK VIEW =================
function renderTrackForm() {
  const form = document.getElementById('track-form');
  form.innerHTML = '';
  const dateField = el('div', { class: 'field' }, [
    el('label', {}, 'Date'),
    el('input', { type: 'date', id: 'entry-date', value: isoDate(todayMidnight()) }),
  ]);
  form.appendChild(dateField);

  const TEXT_PLACEHOLDERS = { squat: 'e.g. goblet squat 16kg × 8', row: 'e.g. inverted row × 8' };
  PLAN_DATA.tracking.items.forEach(item => {
    const inputType = (item.unit === 'text') ? 'text' : 'number';
    const placeholder = item.unit !== 'text' ? item.unit : (TEXT_PLACEHOLDERS[item.key] || '');
    const input = el('input', { type: inputType, id: 'entry-' + item.key, placeholder });
    if (inputType === 'number') input.step = 'any';
    form.appendChild(el('div', { class: 'field' }, [
      el('label', {}, item.label),
      el('span', { class: 'hint' }, item.hint),
      input,
    ]));
  });

  const saveBtn = el('button', { type: 'submit', class: 'btn' }, 'Save entry');
  form.appendChild(saveBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('entry-date').value || isoDate(todayMidnight());
    const entry = { id: date, date };
    PLAN_DATA.tracking.items.forEach(item => {
      const v = document.getElementById('entry-' + item.key).value;
      if (v !== '') entry[item.key] = (item.unit === 'text') ? v : Number(v);
    });
    saveEntry(entry);
    renderEntryList();
    renderChart();
    form.reset();
    document.getElementById('entry-date').value = isoDate(todayMidnight());
  });
}

function renderEntryList() {
  const wrap = document.getElementById('entry-list');
  wrap.innerHTML = '';
  const entries = getEntries().slice().reverse();
  if (!entries.length) {
    wrap.appendChild(el('div', { class: 'empty-state' }, 'No entries yet. Log your first one above.'));
    return;
  }
  entries.forEach(entry => {
    const parts = [];
    PLAN_DATA.tracking.items.forEach(item => {
      if (entry[item.key] !== undefined) {
        const unit = item.unit === 'text' ? '' : ` ${item.unit}`;
        parts.push(`${item.label}: ${entry[item.key]}${unit}`);
      }
    });
    const row = el('div', { class: 'entry-row' });
    row.appendChild(el('div', { class: 'entry-date' }, entry.date));
    row.appendChild(el('div', { class: 'entry-vals' }, parts.join(' · ') || '—'));
    const del = el('button', { class: 'entry-del' }, 'Delete');
    del.addEventListener('click', () => {
      if (confirm(`Delete the entry from ${entry.date}?`)) {
        deleteEntry(entry.id);
        renderEntryList();
        renderChart();
      }
    });
    row.appendChild(del);
    wrap.appendChild(row);
  });
}

function renderChart() {
  const wrap = document.getElementById('weight-chart');
  const trendNote = document.getElementById('trend-note');
  trendNote.textContent = PLAN_DATA.tracking.trendNote;
  wrap.innerHTML = '';
  const points = getEntries().filter(e => typeof e.bodyWeight === 'number');
  if (points.length < 2) {
    wrap.appendChild(el('div', { class: 'empty-state' }, 'Log at least two body-weight entries to see a trend line.'));
    return;
  }
  const W = 320, H = 140, PAD = 24;
  const weights = points.map(p => p.bodyWeight);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  const span = maxW - minW || 1;
  const xStep = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * xStep;
    const y = H - PAD - ((p.bodyWeight - minW) / span) * (H - PAD * 2);
    return { x, y, entry: p };
  });
  const pathD = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ' ' + c.y.toFixed(1)).join(' ');

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Body weight trend line chart');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'var(--accent)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  const tooltip = el('div', { class: 'chart-tooltip note-box', style: 'display:none;position:absolute;pointer-events:none;' });

  coords.forEach(c => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', c.x.toFixed(1));
    circle.setAttribute('cy', c.y.toFixed(1));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', 'var(--accent)');
    circle.style.cursor = 'pointer';
    const title = document.createElementNS(svgNS, 'title');
    title.textContent = `${c.entry.date}: ${c.entry.bodyWeight} kg`;
    circle.appendChild(title);
    circle.addEventListener('click', () => {
      tooltip.textContent = `${c.entry.date} — ${c.entry.bodyWeight} kg`;
      tooltip.style.display = 'block';
      tooltip.style.left = ((c.x / W) * 100) + '%';
      tooltip.style.top = Math.max(0, c.y - 34) + 'px';
    });
    svg.appendChild(circle);
  });

  const chartInner = el('div', { style: 'position:relative;' }, svg);
  chartInner.appendChild(tooltip);
  wrap.appendChild(chartInner);

  const firstLast = el('div', { class: 'exercise-meta', style: 'display:flex;justify-content:space-between;margin-top:2px;' }, [
    el('span', {}, `${points[0].bodyWeight} kg on ${points[0].date}`),
    el('span', {}, `${points[points.length - 1].bodyWeight} kg on ${points[points.length - 1].date}`),
  ]);
  wrap.appendChild(firstLast);
}

// ================= GUIDE VIEW =================
function renderGuide() {
  const ov = document.getElementById('guide-overview');
  ov.innerHTML = '';
  PLAN_DATA.overview.intro.forEach(p => ov.appendChild(el('p', { class: 'overview-p' }, p)));
  const caveat = el('div', { class: 'warn-box' });
  caveat.appendChild(el('strong', {}, 'Important caveat'));
  caveat.appendChild(document.createTextNode(PLAN_DATA.overview.caveat));
  ov.appendChild(caveat);

  const pr = document.getElementById('guide-progression');
  pr.innerHTML = '';
  pr.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.progressionRule.intro));
  PLAN_DATA.progressionRule.chains.forEach(chain => {
    pr.appendChild(el('div', { class: 'chain-box' }, chain.join(' → ')));
  });
  pr.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.progressionRule.rule));
  pr.appendChild(el('div', { class: 'note-box' }, PLAN_DATA.progressionRule.rir));

  const wg = document.getElementById('guide-walking');
  wg.innerHTML = '';
  wg.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.walkingGuide.intro));
  const tw = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.appendChild(el('thead', {}, el('tr', {}, [el('th', {}, 'Day'), el('th', {}, 'Progression')])));
  const tbody = el('tbody');
  PLAN_DATA.walkingGuide.progression.forEach(row => {
    tbody.appendChild(el('tr', {}, [el('td', {}, row.day), el('td', {}, row.range)]));
  });
  table.appendChild(tbody);
  tw.appendChild(table);
  wg.appendChild(tw);
  wg.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.walkingGuide.extra));
  wg.appendChild(el('div', { class: 'note-box' }, PLAN_DATA.walkingGuide.consistency));

  const wl = document.getElementById('guide-weightloss');
  wl.innerHTML = '';
  wl.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.weightLoss.p1));
  wl.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.weightLoss.p2));

  const eq = document.getElementById('guide-equipment');
  eq.innerHTML = '';
  eq.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.equipment.intro));
  const grid = el('div', { class: 'equip-grid' });
  PLAN_DATA.equipment.items.forEach(item => grid.appendChild(el('div', { class: 'equip-item' }, item)));
  eq.appendChild(grid);
  eq.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.equipment.note));

  const ph = document.getElementById('guide-philosophy');
  ph.innerHTML = '';
  ph.appendChild(el('h2', {}, PLAN_DATA.philosophyChange.title));
  ph.appendChild(el('p', { class: 'overview-p' }, PLAN_DATA.philosophyChange.text));

  document.getElementById('guide-quote').textContent = PLAN_DATA.closingQuote;

  const refs = document.getElementById('guide-refs');
  refs.innerHTML = '';
  PLAN_DATA.references.forEach(r => {
    const li = el('li', {}, el('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.text));
    refs.appendChild(li);
  });
}

// ================= SETTINGS =================
function openSettings() {
  const modal = document.getElementById('settings-modal');
  document.getElementById('start-date-input').value = safeGet(STORAGE.startDate) || '';
  document.getElementById('week-override-input').value = safeGet(STORAGE.weekOverride) || '';
  modal.hidden = false;
}
function closeSettings() { document.getElementById('settings-modal').hidden = true; }

function initSettings() {
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target.id === 'settings-modal') closeSettings();
  });
  document.getElementById('settings-save').addEventListener('click', () => {
    const dateVal = document.getElementById('start-date-input').value;
    const weekVal = document.getElementById('week-override-input').value;
    if (dateVal) safeSet(STORAGE.startDate, dateVal); else safeRemove(STORAGE.startDate);
    if (weekVal) safeSet(STORAGE.weekOverride, weekVal); else safeRemove(STORAGE.weekOverride);
    selectedDayKey = null;
    closeSettings();
    renderAll();
  });
  document.getElementById('settings-reset').addEventListener('click', () => {
    if (!confirm('This clears your start date, week override, session check-offs, and tracking history on this device. Continue?')) return;
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cal.')) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) { /* noop */ }
    selectedDayKey = null;
    closeSettings();
    renderAll();
  });
}

// ================= INIT =================
function renderAll() {
  renderToday();
  renderPlan();
  renderTrackForm();
  renderEntryList();
  renderGuide();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSettings();
  renderAll();
  if (!getStartDate()) openSettings();
});
