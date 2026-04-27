import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const FEED_PAGE = 'src/app/feed/page.tsx';
const FEED_CSS = 'src/app/feed/feed.module.css';

test.describe('feed device interaction contract', () => {
    test('batch page actions are available without touch gestures', async () => {
        const source = await readFile(FEED_PAGE, 'utf8');

        await expect(source).toContain('handleFavoritePage');
        await expect(source).toContain('goToNextPage');
        await expect(source).toContain('Favorite page');
        await expect(source).toContain('Skip page');
    });

    test('grid drag uses pointer events for mouse, pen, touch, and tablet input', async () => {
        const source = await readFile(FEED_PAGE, 'utf8');

        await expect(source).toContain('onPointerDown');
        await expect(source).toContain('onPointerMove');
        await expect(source).toContain('onPointerUp');
        await expect(source).toContain('onPointerCancel');
        await expect(source).not.toContain('onTouchStart=');
        await expect(source).not.toContain('onTouchMove=');
    });

    test('wide viewports get intentional feed density', async () => {
        const css = await readFile(FEED_CSS, 'utf8');

        await expect(css).toContain('@media (min-width: 640px)');
        await expect(css).toContain('@media (min-width: 900px)');
        await expect(css).toContain('@media (min-width: 1180px)');
        await expect(css).toContain('max-width: 1180px');
    });
});
