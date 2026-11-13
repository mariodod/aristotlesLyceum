import { expect, test } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilEndCard,
  bootToTitle,
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
  // The test plays the whole chapter three times, so it needs more than the
  // default timeout allows on a software renderer.
  test.setTimeout(90_000);

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

test('plays the speaker with the expression the script asks for', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);

  // The opening line is the narrator's, and the narrator has no face.
  await expect.poll(() => readHook<string>(page, 'expression')).toBe('neutral');

  // Isaac's complaint about philosophy is marked angry.
  for (let index = 0; index < 10; index += 1) {
    const line = await readHook<string>(page, 'lastLine');

    if (line.includes('Philosophy is the one subject')) {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<string>(page, 'expression')).toBe('angry');
  expect(errors).toEqual([]);
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

test('the act card leaves the first line unread', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);
  await pressKey(page, 'z');
  await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Story');

  // The act card is up while the first line is already typing behind it.
  // The player must arrive at the line, not at the middle of it.
  await page.waitForTimeout(900);
  await pressKey(page, 'z');

  const visible = await readHook<string>(page, 'lineText');

  expect(visible.length).toBeLessThan(20);
  expect(await readHook<string>(page, 'lastLine')).toContain('Tuesday');

  expect(errors).toEqual([]);
});

test('the chapter-complete card names the act it belongs to', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT I');

  expect(errors).toEqual([]);
});
