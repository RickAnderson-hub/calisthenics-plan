import { describe, it, expect } from 'vitest';
import { loadApp } from './loadApp.js';

describe('loadApp smoke test', () => {
  it('exposes global functions and bridged consts', () => {
    const APP = loadApp();
    expect(typeof globalThis.isoDate).toBe('function');
    expect(typeof globalThis.computeCurrentWeek).toBe('function');
    expect(APP.PLAN_DATA).toBeTruthy();
    expect(APP.PLAN_DATA.phases.length).toBe(6);
    expect(globalThis.isoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
