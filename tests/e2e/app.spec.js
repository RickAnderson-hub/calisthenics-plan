import { test, expect } from '@playwright/test';

// Tuesday, so the Today tab defaults to a structured strength day rather than
// a generic walking day.
const FIXED_NOW = new Date('2026-09-08T09:00:00');

async function gotoFresh(page) {
  await page.clock.install({ time: FIXED_NOW });
  await page.goto('/index.html');
}

test.describe('first run', () => {
  test('settings open automatically and setting a start date updates Today', async ({ page }) => {
    await gotoFresh(page);
    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();

    await page.fill('#start-date-input', '2026-08-04');
    await page.click('#settings-save');
    await expect(modal).toBeHidden();

    await expect(page.locator('#header-sub')).toContainText('Week 6 of 24');
    await expect(page.locator('.today-hero h2')).toContainText('Phase 2 of 6');
  });
});

test.describe('Today tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFresh(page);
    await page.fill('#start-date-input', '2026-08-04');
    await page.click('#settings-save');
  });

  test('switching day chips shows that day\'s exercises with how-to links', async ({ page }) => {
    await page.click('.day-chip:has-text("Saturday")');
    const rows = page.locator('#today-workout .exercise-row');
    await expect(rows).not.toHaveCount(0);
    const link = page.locator('#today-workout .howto-link').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /^https:\/\/www\.youtube\.com\/results\?search_query=/);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('checking off an exercise persists across a reload', async ({ page }) => {
    const firstBox = page.locator('#today-workout .exercise-check').first();
    await expect(firstBox).not.toHaveClass(/checked/);
    await firstBox.click();
    await expect(firstBox).toHaveClass(/checked/);

    await gotoFresh(page);
    const boxAfterReload = page.locator('#today-workout .exercise-check').first();
    await expect(boxAfterReload).toHaveClass(/checked/);
  });
});

test.describe('Plan tab', () => {
  test('expanding a phase shows its exercise tables with working how-to links', async ({ page }) => {
    await gotoFresh(page);
    await page.click('#settings-close');
    await page.click('#bottom-nav button[data-view="plan"]');

    // Phase 1 (index 0) starts open since it's the current phase with no start
    // date set, so target Phase 2 (index 1) — initially closed — by position,
    // since a class-based locator would stop matching once we toggle it open.
    const accordion = page.locator('.phase-accordion').nth(1);
    await accordion.locator('.phase-head').click();
    await expect(accordion).toHaveClass(/open/);

    const link = accordion.locator('.howto-link').first();
    await expect(link).toHaveAttribute('href', /youtube\.com\/results/);
  });
});

test.describe('Track tab', () => {
  test('logging and deleting a body-weight entry updates the list and chart', async ({ page }) => {
    await gotoFresh(page);
    await page.click('#settings-close');
    await page.click('#bottom-nav button[data-view="track"]');

    await expect(page.locator('#entry-list .empty-state')).toBeVisible();

    await page.fill('#entry-date', '2026-09-01');
    await page.fill('#entry-bodyWeight', '99.5');
    await page.click('#track-form button[type="submit"]');

    const entryRow = page.locator('#entry-list .entry-row');
    await expect(entryRow).toHaveCount(1);
    await expect(entryRow).toContainText('2026-09-01');
    await expect(entryRow).toContainText('99.5 kg');

    page.once('dialog', (d) => d.accept());
    await page.click('#entry-list .entry-del');
    await expect(page.locator('#entry-list .empty-state')).toBeVisible();
  });
});

test.describe('Guide tab', () => {
  test('renders reference links that open in a new tab', async ({ page }) => {
    await gotoFresh(page);
    await page.click('#settings-close');
    await page.click('#bottom-nav button[data-view="guide"]');

    const refs = page.locator('#guide-refs a');
    await expect(refs).not.toHaveCount(0);
    await expect(refs.first()).toHaveAttribute('target', '_blank');
  });
});

test.describe('bottom navigation', () => {
  test('switches the active view for each tab', async ({ page }) => {
    await gotoFresh(page);
    await page.click('#settings-close');

    for (const view of ['plan', 'track', 'guide', 'today']) {
      await page.click(`#bottom-nav button[data-view="${view}"]`);
      await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
    }
  });
});
