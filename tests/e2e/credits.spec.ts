import { expect, test } from '@playwright/test';
import { bootToTitle, collectPageErrors, pressDown, pressKey, readHook } from './helpers';

test('the credits turn pages and name the sources', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);
  // BEGIN(0), CODEX(1), TRY A DIALECTIC(2), SETTINGS(3), CREDITS(4).
  await pressDown(page, 4);
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Credits');
  await expect.poll(() => readHook<number>(page, 'creditsPageCount')).toBe(6);
  await expect.poll(() => readHook<number>(page, 'creditsPage')).toBe(0);

  await pressKey(page, 'ArrowRight');
  await expect.poll(() => readHook<number>(page, 'creditsPage')).toBe(1);
  await pressKey(page, 'ArrowLeft');
  await expect.poll(() => readHook<number>(page, 'creditsPage')).toBe(0);

  // Wrapping in both directions.
  await pressKey(page, 'ArrowLeft');
  await expect.poll(() => readHook<number>(page, 'creditsPage')).toBe(5);

  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Title');

  expect(errors).toEqual([]);
});
