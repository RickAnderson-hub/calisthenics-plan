import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadApp } from './support/loadApp.js';

beforeAll(() => loadApp());
beforeEach(() => localStorage.clear());

describe('safe localStorage helpers', () => {
  it('round-trip get/set/remove', () => {
    expect(safeGet('missing')).toBeNull();
    safeSet('k', 'v');
    expect(safeGet('k')).toBe('v');
    safeRemove('k');
    expect(safeGet('k')).toBeNull();
  });

  it('getJSON parses stored JSON and falls back on missing/invalid data', () => {
    expect(getJSON('nope', { a: 1 })).toEqual({ a: 1 });
    setJSON('obj', { a: 1, b: [1, 2] });
    expect(getJSON('obj', null)).toEqual({ a: 1, b: [1, 2] });
    localStorage.setItem('broken', '{not json');
    expect(getJSON('broken', 'fallback')).toBe('fallback');
  });
});

describe('session (per-day checkbox) storage', () => {
  it('getSession defaults to an empty object', () => {
    expect(getSession('2026-09-08')).toEqual({});
  });

  it('toggleExerciseDone flips and persists a boolean per key', () => {
    const iso = '2026-09-08';
    expect(toggleExerciseDone(iso, 'tuesday-0-Push-up')).toBe(true);
    expect(getSession(iso)).toEqual({ 'tuesday-0-Push-up': true });
    expect(toggleExerciseDone(iso, 'tuesday-0-Push-up')).toBe(false);
    expect(getSession(iso)).toEqual({ 'tuesday-0-Push-up': false });
  });

  it('keeps separate sessions per date', () => {
    toggleExerciseDone('2026-09-08', 'a');
    toggleExerciseDone('2026-09-09', 'b');
    expect(getSession('2026-09-08')).toEqual({ a: true });
    expect(getSession('2026-09-09')).toEqual({ b: true });
  });
});

describe('tracking entries', () => {
  it('getEntries returns an empty array when nothing is logged', () => {
    expect(getEntries()).toEqual([]);
  });

  it('saveEntry inserts new entries and sorts by date', () => {
    saveEntry({ id: '2026-09-08', date: '2026-09-08', bodyWeight: 100 });
    saveEntry({ id: '2026-09-01', date: '2026-09-01', bodyWeight: 102 });
    const entries = getEntries();
    expect(entries.map((e) => e.date)).toEqual(['2026-09-01', '2026-09-08']);
  });

  it('saveEntry merges into an existing entry for the same date', () => {
    saveEntry({ id: '2026-09-08', date: '2026-09-08', bodyWeight: 100 });
    saveEntry({ id: '2026-09-08', date: '2026-09-08', waist: 95 });
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ bodyWeight: 100, waist: 95 });
  });

  it('deleteEntry removes an entry by id', () => {
    saveEntry({ id: '2026-09-08', date: '2026-09-08', bodyWeight: 100 });
    deleteEntry('2026-09-08');
    expect(getEntries()).toEqual([]);
  });
});
