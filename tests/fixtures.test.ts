import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { portraitFixture, wildlifeFixture } from './fixtures.ts';

it.each([wildlifeFixture, portraitFixture])(
  'preserves original fixture bytes: $path',
  async (fixture) => {
    const bytes = await readFile(fixture.path);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      fixture.sha256,
    );
  },
);
