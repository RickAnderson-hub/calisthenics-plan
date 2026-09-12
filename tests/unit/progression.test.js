import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadApp } from './support/loadApp.js';

beforeAll(() => loadApp());
beforeEach(() => localStorage.clear());

describe('getCurrentWeek / setCurrentWeek', () => {
  it('defaults to week 1 when nothing is stored', () => {
    expect(getCurrentWeek()).toBe(1);
  });

  it('round-trips a stored week', () => {
    setCurrentWeek(9);
    expect(getCurrentWeek()).toBe(9);
    expect(safeGet(STORAGE.currentWeek)).toBe('9');
  });

  it('clamps to the 1-24 range on both write and read', () => {
    setCurrentWeek(99);
    expect(getCurrentWeek()).toBe(24);
    setCurrentWeek(-5);
    expect(getCurrentWeek()).toBe(1);
  });

  it('falls back to week 1 for garbage stored data', () => {
    safeSet(STORAGE.currentWeek, 'not-a-number');
    expect(getCurrentWeek()).toBe(1);
  });
});

describe('sessionKeyFor', () => {
  it('builds a plan-slot key from week + day, independent of any calendar date', () => {
    expect(sessionKeyFor(3, 'tuesday')).toBe('w3-tuesday');
    expect(sessionKeyFor(24, 'sunday')).toBe('w24-sunday');
  });
});

describe('isDaySessionDone', () => {
  let phase; // Phase 2 (weeks 5-8): Tuesday/Saturday structured, Wednesday/Sunday generic
  beforeAll(() => { phase = getPhaseForWeek(6); });

  it('reads the "walk" flag for generic (Wednesday/Sunday) days', () => {
    expect(isDaySessionDone(phase, 6, 'wednesday')).toBe(false);
    toggleExerciseDone(sessionKeyFor(6, 'wednesday'), 'walk');
    expect(isDaySessionDone(phase, 6, 'wednesday')).toBe(true);
  });

  it('reads the "<day>-complete" flag for structured (Tuesday/Saturday) days', () => {
    expect(isDaySessionDone(phase, 6, 'tuesday')).toBe(false);
    toggleExerciseDone(sessionKeyFor(6, 'tuesday'), 'tuesday-complete');
    expect(isDaySessionDone(phase, 6, 'tuesday')).toBe(true);
  });

  it('is scoped per week — completing week 6 Tuesday leaves week 7 Tuesday untouched', () => {
    toggleExerciseDone(sessionKeyFor(6, 'tuesday'), 'tuesday-complete');
    expect(isDaySessionDone(phase, 7, 'tuesday')).toBe(false);
  });

  it('reads the "<day>-complete" flag for Phase 1 Wednesday/Sunday too, since they are structured (not generic) there', () => {
    const phase1 = getPhaseForWeek(1);
    expect(phase1.days.wednesday.generic).toBeFalsy();
    toggleExerciseDone(sessionKeyFor(1, 'wednesday'), 'wednesday-complete');
    expect(isDaySessionDone(phase1, 1, 'wednesday')).toBe(true);
  });
});

describe('isWeekComplete', () => {
  let phase;
  beforeAll(() => { phase = getPhaseForWeek(6); });

  it('is false until all four plan days are marked done', () => {
    expect(isWeekComplete(phase, 6)).toBe(false);
    toggleExerciseDone(sessionKeyFor(6, 'tuesday'), 'tuesday-complete');
    toggleExerciseDone(sessionKeyFor(6, 'wednesday'), 'walk');
    toggleExerciseDone(sessionKeyFor(6, 'saturday'), 'saturday-complete');
    expect(isWeekComplete(phase, 6)).toBe(false);
    toggleExerciseDone(sessionKeyFor(6, 'sunday'), 'walk');
    expect(isWeekComplete(phase, 6)).toBe(true);
  });
});
