/**
 * Screenshot capture for visual review.
 *
 * Usage:
 *   node tools/qa/screenshots.mjs [--url http://127.0.0.1:5173] [--out artifacts/qa]
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);

function argument(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const url = argument('url', 'http://127.0.0.1:5173');
const outDir = argument('out', join('artifacts', 'qa'));

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const problems = [];
page.on('pageerror', (error) => problems.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') {
    problems.push(message.text());
  }
});

async function shot(name) {
  await page.screenshot({ path: join(outDir, `${name}.png`) });
  console.log(`captured ${name}`);
}

async function settle(frames = 4) {
  await page.evaluate(
    (count) =>
      new Promise((resolve) => {
        let left = count;
        const step = () => (left-- > 0 ? requestAnimationFrame(step) : resolve());
        step();
      }),
    frames,
  );
}

await page.goto(url);
await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Title');
await settle();
await shot('01-title');

await page.keyboard.press('z');
await page.waitForFunction(() => window.__LYCEUM_TEST__?.scene === 'Story');
await settle();
await shot('02-act-one');

// Reveal the first line and step through a few more.
for (let index = 0; index < 4; index += 1) {
  await page.keyboard.press('z');
  await settle(8);
}
await shot('03-dialogue');

// Walk to the first choice.
for (let index = 0; index < 40; index += 1) {
  const choosing = await page.evaluate(() => window.__LYCEUM_TEST__?.choosing === true);
  if (choosing) {
    break;
  }
  await page.keyboard.press('z');
  await settle(8);
}
await shot('04-choice');

// Play through to the chapter-complete card.
for (let index = 0; index < 160; index += 1) {
  const done = await page.evaluate(() => window.__LYCEUM_TEST__?.endCardVisible === true);
  if (done) {
    break;
  }
  await page.keyboard.press('z');
  await settle(6);
}
await settle(30);
await shot('05-chapter-complete');

await browser.close();

if (problems.length > 0) {
  console.error(`page errors:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  process.exit(1);
}

console.log(`screenshots written to ${outDir}`);
