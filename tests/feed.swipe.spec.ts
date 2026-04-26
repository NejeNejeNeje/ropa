import { test, expect } from '@playwright/test';

/**
 * E2E spec — full feed swipe + batch undo flow.
 *
 * STATUS: shell only. Requires authenticated test session + seeded data.
 *
 * TO ENABLE these tests:
 *   1. Add a test user to prisma/seed.ts (e.g., test@ropa.dev) with at least
 *      9 listings owned by *another* seeded user available in the feed.
 *   2. Add a Playwright fixture or `test.beforeEach` that signs in via the
 *      credentials provider — either by hitting /api/auth/callback/credentials
 *      directly or by setting the next-auth session cookie.
 *   3. Optionally add a reciprocal RIGHT swipe in seed for one listing so the
 *      "undo deletes match" assertion has data to work with.
 *   4. Remove the .fixme() marker on each test below.
 *
 * Once enabled, this becomes the canonical regression test for the feed
 * swipe + undo behavior. axiom_VI Phase 3 (Temporal Resilience) requires
 * that every prod regression converts into a test case here.
 */

test.fixme('first-visit hint appears, dismisses on swipe', async ({ page, context }) => {
    // Clear localStorage so the hint shows
    await context.clearCookies();
    await page.goto('/feed');

    const hint = page.getByText(/Swipe right to favorite all/);
    await expect(hint).toBeVisible();

    // Simulate horizontal swipe right on the grid area
    const grid = page.locator('[class*="gridArea"]');
    const box = await grid.boundingBox();
    if (!box) throw new Error('grid not found');
    const startX = box.x + 50;
    const y = box.y + box.height / 2;
    await page.touchscreen.tap(startX, y);
    // Playwright's touchscreen API doesn't have multi-step gestures —
    // use page.dispatchEvent('touchstart' / 'touchmove' / 'touchend') instead.

    await expect(hint).not.toBeVisible();
});

test.fixme('batch like → undo toast → undo restores feed state', async ({ page }) => {
    await page.goto('/feed');
    // Swipe right past 100px threshold
    // (implementation: dispatch touchstart at x=50, touchmove at x=200, touchend)

    const undoToast = page.getByText(/Liked \d+ items?/);
    await expect(undoToast).toBeVisible({ timeout: 1000 });

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(undoToast).not.toBeVisible();

    // After undo: navigate to /matches and verify the previously-matched item is gone
    await page.goto('/matches');
    // assert no match row contains the previously-liked listing id
});

test.fixme('undo deletes server-side match (regression for swipe-orphan-match bug)', async ({ page }) => {
    // Requires: seed with a reciprocal RIGHT swipe so a Match is created on batch like.
    // After undo, query /matches — the match should be gone, not just hidden.
    await page.goto('/feed');
    // batch like (one of which will create a match)
    // click undo within 5s
    // navigate /matches
    // expect no match for the previously-liked listing
});
