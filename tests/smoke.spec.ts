import { test, expect } from '@playwright/test';

/**
 * Smoke spec — verifies the app boots and the root route responds.
 * Establishes the test pattern; not exhaustive.
 */
test('root route loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\//);
});
