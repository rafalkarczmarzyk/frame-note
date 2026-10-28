import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'canvas-glass.spec.ts',
  timeout: 90000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:6007', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    cwd: process.cwd(),
    command:
      'python3 -m http.server 6007 --bind 127.0.0.1 --directory storybook-static',
    url: 'http://127.0.0.1:6007',
    reuseExistingServer: false,
  },
});
