/**
 * Production smoke check.
 *
 * Runs against a built bundle served by `vite preview`, and asserts the things
 * that only break in production: a missing base path, a test hook that leaked
 * into the bundle, and a console error on first paint.
 *
 * Usage:
 *   npm run build
 *   npm run preview
 *   node tools/qa/smoke.mjs [--url http://127.0.0.1:4173/aristotlesLyceum/]
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);

function argument(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const url = argument('url', 'http://127.0.0.1:4173/aristotlesLyceum/');
const outDir = join('artifacts', 'qa', 'smoke');

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const problems = [];
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') {
    problems.push(`console: ${message.text()}`);
  }
});

const started = Date.now();
await page.goto(url, { waitUntil: 'load' });

await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return Boolean(canvas) && canvas.width > 0;
});

const canvasReadyMs = Date.now() - started;

const checks = {
  canvasVisible: await page.isVisible('canvas'),
  bootNoteRemoved: (await page.locator('#boot-note').count()) === 0,
  testHookAbsent: (await page.evaluate(() => window.__LYCEUM_TEST__)) === undefined,
  gameHandleAbsent: (await page.evaluate(() => window.__LYCEUM_GAME__)) === undefined,
};

await page.screenshot({ path: join(outDir, 'production.png') });
await browser.close();

const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

console.log(JSON.stringify({ url, canvasReadyMs, checks, problems, failures }, null, 2));

if (failures.length > 0 || problems.length > 0) {
  process.exit(1);
}

if (canvasReadyMs > 3000) {
  console.error(`canvas took ${canvasReadyMs}ms to become ready`);
  process.exit(1);
}
