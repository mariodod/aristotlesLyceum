import { expect, test } from '@playwright/test';
import { bootToTitle, collectPageErrors, pressKey, readHook } from './helpers';

test('boots to the title screen', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Title');
  expect(errors).toEqual([]);
});

test('moves the menu cursor with the arrow keys', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);
  await pressKey(page, 'ArrowDown');
  await pressKey(page, 'ArrowDown');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Title');
  expect(errors).toEqual([]);
});

test('opens the codex from the title menu', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);
  await pressKey(page, 'ArrowDown');
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');
  expect(errors).toEqual([]);
});
