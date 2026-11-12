import { expect, type Page } from '@playwright/test';

/**
 * Shared helpers for the browser suite.
 */

/**
 * Waits two animation frames so Phaser drains the input queue before the next
 * event is sent.
 */
export async function settleInput(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

export async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await settleInput(page);
  await page.keyboard.up(key);
  await settleInput(page);
}

/** Boots the game and waits for the title screen. */
export async function bootToTitle(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => {
    const hook = window.__LYCEUM_TEST__;
    return hook?.ready === true && hook.scene === 'Title';
  });
}

export function readHook<T>(page: Page, key: string): Promise<T> {
  return page.evaluate(
    (name) => (window.__LYCEUM_TEST__ as unknown as Record<string, unknown> | undefined)?.[name],
    key,
  ) as Promise<T>;
}

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  return errors;
}

/** Starts Act I from the title screen. */
export async function startActOne(page: Page): Promise<void> {
  await bootToTitle(page);
  await pressKey(page, 'z');
  await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Story');
  await expect.poll(() => readHook<string>(page, 'chapter')).toBe('act-one');

  // The act card covers the first line, so one confirm clears it.
  await pressKey(page, 'z');
}

/**
 * Moves to the next line of dialogue.
 *
 * A confirm press completes the typewriter reveal when the line is still
 * typing, and advances when it is not. Doing both in one helper keeps the
 * tests from depending on the speed of the animation.
 */
export async function nextLine(page: Page): Promise<void> {
  if (await readHook<boolean>(page, 'typing')) {
    await pressKey(page, 'z');
  }

  await pressKey(page, 'z');
}

/** Advances dialogue until a choice menu opens. */
export async function advanceUntilChoice(page: Page, maxSteps = 24): Promise<void> {
  for (let index = 0; index < maxSteps; index += 1) {
    if (await readHook<boolean>(page, 'choosing')) {
      return;
    }

    await nextLine(page);
  }
}

/**
 * Advances dialogue until a line contains the given text. Stops as soon as the
 * text shows up so the test never overshoots into the next scene.
 */
export async function advanceUntilText(page: Page, needle: string, maxSteps = 30): Promise<void> {
  for (let index = 0; index < maxSteps; index += 1) {
    if ((await readHook<string>(page, 'lineText')).includes(needle)) {
      return;
    }

    await nextLine(page);
  }
}

/** Picks the option at the given index in the open choice menu. */
export async function chooseOption(page: Page, index: number): Promise<void> {
  for (let step = 0; step < index; step += 1) {
    await pressKey(page, 'ArrowDown');
  }

  await pressKey(page, 'z');
}

/** Plays a chapter through to its chapter-complete card. */
export async function advanceUntilEndCard(page: Page, maxSteps = 80): Promise<void> {
  for (let index = 0; index < maxSteps; index += 1) {
    if (await readHook<boolean>(page, 'endCardVisible')) {
      return;
    }

    if (await readHook<boolean>(page, 'choosing')) {
      await pressKey(page, 'z');
      continue;
    }

    await nextLine(page);
  }
}
