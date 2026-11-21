import { expect, test, type Page } from '@playwright/test';
import { bootToTitle, collectPageErrors, pressDown, pressKey, readHook } from './helpers';

async function openSettings(page: Page): Promise<void> {
  await bootToTitle(page);
  // BEGIN(0), CODEX(1), TRY A DIALECTIC(2), SETTINGS(3).
  await pressDown(page, 3);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Settings');
}

test('the settings screen changes and persists text speed', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openSettings(page);
  await expect.poll(() => readHook<number>(page, 'settingsRowCount')).toBe(10);

  // Row 0 is language; row 1 is text speed.
  await pressDown(page, 1);
  await expect.poll(() => readHook<string[]>(page, 'settingsValues')).toHaveLength(10);
  expect((await readHook<string[]>(page, 'settingsValues'))?.[1]).toBe('NORMAL');

  await pressKey(page, 'ArrowRight');
  expect((await readHook<string[]>(page, 'settingsValues'))?.[1]).toBe('FAST');

  await pressKey(page, 'ArrowRight');
  expect((await readHook<string[]>(page, 'settingsValues'))?.[1]).toBe('INSTANT');

  const saved = await page.evaluate(() => localStorage.getItem('aristotles-lyceum.settings.v1'));
  expect(saved).toContain('"textSpeed":0');

  expect(errors).toEqual([]);
});

test('volumes and toggles change and persist', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openSettings(page);

  // Master volume is row 2; change it twice.
  await pressDown(page, 2);
  await pressKey(page, 'ArrowLeft');
  await pressKey(page, 'ArrowLeft');

  const saved = await page.evaluate(() => localStorage.getItem('aristotles-lyceum.settings.v1'));
  expect(saved).toContain('"masterVolume":0.5');

  // Mute is the last row.
  await pressDown(page, 7);
  await pressKey(page, 'ArrowRight');
  expect((await readHook<string[]>(page, 'settingsValues'))?.at(-1)).toBe('ON');

  expect(errors).toEqual([]);
});
