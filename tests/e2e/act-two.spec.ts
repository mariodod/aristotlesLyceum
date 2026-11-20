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

/**
 * Plays one chapter from the title to its end card, decision by decision.
 *
 * Every chapter in the act has the same shape: the title continues the
 * dream, the act card is cleared with one confirm, one or two choices play
 * out, the chapter hands over to an argument, and a valid syllogism brings
 * the player back. Only the terms and the opponent change, so the sequence
 * lives here instead of being written out seven times.
 */
async function playChapter(
  page: Page,
  chapter: string,
  completed: string[],
  syllogism: [number, number, number],
  choices: number[] = [0],
): Promise<void> {
  seedChapters(page, completed);
  await bootToTitle(page);

  // BEGIN THE DREAM is the first entry. CONTINUE THE DREAM is the second.
  await pressDown(page, 1);
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe(chapter);

  // The act card covers the first line, so one confirm clears it.
  await pressKey(page, 'z');

  for (const option of choices) {
    await advanceUntilChoice(page);
    await chooseOption(page, option);
  }

  // The branch plays out, and then the chapter hands the argument over.
  for (let index = 0; index < 10; index += 1) {
    if ((await readHook<string>(page, 'scene')) === 'Dialectic') {
      break;
    }

    await nextLine(page);
  }

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Dialectic');
  await buildSyllogism(page, ...syllogism);

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await advanceUntilEndCard(page);
  await expect.poll(() => readHook<boolean>(page, 'endCardVisible')).toBe(true);
  await expect.poll(() => readHook<string>(page, 'actTitle')).toBe('ACT II');
}

const THROUGH = {
  logic: ['act-one'],
  physics: ['act-one', 'act-two-logic'],
  metaphysics: ['act-one', 'act-two-logic', 'act-two-physics'],
  soul: ['act-one', 'act-two-logic', 'act-two-physics', 'act-two-metaphysics'],
  ethics: ['act-one', 'act-two-logic', 'act-two-physics', 'act-two-metaphysics', 'act-two-soul'],
  poetics: [
    'act-one',
    'act-two-logic',
    'act-two-physics',
    'act-two-metaphysics',
    'act-two-soul',
    'act-two-ethics',
  ],
  life: [
    'act-one',
    'act-two-logic',
    'act-two-physics',
    'act-two-metaphysics',
    'act-two-soul',
    'act-two-ethics',
    'act-two-poetics',
  ],
};

test('the title offers the next chapter once one is finished', async ({ page }) => {
  const errors = collectPageErrors(page);

  seedActOne(page);
  await bootToTitle(page);

  await pressDown(page, 1);
  await pressKey(page, 'z');

  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-two-logic');

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 1 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  // Celarent: no opinion is certain, every claim is an opinion, so no claim
  // is certainly true.
  await playChapter(page, 'act-two-logic', THROUGH.logic, [2, 0, 6]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE DEMONSTRATION');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('mood-and-figure');
  expect(codex).toContain('categories');
  expect(codex).toContain('demonstration');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 2 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  // Camestres: no matter-alone thing has a purpose, every living thing has
  // one, so no living thing is accounted for by matter alone.
  await playChapter(page, 'act-two-physics', THROUGH.physics, [0, 3, 7]);

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

  // Take the reist's own premise, deny the reality of names, and the world
  // goes with it.
  await playChapter(page, 'act-two-metaphysics', THROUGH.metaphysics, [2, 3, 6]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE UNMOVED THING');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('unmoved-mover');
  expect(codex).toContain('potentiality');
  expect(codex).toContain('species');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 4 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  // No form of a body is a separate occupant; every soul is the form of a
  // body; so no soul is a separate occupant.
  await playChapter(page, 'act-two-soul', THROUGH.soul, [0, 3, 6]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('NOT A PASSENGER');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('soul-as-form');
  expect(codex).toContain('soul-capacities');
  expect(codex).toContain('memory');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 5 and remembers the decision', async ({ page }) => {
  const errors = collectPageErrors(page);

  // Cesare: every good for one person only falls short of being an end;
  // no good is an end; therefore no good is good for one person only.
  await playChapter(page, 'act-two-ethics', THROUGH.ethics, [0, 2, 6], [0, 0]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE MEAN');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('eudaimonia');
  expect(codex).toContain('virtue-and-the-mean');
  expect(codex).toContain('practical-wisdom');

  // The load-bearing choice is written to the save, where Act III can read
  // it, and the other option's flag was not set.
  const flags = await page.evaluate(() => {
    const raw = localStorage.getItem('aristotles-lyceum.save.v1');
    return raw ? (JSON.parse(raw).flags as Record<string, boolean>) : {};
  });
  expect(flags['question-aristotle']).toBe(true);
  expect(flags['accept-aristotle']).toBeUndefined();

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 6 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  await playChapter(page, 'act-two-poetics', THROUGH.poetics, [0, 3, 6]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE RECOGNITION');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('mimesis-and-catharsis');
  expect(codex).toContain('plot-structure');
  expect(codex).toContain('hamartia');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  expect(errors).toEqual([]);
});

test('plays Act II Chapter 7 to its end card', async ({ page }) => {
  const errors = collectPageErrors(page);

  await playChapter(page, 'act-two-life', THROUGH.life, [0, 3, 6]);

  await expect.poll(() => readHook<string>(page, 'ending')).toBe('THE METHOD');

  const codex = await readHook<string[]>(page, 'unlockedCodex');
  expect(codex).toContain('observation-and-taxonomy');
  expect(codex).toContain('history-of-animals');
  expect(codex).toContain('parts-and-whole');

  const stats = await readHook<{ reason: number }>(page, 'stats');
  expect(stats.reason).toBe(1);

  // The last chapter of Act II hands the player into the long walk.
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-three-alexandria');

  expect(errors).toEqual([]);
});
