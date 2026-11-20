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
