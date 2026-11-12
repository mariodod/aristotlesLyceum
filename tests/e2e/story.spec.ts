import { expect, test } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilText,
  collectPageErrors,
  nextLine,
  pressKey,
  readHook,
  startActOne,
} from './helpers';

test('plays the opening chapter and reaches the first choice', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);

  await expect.poll(() => readHook<string>(page, 'lineText')).toContain('Tuesday');

  await advanceUntilChoice(page);

  await expect.poll(() => readHook<boolean>(page, 'choosing')).toBe(true);
  await expect.poll(() => readHook<number>(page, 'choiceCount')).toBe(3);
  expect(errors).toEqual([]);
});

test('unlocks a codex entry after the first choice', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilChoice(page);

  await pressKey(page, 'z');

  // The first option is "read the next line out loud", which raises reason.
  await expect.poll(() => readHook<number>(page, 'stats')).toBeDefined();
  await expect
    .poll(async () => {
      const stats = (await readHook<{ reason: number }>(page, 'stats')) ?? { reason: 0 };
      return stats.reason;
    })
    .toBe(1);

  for (let index = 0; index < 12; index += 1) {
    if ((await readHook<string[]>(page, 'unlockedCodex')).includes('syllogism')) {
      break;
    }

    await nextLine(page);
  }

  await expect
    .poll(async () => (await readHook<string[]>(page, 'unlockedCodex')).join(','))
    .toContain('syllogism');
  expect(errors).toEqual([]);
});

test('moves the choice cursor with the arrow keys', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilChoice(page);

  await expect.poll(() => readHook<boolean>(page, 'choosing')).toBe(true);
  await pressKey(page, 'ArrowDown');

  await expect.poll(() => readHook<number>(page, 'choiceIndex')).toBe(1);
  expect(errors).toEqual([]);
});

test('reaches the end of the chapter', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilChoice(page);
  await pressKey(page, 'z');

  await advanceUntilText(page, 'End of chapter');

  await expect.poll(() => readHook<string>(page, 'lineText')).toContain('End of chapter');
  expect(errors).toEqual([]);
});
