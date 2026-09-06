import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { loadApp } from './support/loadApp.js';

beforeAll(() => loadApp());

describe('date helpers', () => {
  it('isoDate formats a Date as YYYY-MM-DD, zero-padded', () => {
    expect(isoDate(new Date(2026, 8, 6))).toBe('2026-09-06');
    expect(isoDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('parseISO round-trips with isoDate', () => {
    const d = parseISO('2026-09-06');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(6);
    expect(isoDate(d)).toBe('2026-09-06');
  });

  it('addDays adds (and subtracts) whole days without mutating the input', () => {
    const base = new Date(2026, 8, 6);
    const later = addDays(base, 10);
    expect(isoDate(later)).toBe('2026-09-16');
    expect(isoDate(base)).toBe('2026-09-06');
    expect(isoDate(addDays(base, -6))).toBe('2026-08-31');
  });

  it('clamp bounds a value to [lo, hi]', () => {
    expect(clamp(5, 1, 24)).toBe(5);
    expect(clamp(0, 1, 24)).toBe(1);
    expect(clamp(99, 1, 24)).toBe(24);
  });
});

describe('computeCurrentWeek', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('returns week 1, hasStart:false when no start date is set', () => {
    const result = computeCurrentWeek();
    expect(result).toEqual({ week: 1, hasStart: false, overridden: false });
  });

  it('computes the week number from the start date and today', () => {
    vi.setSystemTime(new Date(2026, 8, 6)); // Sunday 2026-09-06
    safeSet(STORAGE.startDate, '2026-08-04'); // 33 days earlier -> week 5
    const result = computeCurrentWeek();
    expect(result.hasStart).toBe(true);
    expect(result.overridden).toBe(false);
    expect(result.week).toBe(5);
  });

  it('clamps the computed week to the 1-24 range', () => {
    vi.setSystemTime(new Date(2027, 5, 1));
    safeSet(STORAGE.startDate, '2026-01-01');
    expect(computeCurrentWeek().week).toBe(24);
  });

  it('prefers a manual week override over the computed week', () => {
    vi.setSystemTime(new Date(2026, 8, 6));
    safeSet(STORAGE.startDate, '2026-08-04');
    safeSet(STORAGE.weekOverride, '11');
    const result = computeCurrentWeek();
    expect(result.week).toBe(11);
    expect(result.overridden).toBe(true);
  });
});

describe('weekStartDate / dateForWeekday', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('dateForWeekday finds the requested weekday within that plan week', () => {
    safeSet(STORAGE.startDate, '2026-09-01'); // a Tuesday
    const tue = dateForWeekday(1, 'tuesday');
    const sat = dateForWeekday(1, 'saturday');
    const sun = dateForWeekday(1, 'sunday');
    expect(tue.getDay()).toBe(2);
    expect(sat.getDay()).toBe(6);
    expect(sun.getDay()).toBe(0);
    expect(isoDate(tue)).toBe('2026-09-01');
  });
});

describe('getPhaseForWeek', () => {
  beforeAll(() => loadApp());

  it('maps week numbers to the correct phase', () => {
    expect(getPhaseForWeek(1).name).toBe('Foundation');
    expect(getPhaseForWeek(4).name).toBe('Foundation');
    expect(getPhaseForWeek(5).name).toBe('Base strength');
    expect(getPhaseForWeek(12).name).toBe('Strength');
    expect(getPhaseForWeek(24).name).toBe('Consolidation');
  });

  it('falls back to the first phase for an out-of-range week', () => {
    expect(getPhaseForWeek(999).name).toBe('Foundation');
  });
});

describe('defaultSelectedDay', () => {
  afterEach(() => vi.useRealTimers());

  it('returns the real current weekday when not overridden', () => {
    vi.setSystemTime(new Date(2026, 8, 8)); // Tuesday
    expect(defaultSelectedDay(1, false)).toBe('tuesday');
  });

  it('falls back to tuesday when overridden or today is not a plan day', () => {
    vi.setSystemTime(new Date(2026, 8, 9)); // Wednesday -> still a plan day
    expect(defaultSelectedDay(1, true)).toBe('tuesday');

    vi.setSystemTime(new Date(2026, 8, 7)); // Monday -> not in DAY_ORDER
    expect(defaultSelectedDay(1, false)).toBe('tuesday');
  });
});
