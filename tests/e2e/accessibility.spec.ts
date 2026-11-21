import { expect, test, type Page } from '@playwright/test';
import {
  advanceUntilChoice,
  bootToTitle,
  collectPageErrors,
  pressDown,
  pressKey,
  readHook,
} from './helpers';

/** Sets a saved option before the game boots. */
function seedSettings(page: Page, patch: Record<string, unknown>): void {
  page.addInitScript(
    (settings) => {
      localStorage.setItem('aristotles-lyceum.settings.v1', JSON.stringify(settings));
    },
    {
      version: 1,
      textSpeed: 1,
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.7,
      screenShake: true,
      reducedMotion: false,
      holdToSkip: false,
      colorBlindSafe: false,
      muted: false,
      ...patch,
    },
  );
}

test('instant text reveals the whole line at once', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedSettings(page, { textSpeed: 0 });
  await bootToTitle(page);
  await pressKey(page, 'z'); // BEGIN
  await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Story');

  // The act card covers the first line; one confirm clears it.
  await pressKey(page, 'z');
  await page.waitForTimeout(100);

  const full = await readHook<string>(page, 'lastLine');
  const visible = await readHook<string>(page, 'lineText');

  expect(full.length).toBeGreaterThan(40);
  // The box wraps on word boundaries, so the visible text has newlines the
  // authored line does not. Compare the words, not the layout.
  expect(visible.split(/\s+/).join(' ')).toBe(full);
  expect(await readHook<boolean>(page, 'typing')).toBe(false);

  expect(errors).toEqual([]);
});

test('the game plays with sound muted', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedSettings(page, { muted: true });
  await bootToTitle(page);
  await pressDown(page, 1);
  await pressKey(page, 'z'); // CODEX

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');
  await expect.poll(() => readHook<number>(page, 'codexEntryCount')).toBe(0);

  expect(errors).toEqual([]);
});

test('reduced motion does not stop the dialogue', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedSettings(page, { reducedMotion: true });
  await bootToTitle(page);
  await pressKey(page, 'z');
  await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Story');
  await pressKey(page, 'z');
  await advanceUntilChoice(page);

  expect(await readHook<boolean>(page, 'choosing')).toBe(true);

  expect(errors).toEqual([]);
});
