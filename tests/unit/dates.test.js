import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { loadApp } from './support/loadApp.js';

beforeAll(() => loadApp());

describe('date helpers', () => {
  it('isoDate formats a Date as YYYY-MM-DD, zero-padded', () => {
    expect(isoDate(new Date(2026, 8, 6))).toBe('2026-09-06');
    expect(isoDate(new Date(2026, 0, 1))).toBe('2026-01-01');
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

  it('returns the real current weekday when it is a plan day', () => {
    vi.setSystemTime(new Date(2026, 8, 8)); // Tuesday
    expect(defaultSelectedDay()).toBe('tuesday');
  });

  it('falls back to tuesday when today is not a plan day', () => {
    vi.setSystemTime(new Date(2026, 8, 7)); // Monday -> not in DAY_ORDER
    expect(defaultSelectedDay()).toBe('tuesday');
  });
});
