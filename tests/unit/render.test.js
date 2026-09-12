import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { loadApp, loadIndexHtmlBody } from './support/loadApp.js';

beforeAll(() => loadApp());

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = loadIndexHtmlBody();
  globalThis.__resetSelectedDay();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function click(el) {
  el.dispatchEvent(new window.Event('click', { bubbles: true }));
}

describe('renderAll — default state (fresh install)', () => {
  it('opens straight onto Week 1 with no settings gate', () => {
    vi.setSystemTime(new Date(2026, 8, 8)); // Tuesday
    initNav();
    initSettings();
    renderAll();

    expect(document.getElementById('header-sub').textContent).toBe('Week 1 of 24 — Foundation');
    const hero = document.getElementById('today-hero');
    expect(hero.querySelector('h2').textContent).toBe('Phase 1 of 6');
    expect(document.getElementById('settings-modal').hidden).toBe(true);
  });

  it('renders a day chip per DAY_ORDER entry and a generic conditioning card for the default day', () => {
    vi.setSystemTime(new Date(2026, 8, 6)); // Sunday
    renderAll();
    const chips = document.querySelectorAll('#today-day-select .day-chip');
    expect(chips.length).toBe(DAY_ORDER.length);
    expect(document.getElementById('today-workout').querySelector('h3').textContent).toBe('Easy Conditioning');
  });
});

describe('week completion & catch-up', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 8, 8)); // Tuesday, week 1 (default) — no day is generic in Phase 1
    renderAll();
  });

  function markDayComplete(dayLabel) {
    const chips = [...document.querySelectorAll('#today-day-select .day-chip')];
    click(chips.find((c) => c.textContent.startsWith(dayLabel)));
    const rows = [...document.querySelectorAll('#today-workout .exercise-row')];
    click(rows[rows.length - 1].querySelector('.exercise-check')); // the "Session complete" row
  }

  it('marks the day chip done once that session is checked complete', () => {
    markDayComplete('Tuesday');
    const chip = [...document.querySelectorAll('#today-day-select .day-chip')].find((c) => c.textContent.startsWith('Tuesday'));
    expect(chip.classList.contains('done')).toBe(true);
  });

  it('shows a live progress readout and a manual skip while the week is unfinished', () => {
    markDayComplete('Tuesday');
    const hero = document.getElementById('today-hero');
    expect(hero.textContent).toContain('1 of 4 sessions done this week');
    const skipBtn = [...hero.querySelectorAll('button')].find((b) => b.textContent.includes('Skip to next week'));
    expect(skipBtn).toBeTruthy();
    click(skipBtn);
    expect(getCurrentWeek()).toBe(2);
  });

  it('offers a "start next week" CTA once all four sessions are done, and advances on click', () => {
    ['Tuesday', 'Wednesday', 'Saturday', 'Sunday'].forEach(markDayComplete);
    const hero = document.getElementById('today-hero');
    const startBtn = [...hero.querySelectorAll('button')].find((b) => b.textContent.includes('Week complete'));
    expect(startBtn).toBeTruthy();
    click(startBtn);
    expect(getCurrentWeek()).toBe(2);
    expect(document.getElementById('header-sub').textContent).toContain('Week 2 of 24');
  });

  it('shows a plan-complete message instead of an advance button once week 24 is finished', () => {
    safeSet(STORAGE.currentWeek, '24');
    globalThis.__resetSelectedDay();
    renderAll();
    ['Tuesday', 'Wednesday', 'Saturday', 'Sunday'].forEach(markDayComplete);
    const hero = document.getElementById('today-hero');
    expect(hero.textContent).toContain('Plan complete');
    expect([...hero.querySelectorAll('button')].some((b) => b.textContent.includes('Week complete'))).toBe(false);
  });
});

describe('renderAll — on a chosen week', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 8, 8)); // Tuesday
    safeSet(STORAGE.currentWeek, '6');
    renderAll();
  });

  it('shows phase/week info and a progress bar', () => {
    const week = getCurrentWeek();
    expect(document.getElementById('header-sub').textContent).toContain(`Week ${week} of 24`);
    const hero = document.getElementById('today-hero');
    expect(hero.querySelector('h2').textContent).toMatch(/^Phase \d of 6/);
    const fill = hero.querySelector('.progress-fill');
    expect(fill.getAttribute('style')).toContain(`${(week / 24) * 100}%`);
  });

  it('switching the day chip re-renders the workout for that day, including how-to links', () => {
    const chips = [...document.querySelectorAll('#today-day-select .day-chip')];
    const saturdayChip = chips.find((c) => c.textContent.startsWith('Saturday'));
    click(saturdayChip);

    const workout = document.getElementById('today-workout');
    const rows = workout.querySelectorAll('.exercise-row');
    const week = getCurrentWeek();
    const phase = getPhaseForWeek(week);
    expect(rows.length).toBe(phase.days.saturday.exercises.length + 1); // + session-complete row
    const link = workout.querySelector('.howto-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('toggling an exercise checkbox persists to the session and flips row/box classes', () => {
    const workout = document.getElementById('today-workout');
    const firstRow = workout.querySelector('.exercise-row');
    const box = firstRow.querySelector('.exercise-check');

    expect(box.classList.contains('checked')).toBe(false);
    click(box);
    expect(box.classList.contains('checked')).toBe(true);
    expect(firstRow.classList.contains('done')).toBe(true);

    click(box);
    expect(box.classList.contains('checked')).toBe(false);
    expect(firstRow.classList.contains('done')).toBe(false);
  });

  it('the session-complete row toggles independently of exercise rows', () => {
    const workout = document.getElementById('today-workout');
    const rows = [...workout.querySelectorAll('.exercise-row')];
    const completeRow = rows[rows.length - 1];
    expect(completeRow.querySelector('.exercise-name').textContent).toBe('Session complete');
    const box = completeRow.querySelector('.exercise-check');
    click(box);
    expect(completeRow.classList.contains('done')).toBe(true);
  });
});

describe('Phase 1 Wednesday — mobility list', () => {
  it('renders the mobility list items for the structured (non-generic) Wednesday day', () => {
    vi.setSystemTime(new Date(2026, 0, 6));
    // Week 1 (default, nothing stored) is Phase 1, where Wednesday is structured.
    renderAll();
    const chips = [...document.querySelectorAll('#today-day-select .day-chip')];
    click(chips.find((c) => c.textContent.startsWith('Wednesday')));
    const workout = document.getElementById('today-workout');
    const items = workout.querySelectorAll('.mobility-list li');
    expect(items.length).toBe(PLAN_DATA.phases[0].days.wednesday.mobility.length);
  });
});

describe('Phase 4 — the "Goal" callout on strength days', () => {
  it('shows the phase-level goal note under Tuesday and Saturday', () => {
    vi.setSystemTime(new Date(2027, 0, 5));
    safeSet(STORAGE.currentWeek, '14'); // Phase 4: Progressive strength
    renderAll();
    const workout = document.getElementById('today-workout');
    expect(workout.querySelector('.warn-box strong').textContent).toBe('Goal');
  });
});

describe('generic conditioning day (Wednesday/Sunday)', () => {
  it('renders a walking session checkable row', () => {
    vi.setSystemTime(new Date(2026, 8, 9)); // Wednesday
    safeSet(STORAGE.currentWeek, '6'); // Phase 2, where Wednesday is generic
    renderAll();
    const workout = document.getElementById('today-workout');
    expect(workout.querySelector('h3').textContent).toBe('Conditioning');
    const row = workout.querySelector('.exercise-row');
    expect(row.querySelector('.exercise-name').textContent).toBe('Walking session');
    click(row.querySelector('.exercise-check'));
    expect(row.classList.contains('done')).toBe(true);
  });
});

describe('bottom nav', () => {
  it('switches the active view and nav button, and renders the chart when Track is opened', () => {
    initNav();
    renderAll();
    const trackBtn = document.querySelector('#bottom-nav button[data-view="track"]');
    click(trackBtn);
    expect(document.getElementById('view-track').classList.contains('active')).toBe(true);
    expect(document.getElementById('view-today').classList.contains('active')).toBe(false);
    expect(trackBtn.classList.contains('active')).toBe(true);
    expect(document.getElementById('weight-chart').querySelector('.empty-state')).not.toBeNull();
  });
});

describe('settings modal', () => {
  beforeEach(() => {
    initSettings();
    renderAll();
  });

  it('prefills the field from storage and closes via the close button', () => {
    safeSet(STORAGE.currentWeek, '3');
    click(document.getElementById('settings-btn'));
    expect(document.getElementById('current-week-input').value).toBe('3');

    click(document.getElementById('settings-close'));
    expect(document.getElementById('settings-modal').hidden).toBe(true);
  });

  it('closes when clicking the backdrop itself but not when clicking inside the sheet', () => {
    click(document.getElementById('settings-btn'));
    document.querySelector('.modal-sheet').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(document.getElementById('settings-modal').hidden).toBe(false);

    document.getElementById('settings-modal').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(document.getElementById('settings-modal').hidden).toBe(true);
  });

  it('save writes the current week, clears the selected day, and re-renders', () => {
    click(document.getElementById('settings-btn'));
    document.getElementById('current-week-input').value = '9';
    click(document.getElementById('settings-save'));

    expect(safeGet(STORAGE.currentWeek)).toBe('9');
    expect(document.getElementById('settings-modal').hidden).toBe(true);
    expect(document.getElementById('header-sub').textContent).toContain('Week 9 of 24');
  });

  it('save ignores a blank field and leaves the current week unchanged', () => {
    safeSet(STORAGE.currentWeek, '9');
    click(document.getElementById('settings-btn'));
    document.getElementById('current-week-input').value = '';
    click(document.getElementById('settings-save'));

    expect(safeGet(STORAGE.currentWeek)).toBe('9');
  });

  it('reset only clears "cal." prefixed keys, and only when confirmed', () => {
    safeSet(STORAGE.currentWeek, '9');
    safeSet('unrelated.key', 'keep-me');
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    click(document.getElementById('settings-btn'));
    click(document.getElementById('settings-reset'));
    expect(safeGet(STORAGE.currentWeek)).toBe('9');

    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    click(document.getElementById('settings-reset'));
    expect(safeGet(STORAGE.currentWeek)).toBeNull();
    expect(safeGet('unrelated.key')).toBe('keep-me');
  });
});

describe('renderPlan', () => {
  beforeEach(() => {
    renderPlan();
  });

  it('renders the weekly schedule table', () => {
    const rows = document.querySelectorAll('#weekly-schedule-body tr');
    expect(rows.length).toBe(WEEKLY_SCHEDULE.length);
  });

  it('renders one accordion per phase, with the current phase open', () => {
    const accordions = document.querySelectorAll('#phase-list .phase-accordion');
    expect(accordions.length).toBe(PLAN_DATA.phases.length);
    expect(document.querySelectorAll('#phase-list .phase-accordion.open').length).toBe(1);
  });

  it('toggles open/closed when a phase head is clicked, and exercise cells carry how-to links', () => {
    const accordions = [...document.querySelectorAll('#phase-list .phase-accordion')];
    const closedAcc = accordions.find((a) => !a.classList.contains('open'));
    const head = closedAcc.querySelector('.phase-head');
    click(head);
    expect(closedAcc.classList.contains('open')).toBe(true);
    click(head);
    expect(closedAcc.classList.contains('open')).toBe(false);

    const openAcc = document.querySelector('#phase-list .phase-accordion.open');
    const link = openAcc.querySelector('.howto-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toContain('youtube.com/results');
  });
});

describe('track view — form, entry list, and chart', () => {
  beforeEach(() => {
    renderTrackForm();
    renderEntryList();
    renderChart();
  });

  it('builds one input per tracking item plus the date field', () => {
    PLAN_DATA.tracking.items.forEach((item) => {
      expect(document.getElementById('entry-' + item.key)).not.toBeNull();
    });
    expect(document.getElementById('entry-date')).not.toBeNull();
  });

  it('shows the empty state until an entry exists', () => {
    expect(document.getElementById('entry-list').querySelector('.empty-state')).not.toBeNull();
  });

  it('submitting the form saves an entry and re-renders the list', () => {
    document.getElementById('entry-date').value = '2026-09-01';
    document.getElementById('entry-bodyWeight').value = '99.5';
    document.getElementById('entry-row').value = 'inverted row x 8';
    document.getElementById('track-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ date: '2026-09-01', bodyWeight: 99.5, row: 'inverted row x 8' });
    expect(entries[0].waist).toBeUndefined();

    const listRow = document.querySelector('#entry-list .entry-row');
    expect(listRow.querySelector('.entry-date').textContent).toBe('2026-09-01');
  });

  it('deleting an entry only happens when the user confirms', () => {
    saveEntry({ id: '2026-09-01', date: '2026-09-01', bodyWeight: 99 });
    renderEntryList();
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    click(document.querySelector('.entry-del'));
    expect(getEntries()).toHaveLength(1);

    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    click(document.querySelector('.entry-del'));
    expect(getEntries()).toHaveLength(0);
  });

  it('renders a trend line with a point per body-weight entry once there are 2+', () => {
    saveEntry({ id: '2026-09-01', date: '2026-09-01', bodyWeight: 100 });
    saveEntry({ id: '2026-09-08', date: '2026-09-08', bodyWeight: 98 });
    renderChart();
    const circles = document.querySelectorAll('#weight-chart circle');
    expect(circles.length).toBe(2);
    click(circles[0]);
    const tooltip = document.querySelector('.chart-tooltip');
    expect(tooltip.style.display).toBe('block');
    expect(tooltip.textContent).toContain('100 kg');
  });
});

describe('renderGuide', () => {
  beforeEach(() => renderGuide());

  it('renders overview paragraphs and the caveat box', () => {
    const ov = document.getElementById('guide-overview');
    expect(ov.querySelectorAll('p.overview-p').length).toBe(PLAN_DATA.overview.intro.length);
    expect(ov.querySelector('.warn-box strong').textContent).toBe('Important caveat');
  });

  it('renders one chain box per progression chain', () => {
    expect(document.querySelectorAll('#guide-progression .chain-box').length).toBe(
      PLAN_DATA.progressionRule.chains.length
    );
  });

  it('renders the walking progression table', () => {
    expect(document.querySelectorAll('#guide-walking tbody tr').length).toBe(
      PLAN_DATA.walkingGuide.progression.length
    );
  });

  it('renders one reference link per reference, opening in a new tab safely', () => {
    const links = document.querySelectorAll('#guide-refs a');
    expect(links.length).toBe(PLAN_DATA.references.length);
    links.forEach((a) => {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});
