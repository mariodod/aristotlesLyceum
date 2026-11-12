import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

/**
 * The default suite runs in Chromium only. Set BROWSER_MATRIX=1 to add the
 * desktop browsers listed in the acceptance criteria.
 */
const isMatrix = process.env.BROWSER_MATRIX === '1';

/**
 * Dialogue and scene-timing checks share a software renderer. Sequential runs
 * keep real-time input and typewriter assertions deterministic.
 */
const MATRIX_SPECS = ['**/title.spec.ts', '**/story.spec.ts', '**/settings.spec.ts'];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
    ...(isMatrix
      ? [
          {
            name: 'edge',
            testMatch: MATRIX_SPECS,
            use: {
              ...devices['Desktop Edge'],
              channel: 'msedge',
              launchOptions: { args: ['--enable-unsafe-swiftshader'] },
            },
          },
          { name: 'firefox', testMatch: MATRIX_SPECS, use: { ...devices['Desktop Firefox'] } },
          {
            name: 'webkit',
            testMatch: MATRIX_SPECS,
            use: {
              ...devices['Desktop Safari'],
              // Headless WebKit renders in software. At the device's 2x DPR the
              // frame rate collapses, which breaks real-time typewriter checks
              // for reasons that do not happen on Safari with a GPU. DPR
              // scaling stays covered by the Chromium runs.
              deviceScaleFactor: 1,
            },
          },
        ]
      : []),
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
