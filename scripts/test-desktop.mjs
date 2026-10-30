import { _electron as electron, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({
  executablePath: require('electron'),
  args: [resolve('apps/desktop')],
  env,
});
try {
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Choose JPG or PNG photo')).toBeAttached();
  console.log('Desktop loaded:', await page.title());
  console.log(
    'Bridge isolation:',
    await page.evaluate(() => typeof window.require === 'undefined'),
  );
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await app.close();
}
