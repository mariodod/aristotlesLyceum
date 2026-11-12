import { expect, test } from '@playwright/test';
import {
  buildSyllogism,
  collectPageErrors,
  openDialectic,
  pressDown,
  pressKey,
  readHook,
} from './helpers';

test('the dialectic opens with the opponent making a claim', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openDialectic(page);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');
  expect(errors).toEqual([]);
});

test('the four moves are offered', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openDialectic(page);

  // EXAMINE, REFUTE, CLAIM and EMBRACE. Moving down three times and back
  // up one has to land on the fourth without leaving the list.
  await pressDown(page, 3);
  await pressKey(page, 'ArrowUp');
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');
  expect(errors).toEqual([]);
});

test('a valid syllogism wins the argument', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openDialectic(page);

  // Celarent: no opinion is certainly true; all claims of this kind are
  // opinions; therefore no claim of this kind is certainly true.
  await buildSyllogism(page, 2, 0, 6);

  await expect.poll(() => readHook<number>(page, 'conviction')).toBe(0);
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Title');
  expect(errors).toEqual([]);
});

test('an argument that does not follow is refused', async ({ page }) => {
  const errors = collectPageErrors(page);

  await openDialectic(page);

  // Some opinions are certainly true (I), all claims of this kind are
  // opinions (A), no claim of this kind is certainly true (E). That is IAE
  // in figure one, and it does not hold.
  await buildSyllogism(page, 3, 0, 6);

  await expect.poll(() => readHook<number>(page, 'conviction')).toBe(3);
  expect(errors).toEqual([]);
});

test('the other opponents can be faced', async ({ page }) => {
  const errors = collectPageErrors(page);

  for (const opponent of ['certainty', 'reductionism', 'pluralism', 'marking']) {
    await openDialectic(page, opponent);
    await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');
  }

  expect(errors).toEqual([]);
});
