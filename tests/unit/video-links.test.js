import { describe, it, expect, beforeAll } from 'vitest';
import { loadApp } from './support/loadApp.js';

let APP;
beforeAll(() => {
  APP = loadApp();
});

describe('youtubeSearchUrl', () => {
  it('builds an encoded YouTube search URL', () => {
    expect(youtubeSearchUrl('push up form')).toBe(
      'https://www.youtube.com/results?search_query=push%20up%20form'
    );
  });

  it('encodes special characters safely', () => {
    const url = youtubeSearchUrl('one-arm row & form');
    expect(url).toContain('search_query=');
    expect(url).not.toContain(' ');
    expect(url).not.toContain('&form'); // & must be encoded, not left as a query separator
  });
});

describe('exerciseVideoLink', () => {
  it('returns an anchor with the correct href, target and label for a known exercise', () => {
    const link = exerciseVideoLink('Push-up');
    expect(link).not.toBeNull();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe(youtubeSearchUrl(APP.EXERCISE_VIDEO_QUERIES['Push-up']));
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toBe('Watch Push-up tutorial videos on YouTube');
    expect(link.className).toBe('howto-link');
  });

  it('returns null for an exercise name with no video query mapped', () => {
    expect(exerciseVideoLink('Not A Real Exercise')).toBeNull();
  });
});

describe('EXERCISE_VIDEO_QUERIES completeness', () => {
  it('has an entry for every exercise name used in PLAN_DATA', () => {
    const names = new Set();
    APP.PLAN_DATA.phases.forEach((phase) => {
      Object.values(phase.days).forEach((day) => {
        (day.exercises || []).forEach((ex) => names.add(ex.name));
      });
    });
    expect(names.size).toBeGreaterThan(0);
    const missing = [...names].filter((n) => !(n in APP.EXERCISE_VIDEO_QUERIES));
    expect(missing).toEqual([]);
  });
});
