import { expect, test } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilEndCard,
  bootToTitle,
  chooseOption,
  collectPageErrors,
  pressKey,
  readHook,
  startActOne,
} from './helpers';

/**
 * The Dream Journal opens on the list of what has been filed, and an entry
 * can be read from there. Before there was a list, only the first entry could
 * ever be seen, so the journal is worth its own test.
 */
test('lists the filed entries and reads the one that is chosen', async ({ page }) => {
  const errors = collectPageErrors(page);

  await startActOne(page);
  await advanceUntilChoice(page);
  await chooseOption(page, 0);
  await advanceUntilEndCard(page);

  await pressKey(page, 'c');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');

  // Act I files two entries: the syllogism and the dialectic.
  await expect.poll(() => readHook<number>(page, 'codexEntryCount')).toBe(2);
  await expect.poll(() => readHook<string>(page, 'codexView')).toBe('list');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('syllogism');

  // The second entry is reachable from the list.
  await pressKey(page, 'ArrowDown');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('dialectic');

  // Choosing it opens it.
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'codexView')).toBe('detail');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('dialectic');

  // The page turns, and it turns round the end of the list.
  await pressKey(page, 'ArrowRight');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('syllogism');

  await pressKey(page, 'ArrowLeft');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('dialectic');

  // And the reader can go back to the list, and out of the journal.
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'codexView')).toBe('list');

  await pressKey(page, 'Escape');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Title');

  expect(errors).toEqual([]);
});

test('the journal from the title menu is empty until something is filed', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);

  await pressKey(page, 'ArrowDown');
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');
  await expect.poll(() => readHook<number>(page, 'codexEntryCount')).toBe(0);

  expect(errors).toEqual([]);
});

test('the list scrolls to reach an entry that is off the screen', async ({ page }) => {
  const errors = collectPageErrors(page);

  // The journal is longer than the screen once Act II has been played, so the
  // list has to scroll. The save is seeded before the game boots.
  await page.addInitScript(() => {
    const ids = [
      'syllogism',
      'dialectic',
      'mood-and-figure',
      'categories',
      'demonstration',
      'four-causes',
      'hylomorphism',
      'the-four-elements',
      'unmoved-mover',
      'potentiality',
      'species',
      'soul-as-form',
      'soul-capacities',
      'memory',
      'eudaimonia',
      'virtue-and-the-mean',
      'practical-wisdom',
      'mimesis-and-catharsis',
      'plot-structure',
      'hamartia',
      'observation-and-taxonomy',
      'history-of-animals',
      'parts-and-whole',
    ];

    localStorage.setItem(
      'aristotles-lyceum.save.v1',
      JSON.stringify({
        version: 1,
        unlockedCodex: ids,
        stats: { reason: 0, wisdom: 0, empathy: 0 },
        flags: {},
        completedChapters: [],
        lastChapter: '',
      }),
    );
  });

  await bootToTitle(page);

  await pressKey(page, 'ArrowDown');
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Codex');
  await expect.poll(() => readHook<number>(page, 'codexEntryCount')).toBe(23);

  // The last entry is twenty-two rows down, well past the screen.
  for (let index = 0; index < 22; index += 1) {
    await pressKey(page, 'ArrowDown');
  }

  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('parts-and-whole');

  // And the list turns round at the end.
  await pressKey(page, 'ArrowDown');
  await expect.poll(() => readHook<string>(page, 'codexEntry')).toBe('syllogism');

  expect(errors).toEqual([]);
});
