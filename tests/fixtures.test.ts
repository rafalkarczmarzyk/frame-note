import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { wildlifeFixture } from './fixtures.ts';

it('preserves the original Lightroom fixture including its metadata bytes', async () => {
  const bytes = await readFile(wildlifeFixture.path);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(
    wildlifeFixture.sha256,
  );
});
