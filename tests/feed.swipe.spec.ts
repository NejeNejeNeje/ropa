import { test, expect } from '@playwright/test';

/**
 * E2E spec — full feed page-swipe + per-item action flow.
 *
 * STATUS: shell only. Requires authenticated test session + seeded data.
 *
 * TO ENABLE these tests:
 *   1. Add a test user to prisma/seed.ts (e.g., test@ropa.dev) with at least
 *      9 listings owned by *another* seeded user available in the feed.
 *   2. Add a Playwright fixture or `test.beforeEach` that signs in via the
 *      credentials provider — either by hitting /api/auth/callback/credentials
 *      directly or by setting the next-auth session cookie.
 *   3. Seed more than 9 eligible listings so batch-swipe navigation can be verified.
 *   4. Remove the .fixme() marker on each test below.
 *
 * Once enabled, this becomes the canonical regression test for the feed
 * page-swipe behavior. axiom_VI Phase 3 (Temporal Resilience) requires
 * that every prod regression converts into a test case here.
 */

test.fixme('right batch swipe favorites the visible 9 and advances to the next batch', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/feed');

    const currentBatch = page.getByLabel('Swipe listing batch');
    const firstBatchFirstItem = await currentBatch.locator('[class*="gridCard"]').first().textContent();
    await currentBatch.dragTo(currentBatch, {
        sourcePosition: { x: 120, y: 260 },
        targetPosition: { x: 420, y: 260 },
    });

    await expect(page.getByText(/9 liked/)).toBeVisible();
    await expect(currentBatch.locator('[class*="gridCard"]').first()).not.toContainText(firstBatchFirstItem ?? 'unreachable listing title');
});

test.fixme('left batch swipe skips the visible 9 without liking them', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/feed');

    const currentBatch = page.getByLabel('Swipe listing batch');
    const firstBatchFirstItem = await currentBatch.locator('[class*="gridCard"]').first().textContent();
    await currentBatch.dragTo(currentBatch, {
        sourcePosition: { x: 420, y: 260 },
        targetPosition: { x: 120, y: 260 },
    });

    await expect(page.getByText(/0 liked/)).toBeVisible();
    await expect(currentBatch.locator('[class*="gridCard"]').first()).not.toContainText(firstBatchFirstItem ?? 'unreachable listing title');
    await expect(page.getByRole('button', { name: /Next group of listings/i })).toHaveCount(0);
    await expect(page.getByText(new RegExp('Page 1/'))).toHaveCount(0);
});

test.fixme('desktop side buttons skip or favorite the visible 9-card batch', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/feed');

    const currentBatch = page.getByLabel('Swipe listing batch');
    const firstBatchFirstItem = await currentBatch.locator('[class*="gridCard"]').first().textContent();
    await page.getByRole('button', { name: /Favorite 9 visible listings/i }).click();

    await expect(page.getByText(/9 liked/)).toBeVisible();
    await expect(currentBatch.locator('[class*="gridCard"]').first()).not.toContainText(firstBatchFirstItem ?? 'unreachable listing title');
    await expect(page.getByRole('button', { name: /Skip 9 visible listings/i })).toBeVisible();
});

test.fixme('feed never exposes more than 9 listing cards', async ({ page }) => {
    await page.goto('/feed');

    const currentPanel = page.getByLabel('Swipe listing batch');
    await expect(currentPanel.locator('[class*="gridCard"]')).toHaveCount(9);
    await expect(page.getByText(/9 shown/)).toBeVisible();
    await expect(page.getByText(/10 total/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Customer service' })).toHaveCount(0);
});

test.fixme('per-item like removes the targeted item and refills the 9-card batch', async ({ page }) => {
    await page.goto('/feed');

    const currentBatch = page.getByLabel('Swipe listing batch');
    const firstCardText = await currentBatch.locator('[class*="gridCard"]').first().textContent();
    const firstCardLike = page.getByRole('button', { name: /^Like / }).first();
    await firstCardLike.click();

    await expect(page.getByText(/1 liked/)).toBeVisible();
    await expect(currentBatch).not.toContainText(firstCardText ?? 'unreachable listing title');
    await expect(currentBatch.locator('[class*="gridCard"]')).toHaveCount(9);
});

test.fixme('per-item offer opens the offer sheet without liking sibling cards', async ({ page }) => {
    await page.goto('/feed');

    await page.getByRole('button', { name: /^Make an offer for / }).first().click();
    await expect(page.getByText('Make an Offer')).toBeVisible();
    await expect(page.getByText(/0 liked/)).toBeVisible();
});
