import { test, expect } from '@playwright/test';

/**
 * E2E spec shell — requires authenticated test session.
 *
 * Contract: feed hearts write RIGHT swipes, and the Favorites tab reads those
 * RIGHT/SUPER swipes directly. Once auth fixtures exist, this should be enabled
 * alongside feed.swipe.spec.ts.
 */

test.fixme('newly liked feed listings appear in the Favorites tab', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/feed');

    const firstCard = page.getByLabel('Swipe listing batch').locator('[class*="gridCard"]').first();
    const firstCardText = await firstCard.textContent();
    await page.getByRole('button', { name: /^Like / }).first().click();

    await page.getByRole('link', { name: /Favorites/i }).click();
    await expect(page.getByRole('heading', { name: /Favorites/i })).toBeVisible();
    await expect(page.locator('[class*="gridCard"]').first()).toContainText(firstCardText ?? 'unreachable listing title');
});
