import { expect, test } from '@playwright/test';
import { bootToTitle, collectPageErrors, pressKey, readHook } from './helpers';

/**
 * The text of the game is drawn into a canvas that the browser resamples.
 * A glyph that starts half a pixel off gets split across the colour
 * channels, and the thin strokes of a 5x7 font turn to mush: the "I" in
 * BEGIN THE DREAM came out as a smear while SETTINGS, which started on a
 * whole pixel, stayed crisp.
 *
 * So every piece of text has to start on a whole pixel. This walks the
 * scenes and checks it.
 */
test('every piece of text starts on a whole pixel', async ({ page }) => {
  const errors = collectPageErrors(page);

  await bootToTitle(page);

  const offGrid = async (sceneName: string): Promise<string[]> => {
    const offenders = await page.evaluate((name) => {
      const game = window.__LYCEUM_GAME__;
      const scene = game?.scene.getScene(name);
      const found: string[] = [];

      if (!scene) {
        return found;
      }

      const visit = (list: unknown[]): void => {
        for (const child of list as Array<{
          type?: string;
          text?: string;
          x?: number;
          y?: number;
          displayWidth?: number;
          displayHeight?: number;
          originX?: number;
          originY?: number;
          list?: unknown[];
        }>) {
          if (child.type === 'BitmapText' && typeof child.text === 'string') {
            const left = (child.x ?? 0) - (child.displayWidth ?? 0) * (child.originX ?? 0);
            const top = (child.y ?? 0) - (child.displayHeight ?? 0) * (child.originY ?? 0);

            if (!Number.isInteger(left) || !Number.isInteger(top)) {
              found.push(`${child.text} at ${left},${top}`);
            }
          }

          if (child.list) {
            visit(child.list);
          }
        }
      };

      visit(scene.children.list);

      return found;
    }, sceneName);

    return offenders;
  };

  expect(await offGrid('Title')).toEqual([]);

  // The chapter card and the chapter-complete card are centred too.
  await pressKey(page, 'z');
  await expect.poll(() => readHook<string>(page, 'scene')).toBe('Story');
  await page.waitForTimeout(700);

  expect(await offGrid('Story')).toEqual([]);

  expect(errors).toEqual([]);
});
