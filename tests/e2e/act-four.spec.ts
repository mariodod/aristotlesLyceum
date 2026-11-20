import { expect, test, type Page } from '@playwright/test';
import {
  advanceUntilEndCard,
  bootToTitle,
  collectPageErrors,
  nextLine,
  pressDown,
  pressKey,
  readHook,
} from './helpers';

/**
 * The exam is marked by pure rules and never shows its score. These tests
 * play the same paper three ways and check that each reaches a different
 * named ending.
 */

const COMPLETED = [
  'act-one',
  'act-two-logic',
  'act-two-physics',
  'act-two-metaphysics',
  'act-two-soul',
  'act-two-ethics',
  'act-two-poetics',
  'act-two-life',
  'act-three-alexandria',
  'act-three-baghdad',
  'act-three-paris',
  'act-three-padua',
  'act-three-london',
  'act-three-utrecht',
  'act-three-konigsberg',
  'act-three-down-house',
];

async function openExam(page: Page): Promise<void> {
  page.addInitScript((chapters) => {
    localStorage.setItem(
      'aristotles-lyceum.save.v1',
      JSON.stringify({
        version: 1,
        unlockedCodex: [],
        stats: { reason: 0, wisdom: 0, empathy: 0 },
        flags: {},
        completedChapters: chapters,
        lastChapter: chapters[chapters.length - 1] ?? '',
      }),
    );
  }, COMPLETED);

  await bootToTitle(page);
  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-four-exam');
  await pressKey(page, 'z');

  // The waking lines come before the paper.
  for (let index = 0; index < 12; index += 1) {
    if ((await readHook<number>(page, 'examTotal')) > 0) {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<number>(page, 'examTotal')).toBe(6);
}

/** Option 1 is the correct answer; option 3 is the honest one. */
async function answer(page: Page, indices: number[]): Promise<void> {
  for (const index of indices) {
    await pressDown(page, index);
    await pressKey(page, 'z');
  }
}

test('every answer right reaches The Apostate', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openExam(page);
  await answer(page, [1, 1, 1, 1, 1, 0]);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<string>(page, 'examEnding')).toBe('apostate');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE APOSTATE');
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT IV');

  expect(errors).toEqual([]);
});

test('few right and the rest honest reaches The Honest One', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openExam(page);
  await answer(page, [1, 1, 3, 3, 3, 3]);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<string>(page, 'examEnding')).toBe('honest');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE HONEST ONE');

  expect(errors).toEqual([]);
});

test('enough right reaches The Passing Grade', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openExam(page);
  await answer(page, [1, 1, 1, 1, 3, 3]);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<string>(page, 'examEnding')).toBe('pass');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE PASSING GRADE');

  expect(errors).toEqual([]);
});
