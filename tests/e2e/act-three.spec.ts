import { expect, test, type Page } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilEndCard,
  advanceUntilText,
  bootToTitle,
  chooseOption,
  collectPageErrors,
  nextLine,
  pressDown,
  pressKey,
  readHook,
} from './helpers';

/**
 * The long walk begins. Each station is a place, a person and one thing
 * they did with Aristotle. These tests also check the choice Act II left
 * behind: the flag written in Ethics changes the way Alexandria greets the
 * player.
 */

function seedStation(page: Page, flags: Record<string, boolean> = {}): void {
  page.addInitScript((savedFlags) => {
    localStorage.setItem(
      'aristotles-lyceum.save.v1',
      JSON.stringify({
        version: 1,
        unlockedCodex: [],
        stats: { reason: 0, wisdom: 0, empathy: 0 },
        flags: savedFlags,
        completedChapters: [
          'act-one',
          'act-two-logic',
          'act-two-physics',
          'act-two-metaphysics',
          'act-two-soul',
          'act-two-ethics',
          'act-two-poetics',
          'act-two-life',
        ],
        lastChapter: 'act-two-life',
      }),
    );
  }, flags);
}

async function openStation(page: Page): Promise<void> {
  await bootToTitle(page);
  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-three-alexandria');
  await pressKey(page, 'z');
}

/** Plays a station from the title to its end card, without a dialectic. */
async function playStation(page: Page, chapter: string, completed: string[]): Promise<void> {
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
  }, completed);

  await bootToTitle(page);
  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe(chapter);
  await pressKey(page, 'z');
  await advanceUntilChoice(page);
  await chooseOption(page, 0);
  await advanceUntilEndCard(page);
}

const THROUGH = {
  baghdad: [
    'act-one',
    'act-two-logic',
    'act-two-physics',
    'act-two-metaphysics',
    'act-two-soul',
    'act-two-ethics',
    'act-two-poetics',
    'act-two-life',
    'act-three-alexandria',
  ],
  paris: [
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
  ],
  padua: [
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
  ],
};

test('Baghdad files the Essence and Existence entry', async ({ page }) => {
  const errors = collectPageErrors(page);

  await playStation(page, 'act-three-baghdad', THROUGH.baghdad);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE TWO WORDS');
  await expect.poll(() => readHook<string[]>(page, 'unlockedCodex')).toContain('avicennan-essence');

  expect(errors).toEqual([]);
});

test('Paris files the Reason and Doctrine entry', async ({ page }) => {
  const errors = collectPageErrors(page);

  await playStation(page, 'act-three-paris', THROUGH.paris);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE OPEN DOOR');
  await expect
    .poll(() => readHook<string[]>(page, 'unlockedCodex'))
    .toContain('aquinean-synthesis');

  expect(errors).toEqual([]);
});

test('Padua files the Method Survives entry', async ({ page }) => {
  const errors = collectPageErrors(page);

  await playStation(page, 'act-three-padua', THROUGH.padua);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE METHOD SURVIVES');
  await expect
    .poll(() => readHook<string[]>(page, 'unlockedCodex'))
    .toContain('harveyan-correction');

  expect(errors).toEqual([]);
});

test('Alexandria answers the choice made in Ethics', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedStation(page, { 'question-aristotle': true });
  await openStation(page);

  await advanceUntilText(page, 'The choice Isaac made');
  await nextLine(page);

  await expect
    .poll(() => readHook<string>(page, 'lastLine'))
    .toContain('I told him I would question');

  await advanceUntilChoice(page);
  await chooseOption(page, 0);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE TWO COPIES');
  await expect
    .poll(() => readHook<string[]>(page, 'unlockedCodex'))
    .toContain('alexandrian-method');

  expect(errors).toEqual([]);
});

test('Alexandria reads differently when Isaac accepted the teaching', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedStation(page, { 'accept-aristotle': true });
  await openStation(page);

  await advanceUntilText(page, 'The choice Isaac made');
  await nextLine(page);

  await expect.poll(() => readHook<string>(page, 'lastLine')).toContain('I told him I would keep');

  await advanceUntilChoice(page);
  await chooseOption(page, 0);
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE TWO COPIES');

  expect(errors).toEqual([]);
});
