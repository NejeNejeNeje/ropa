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
 *   3. Seed at least 9 eligible listings so the 9-option feed can be verified.
 *   4. Remove the .fixme() marker on each test below.
 *
 * Once enabled, this becomes the canonical regression test for the feed
 * page-swipe behavior. axiom_VI Phase 3 (Temporal Resilience) requires
 * that every prod regression converts into a test case here.
 */

test.fixme('feed exposes only one visible 9-option set', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/feed');

    await expect(page.locator('[aria-label^="Listings page"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Next group of listings/i })).toHaveCount(0);
    await expect(page.getByText(new RegExp('Page 1/'))).toHaveCount(0);
});

test.fixme('feed never exposes more than 9 listing cards', async ({ page }) => {
    await page.goto('/feed');

    const currentPanel = page.locator('[aria-label^="Listings page"][aria-hidden="false"]');
    await expect(currentPanel.locator('[class*="gridCard"]')).toHaveCount(9);
    await expect(page.getByText(/9 shown/)).toBeVisible();
    await expect(page.getByText(/10 total/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Customer service' })).toHaveCount(0);
});

test.fixme('per-item like only likes the targeted item', async ({ page }) => {
    await page.goto('/feed');

    const firstCardLike = page.getByRole('button', { name: /^Like / }).first();
    await firstCardLike.click();

    await expect(firstCardLike).toContainText('❤️');
    await expect(page.getByText(/1 liked/)).toBeVisible();
});

test.fixme('per-item offer opens the offer sheet without liking sibling cards', async ({ page }) => {
    await page.goto('/feed');

    await page.getByRole('button', { name: /^Make an offer for / }).first().click();
    await expect(page.getByText('Make an Offer')).toBeVisible();
    await expect(page.getByText(/0 liked/)).toBeVisible();
});
