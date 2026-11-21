import { expect, test, type Page } from '@playwright/test';
import {
  bootToTitle,
  buildSyllogism,
  collectPageErrors,
  nextLine,
  pressKey,
  readHook,
} from './helpers';

/**
 * The release criterion: a complete playthrough from the title screen to an
 * ending with no console errors. Instant text keeps the test short without
 * skipping any chapter, choice or argument.
 */

/** The one valid refutation for each opponent, in proposition indices. */
const BATTLES: Record<string, [number, number, number]> = {
  certainty: [2, 0, 6],
  reductionism: [0, 3, 7],
  pluralism: [0, 2, 6],
  marking: [0, 3, 6],
  reism: [2, 3, 6],
  ghost: [0, 3, 6],
  imitation: [0, 3, 6],
  authority: [0, 3, 6],
};

interface Snapshot {
  scene: string;
  chapter: string;
  choosing: boolean;
  endCardVisible: boolean;
  ending: string;
}

const snapshot = (page: Page): Promise<Snapshot> =>
  page.evaluate(() => {
    const hook = window.__LYCEUM_TEST__;

    return {
      scene: hook?.scene ?? '',
      chapter: hook?.chapter ?? '',
      choosing: hook?.choosing ?? false,
      endCardVisible: hook?.endCardVisible ?? false,
      ending: hook?.ending ?? '',
    };
  });

test.setTimeout(900_000);

test('plays the whole game from the title to an ending', async ({ page }) => {
  const errors = collectPageErrors(page);

  // A fresh player, with instant text so the whole path fits in a test.
  await page.addInitScript(() => {
    localStorage.setItem(
      'aristotles-lyceum.settings.v1',
      JSON.stringify({
        textSpeed: 0,
        masterVolume: 0,
        musicVolume: 0,
        sfxVolume: 0,
        screenShake: true,
        reducedMotion: false,
        holdToSkip: false,
        colorBlindSafe: false,
        muted: true,
      }),
    );
  });

  await bootToTitle(page);
  await pressKey(page, 'z'); // BEGIN THE DREAM

  const chaptersSeen = new Set<string>();

  for (let step = 0; step < 900; step += 1) {
    const state = await snapshot(page);

    if (state.chapter) {
      chaptersSeen.add(state.chapter);
    }

    if (state.scene === 'Dialectic') {
      const opponent = await readHook<string>(page, 'opponent');
      const solution = BATTLES[opponent];

      if (!solution) {
        throw new Error(`No known refutation for ${opponent}`);
      }

      await buildSyllogism(page, ...solution);

      // The win schedules a hand-off back to the story. Waiting here matters:
      // pressing keys while the battle is still on screen opens a second
      // builder on top of the first and the run never moves on.
      await expect.poll(() => readHook<string>(page, 'scene'), { timeout: 10_000 }).toBe('Story');
      continue;
    }

    if (state.scene !== 'Story') {
      throw new Error(`Unexpected scene ${state.scene} during the playthrough`);
    }

    if (state.choosing) {
      await pressKey(page, 'z'); // always take the first option
      continue;
    }

    if (state.endCardVisible) {
      if (state.chapter === 'act-four-exam') {
        expect(state.ending.length).toBeGreaterThan(0);
        break;
      }

      // An end card in an earlier chapter continues the dream.
      await pressKey(page, 'z');
      continue;
    }

    await nextLine(page);
  }

  // Every chapter on the path was actually visited.
  expect(chaptersSeen.size).toBe(17);
  expect(chaptersSeen).toContain('act-one');
  expect(chaptersSeen).toContain('act-two-life');
  expect(chaptersSeen).toContain('act-three-down-house');
  expect(chaptersSeen).toContain('act-four-exam');

  expect(errors).toEqual([]);
});
