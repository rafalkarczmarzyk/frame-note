import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import {
  brightBackgroundFixture,
  heliconFixture,
  macroFixture,
  nightFixture,
  portraitFixture,
  wildlifeFixture,
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

const helperFixtures = [
  {
    fixture: wildlifeFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:creator'],
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: [
        'RF100-500mm F4.5-7.1 L IS USM + EXTENDER RF1.4x',
        'exif:LensModel',
      ],
      shutter: ['1/1600 s', 'exif:ExposureTime'],
      aperture: ['f/10', 'exif:FNumber'],
      iso: ['ISO 20000', 'exif:ISOSpeedRatings'],
      focalLength: ['700 mm', 'exif:FocalLength'],
      date: ['2026-05-20', 'exif:DateTimeOriginal'],
      copyright: ['Recursive Tomatoes', 'xmp:rights'],
    },
  },
  {
    fixture: portraitFixture,
    expected: {
      camera: ['Canon EOS R6m2', 'exif:Model'],
      shutter: ['1/1250 s', 'exif:ExposureTime'],
      aperture: ['f/13', 'exif:FNumber'],
      iso: ['ISO 1000', 'exif:ISOSpeedRatings'],
      focalLength: ['1120 mm', 'exif:FocalLength'],
    },
  },
  {
    fixture: brightBackgroundFixture,
    expected: {
      camera: ['Canon EOS R6m2', 'exif:Model'],
      shutter: ['1/3200 s', 'exif:ExposureTime'],
      aperture: ['f/10', 'exif:FNumber'],
      iso: ['ISO 1600', 'exif:ISOSpeedRatings'],
      focalLength: ['800 mm', 'exif:FocalLength'],
    },
  },
  {
    fixture: macroFixture,
    expected: {
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: ['RF100mm F2.8 L MACRO IS USM', 'exif:LensModel'],
      exposure: [
        '1/100 s · f/8 · ISO 800',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: heliconFixture,
    expected: {
      exposure: [
        '1/250 s · f/9 · ISO 400',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
      heliconStack: [
        'Focus stack · 15 images · Method A · R=8 · S=4',
        'exif:UserComment',
      ],
      heliconStackCount: ['15', 'exif:UserComment'],
    },
  },
  {
    fixture: nightFixture,
    expected: {
      camera: ['Canon EOS RP', 'exif:Model'],
      shutter: ['3.2 s', 'exif:ExposureTime'],
      aperture: ['f/4', 'exif:FNumber'],
      iso: ['ISO 2000', 'exif:ISOSpeedRatings'],
    },
  },
  {
    fixture: xmpPortraitFixture,
    expected: {
      author: ['PAULINA PECZEK', 'xmp:creator'],
      lens: ['EF-S24mm f/2.8 STM', 'xmp:LensModel'],
      date: ['2020-07-22', 'xmp:DateCreated'],
    },
  },
] as const;

it.each(helperFixtures)(
  'records existing helper values and selected sources for $fixture.path',
  async ({ fixture, expected }) => {
    const captionTagsPath = '../src/domain/caption-tags.ts';
    const normalizeMetadataPath = '../src/features/photo/metadata.ts';
    const [{ captionTags }, { normalizeMetadata }] = await Promise.all([
      import(captionTagsPath),
      import(normalizeMetadataPath),
    ]);
    const bytes = await readFile(fixture.path);
    const tags = await ExifReader.load(
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
      { expanded: true, async: true },
    );
    const resolvedHelpers = captionTags(normalizeMetadata(tags)) as {
      key: string;
      displayValue: string;
      sources: readonly string[];
    }[];
    const helpers = new Map(
      resolvedHelpers.map(({ key, displayValue, sources }) => [
        key,
        { displayValue, sources: sources.join(',') },
      ]),
    );

    for (const [name, [displayValue, source]] of Object.entries(expected)) {
      expect(helpers.get(name), `${fixture.path}: ${name}`).toEqual({
        displayValue,
        sources: source,
      });
    }
  },
);
