import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — first E2E suite for ROPA.
 * Covers the currently supported viewport classes: desktop, tablet, mobile.
 * Authenticated feed interaction tests remain gated on test-auth setup.
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'desktop-chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'tablet-chrome',
            use: {
                ...devices['Pixel 5'],
                viewport: { width: 820, height: 1180 },
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        env: {
            AUTH_SECRET: 'playwright-local-auth-secret',
        },
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
