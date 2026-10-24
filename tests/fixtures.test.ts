import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import {
  portraitFixture,
  wildlifeFixture,
  brightBackgroundFixture,
  macroFixture,
  heliconFixture,
  nightFixture,
  xmpPortraitFixture,
} from './fixtures.ts';
import ExifReader from 'exifreader';

it.each([
  wildlifeFixture,
  portraitFixture,
  brightBackgroundFixture,
  macroFixture,
  heliconFixture,
  nightFixture,
  xmpPortraitFixture,
])('preserves original fixture bytes: $path', async (fixture) => {
  const bytes = await readFile(fixture.path);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(fixture.sha256);
});

it('reads the original Helicon EXIF comment', async () => {
  const bytes = await readFile(heliconFixture.path);
  const tags = ExifReader.load(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  );
  expect(tags.UserComment).toMatchObject({
    description: heliconFixture.expectedExif.UserComment,
  });
});
