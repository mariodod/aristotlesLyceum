import { expect, test } from '@playwright/test';
import { bootToTitle, collectPageErrors } from './helpers';

/**
 * Audio loads after the first frame, so browsers whose audio loader is slow
 * can still start the game. Every play call checks the cache and skips a
 * file that has not arrived, so a slow load is silent rather than fatal.
 */
test('the generated audio pack loads after the game starts', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);

  const loaded = await page
    .waitForFunction(() => {
      const cache = window.__LYCEUM_GAME__?.cache.audio;

      return Boolean(cache?.get('music-desk') && cache?.get('argument-won'));
    })
    .then(() => true)
    .catch(() => false);

  expect(loaded).toBe(true);
  expect(errors).toEqual([]);
});
