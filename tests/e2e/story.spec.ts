import { expect, test } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilEndCard,
  chooseOption,
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
  await expect.poll(() => readHook<boolean>(page, 'choiceVisible')).toBe(true);
  expect(errors).toEqual([]);
});

test('unlocks a codex entry after the first choice', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilChoice(page);

  await pressKey(page, 'z');

  // The first option is "read the next line out loud", which raises reason.
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

test('reaches the chapter-complete card', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE ARGUMENT');
  expect(errors).toEqual([]);
});

test('each choice reaches a different ending', async ({ page }) => {
  const endings: { option: number; ending: string; stat: string }[] = [
    { option: 0, ending: 'THE ARGUMENT', stat: 'reason' },
    { option: 1, ending: 'THE REPETITION', stat: 'wisdom' },
    { option: 2, ending: 'THE MESSAGE', stat: 'empathy' },
  ];

  for (const { option, ending, stat } of endings) {
    await startActOne(page);
    await advanceUntilChoice(page);
    await chooseOption(page, option);
    await advanceUntilEndCard(page);

    await expect.poll(() => readHook<string>(page, 'ending')).toBe(ending);
    await expect
      .poll(async () => {
        const stats = (await readHook<Record<string, number>>(page, 'stats')) ?? {};
        return stats[stat];
      })
      .toBe(1);
  }
});

test('opens the Dream Journal from the chapter-complete card', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);

  await pressKey(page, 'c');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');
  expect(errors).toEqual([]);
});
