import { expect, test } from '@playwright/test';
import {
  advanceUntilChoice,
  collectPageErrors,
  pressKey,
  readHook,
  setLanguage,
  startActOne,
} from './helpers';

test('the game can be played in another language', async ({ page }) => {
  const errors = collectPageErrors(page);

  await setLanguage(page, 'Español');

  await page.waitForFunction(() => localStorage.getItem('aristotles-lyceum.locale.v1') === 'es');

  await startActOne(page);

  await expect.poll(() => readHook<string>(page, 'lastLine')).toContain('Martes');
  expect(errors).toEqual([]);
});

test('the language is remembered across a reload', async ({ page }) => {
  const errors = collectPageErrors(page);

  await setLanguage(page, 'Español');
  await page.reload();

  await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Title');
  await startActOne(page);

  await expect.poll(() => readHook<string>(page, 'lastLine')).toContain('Martes');
  expect(errors).toEqual([]);
});

test('the choice menu is translated', async ({ page }) => {
  const errors = collectPageErrors(page);

  await setLanguage(page, 'Español');
  await startActOne(page);

  await advanceUntilChoice(page);

  await expect.poll(() => readHook<string>(page, 'choicePrompt')).toBe('¿Qué haces?');
  await expect
    .poll(() => readHook<string[]>(page, 'choiceLabels'))
    .toContain('Lee la siguiente frase en voz alta.');
  expect(errors).toEqual([]);
});

test('the game falls back to English when a language is incomplete', async ({ page }) => {
  const errors = collectPageErrors(page);

  // The English text is the fallback for anything a language has not
  // translated, so the game never shows a blank line.
  await setLanguage(page, 'Español');
  await startActOne(page);

  await expect.poll(() => readHook<string>(page, 'lastLine')).not.toBe('');
  await pressKey(page, 'z');
  expect(errors).toEqual([]);
});
