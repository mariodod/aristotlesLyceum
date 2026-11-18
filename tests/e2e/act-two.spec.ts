import { expect, test, type Page } from '@playwright/test';
import {
  advanceUntilChoice,
  advanceUntilEndCard,
  bootToTitle,
  buildSyllogism,
  chooseOption,
  collectPageErrors,
  nextLine,
  pressDown,
  pressKey,
  readHook,
} from './helpers';

/**
 * Act II begins where Act I ended. The save tracks what is finished, so a
 * player who has closed the desk walks into the Lyceum and not back to the
 * title.
 */

function seedChapters(page: Page, completed: string[]): void {
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
}

/** A save with Act I finished and nothing filed yet. */
function seedActOne(page: Page): void {
  seedChapters(page, ['act-one']);
}

test('the title offers the next chapter once one is finished', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedActOne(page);
  await bootToTitle(page);

  // BEGIN THE DREAM is the first entry. CONTINUE THE DREAM is the second.
  await pressDown(page, 1);
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-two-logic');

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 1 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedActOne(page);
  await bootToTitle(page);

  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-two-logic');

  // The act card covers the first line, so one confirm clears it.
  await pressKey(page, 'z');

  await advanceUntilChoice(page);

  // The first option is always on offer, whatever the journal holds.
  await chooseOption(page, 0);

  // The branch plays out, and then the chapter hands the argument to
  // Certainty.
  for (let index = 0; index < 10; index += 1) {
    if ((await readHook<string>(page, 'scene')) === 'Dialectic') {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');

  await buildSyllogism(page, 2, 0, 6);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');

  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT II');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE DEMONSTRATION');

  // The chapter filed the three entries it promised.
  const codex = await readHook<string[]>(page, 'unlockedCodex');

  expect(codex).toContain('mood-and-figure');
  expect(codex).toContain('categories');
  expect(codex).toContain('demonstration');

  // The choice moved the stat the option promised.
  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 2 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedChapters(page, ['act-one', 'act-two-logic']);
  await bootToTitle(page);

  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-two-physics');

  await pressKey(page, 'z');
  await advanceUntilChoice(page);
  await chooseOption(page, 0);

  for (let index = 0; index < 10; index += 1) {
    if ((await readHook<string>(page, 'scene')) === 'Dialectic') {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');

  // Camestres: no thing explained by matter alone has a purpose, every
  // living thing has a purpose, therefore no living thing is explained by
  // matter alone.
  await buildSyllogism(page, 0, 3, 7);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT II');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE FOUR ANSWERS');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('four-causes');
  expect(codex).toContain('hylomorphism');
  expect(codex).toContain('the-four-elements');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 3 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedChapters(page, ['act-one', 'act-two-logic', 'act-two-physics']);
  await bootToTitle(page);

  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-two-metaphysics');

  await pressKey(page, 'z');
  await advanceUntilChoice(page);
  await chooseOption(page, 0);

  for (let index = 0; index < 10; index += 1) {
    if ((await readHook<string>(page, 'scene')) === 'Dialectic') {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');

  // Take the reist's own premise, deny the reality of names, and the world
  // goes with it: no name is real, every thing is a name, so no thing is.
  await buildSyllogism(page, 2, 3, 6);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await advanceUntilEndCard(page);

  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT II');
  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE UNMOVED THING');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('unmoved-mover');
  expect(codex).toContain('potentiality');
  expect(codex).toContain('species');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});
