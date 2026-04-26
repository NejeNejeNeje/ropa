import { test, expect } from '@playwright/test';

/**
 * Feed route tests — what we can verify without an authenticated session.
 * The full swipe + undo flow lives in feed.swipe.spec.ts and is gated on
 * test-auth setup that doesn't exist yet (see TODO there).
 */

test('unauthenticated /feed redirects to /login', async ({ page }) => {
    await page.goto('/feed');
    // Server-side layout in src/app/feed/layout.tsx redirects unauthenticated
    // users to /login before any client JS runs.
    await expect(page).toHaveURL(/\/login/);
});

test('login page renders sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    // The login page should expose at least an email input —
    // the exact text depends on copy and may evolve.
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
});
