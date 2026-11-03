// SPDX-License-Identifier: GPL-3.0-or-later
import { afterEach, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
// @ts-expect-error Build helper is plain JavaScript.
import { packagedFileReader } from '../scripts/verify-packaged-legal.mjs';

const require = createRequire(import.meta.url);
const asar = createRequire(require.resolve('@electron/packager'))(
  '@electron/asar',
);
const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporary.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

for (const packed of [false, true]) {
  it(`reads nested license files and rejects missing files in ${packed ? 'ASAR' : 'unpacked'} apps`, async () => {
    const resources = await mkdtemp(
      join(tmpdir(), 'framenote-packaged-legal-'),
    );
    temporary.push(resources);
    const app = join(resources, 'app');
    await mkdir(join(app, 'renderer', 'legal'), { recursive: true });
    await writeFile(join(app, 'LICENSE'), 'Root license');
    await writeFile(
      join(app, 'renderer', 'legal', 'LICENSE.txt'),
      'Nested GPL license',
    );
    await writeFile(
      join(app, 'renderer', 'legal', 'CHROMIUM.html'),
      '<html>Native notices</html>',
    );
    if (packed) {
      await asar.createPackage(app, join(resources, 'app.asar'));
      await rm(app, { recursive: true });
    }
    const read = packagedFileReader(resources);
    expect(read('LICENSE').toString()).toBe('Root license');
    expect(read('renderer/legal/LICENSE.txt').toString()).toBe(
      'Nested GPL license',
    );
    expect(read('renderer/legal/CHROMIUM.html').toString()).toBe(
      '<html>Native notices</html>',
    );
    expect(() => read('renderer/legal/missing.txt')).toThrow();
  });
}
