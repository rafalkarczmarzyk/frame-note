// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
// @ts-expect-error Build helpers are plain JavaScript.
import * as legal from '../scripts/legal-materials.mjs';
// @ts-expect-error Build helpers are plain JavaScript.
import { verifyLegalMaterials } from '../scripts/verify-legal-materials.mjs';
// @ts-expect-error Release helper is plain JavaScript.
import * as sourceDistribution from '../scripts/source-distribution.mjs';
const { legalFiles, packageNotice, packageDirectory } = legal;
const { upstreamSourceUrl, provenanceCommit, verifyPreferredSources } =
  sourceDistribution;

const temporary: string[] = [];
function folder() {
  const dir = mkdtempSync(join(tmpdir(), 'framenote-legal-test-'));
  temporary.push(dir);
  return dir;
}
afterEach(() =>
  temporary
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

it('rejects a declared license without its required text, including an upgraded fallback package', () => {
  const dir = folder();
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'example', version: '1.0.0', license: 'MIT' }),
  );
  expect(() => packageNotice(dir)).toThrow('Missing license material');
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({
      name: 'react-remove-scroll-bar',
      version: '2.3.9',
      license: 'MIT',
    }),
  );
  expect(() => packageNotice(dir)).toThrow('Missing license material');
});

it('finds the real package rather than a nested module-type marker', () => {
  const dir = folder();
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'example', version: '1.0.0' }),
  );
  mkdirSync(join(dir, 'dist'));
  writeFileSync(join(dir, 'dist/package.json'), '{"type":"module"}');
  expect(packageDirectory(join(dir, 'dist/index.js'))).toBe(dir);
});

it('preserves font notices and separate photograph restrictions alongside GPL', () => {
  const files = legalFiles([]);
  expect(files['LICENSE.txt']).toContain('Version 3, 29 June 2007');
  expect(files['THIRD_PARTY_NOTICES.txt']).toContain('SIL OPEN FONT LICENSE');
  expect(files['PHOTOGRAPHS.txt']).toContain('not licensed under the GNU GPL');
});

it('rejects a build with missing dependency inventory', () => {
  const dir = folder();
  mkdirSync(join(dir, 'legal'));
  writeFileSync(join(dir, 'legal/components.json'), '[]');
  expect(() => verifyLegalMaterials(dir)).toThrow('Missing dependency notices');
});

it('requires a pinned commit for preferred upstream source archives', () => {
  const commit = 'a'.repeat(40);
  expect(
    upstreamSourceUrl(
      { url: 'git+https://github.com/example/project.git' },
      commit,
    ),
  ).toBe(`https://codeload.github.com/example/project/tar.gz/${commit}`);
  expect(() =>
    upstreamSourceUrl('https://github.com/example/project', 'main'),
  ).toThrow('Missing pinned upstream source');
  expect(() =>
    upstreamSourceUrl('https://github.com.evil.test/example/project', commit),
  ).toThrow('Missing pinned upstream source');
});

it('rejects provenance for a different npm package digest', () => {
  const metadata = {
    repository: 'https://github.com/example/project',
    dist: { integrity: 'sha512-YWJj' },
  };
  const provenance = {
    bundle: {
      dsseEnvelope: {
        payload: Buffer.from(
          JSON.stringify({ subject: [{ digest: { sha512: 'wrong' } }] }),
        ).toString('base64'),
      },
    },
  };
  expect(() => provenanceCommit(metadata, provenance)).toThrow(
    'does not match npm package integrity',
  );
});

it('checks an available source override against the published JavaScript and rejects changed behavior', async () => {
  const source = folder(),
    published = folder();
  mkdirSync(join(source, 'src'));
  mkdirSync(join(published, 'dist/es2019'), { recursive: true });
  writeFileSync(
    join(source, 'src/index.ts'),
    'export const value: number = 1;',
  );
  writeFileSync(
    join(published, 'dist/es2019/index.js'),
    'export const value = 1;',
  );
  await expect(
    verifyPreferredSources(source, published),
  ).resolves.toBeUndefined();
  writeFileSync(
    join(source, 'src/index.ts'),
    'export const value: number = 2;',
  );
  await expect(verifyPreferredSources(source, published)).rejects.toThrow(
    'does not reproduce published module',
  );
});
