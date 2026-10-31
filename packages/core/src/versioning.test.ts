import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
const script = resolve('scripts/versioning.mjs');
it('synchronizes manifests and detects missing changelog coverage and version mismatch', async () => {
  const root = await mkdtemp(join(tmpdir(), 'framenote-versioning-'));
  const files = [
    'package.json',
    'apps/web/package.json',
    'apps/desktop/package.json',
    'packages/core/package.json',
    'packages/editor/package.json',
  ];
  try {
    for (const file of files) {
      await mkdir(dirname(join(root, file)), { recursive: true });
      await writeFile(
        join(root, file),
        JSON.stringify({ version: '0.0.3-alpha' }),
      );
    }
    const run = (...args: string[]) =>
      execFileSync(process.execPath, [script, ...args], {
        cwd: root,
        stdio: 'pipe',
      }).toString();
    expect(() => run('set', '0.1.0-beta.1')).toThrow();
    run('set', '0.1.0-beta');
    for (const file of files)
      expect(JSON.parse(await readFile(join(root, file), 'utf8')).version).toBe(
        '0.1.0-beta',
      );
    await writeFile(join(root, 'CHANGELOG.md'), '## Unreleased\n');
    expect(() => run('check')).toThrow();
    await writeFile(
      join(root, 'CHANGELOG.md'),
      '## Unreleased\n\n## [0.1.0-beta] - 2026-10-31\n',
    );
    expect(run('check')).toContain('agree');
    await writeFile(
      join(root, files[1]!),
      JSON.stringify({ version: '0.2.0-beta' }),
    );
    expect(() => run('check')).toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
