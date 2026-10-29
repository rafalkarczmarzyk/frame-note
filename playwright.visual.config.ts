import { defineConfig } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
export default defineConfig({
  timeout: 60000,
  metadata: {
    revision: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    dirty: Boolean(
      execFileSync('git', ['status', '--porcelain'], {
        encoding: 'utf8',
      }).trim(),
    ),
    platform: process.platform,
    node: process.version,
    chromiumRenderer: 'software (--disable-gpu)',
  },
  testDir: './tests/visual',
  workers: 1,
  retries: 0,
  updateSnapshots: 'none',
  outputDir: 'visual-test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-visual-report', open: 'never' }],
  ],
  snapshotPathTemplate:
    '{testDir}/snapshots/{platform}/{projectName}/{testFilePath}/{testName}/{arg}{ext}',
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0,
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:4184',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'Europe/Warsaw',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        browserName: 'chromium',
        launchOptions: { args: ['--disable-gpu'] },
      },
    },
    {
      name: 'chromium-compact',
      use: {
        browserName: 'chromium',
        launchOptions: { args: ['--disable-gpu'] },
        viewport: { width: 1100, height: 700 },
      },
    },
    {
      name: 'webkit-desktop',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: [
    {
      command:
        'pnpm build && pnpm preview --host 127.0.0.1 --port 4184 --strictPort',
      url: 'http://127.0.0.1:4184',
      reuseExistingServer: false,
    },
  ],
});
