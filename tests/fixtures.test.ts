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
import { DOMParser } from '@xmldom/xmldom';

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
      author: ['Rafal Karczmarzyk', 'xmp:dc:creator'],
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
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['Recursive Tomatoes', 'xmp:dc:rights'],
      exposure: [
        '1/1600 s · f/10 · ISO 20000',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: portraitFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:dc:creator'],
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: ['RF200-800mm F6.3-9 IS USM + EXTENDER RF1.4x', 'exif:LensModel'],
      shutter: ['1/1250 s', 'exif:ExposureTime'],
      aperture: ['f/13', 'exif:FNumber'],
      iso: ['ISO 1000', 'exif:ISOSpeedRatings'],
      focalLength: ['1120 mm', 'exif:FocalLength'],
      date: ['2026-10-21', 'exif:DateTimeOriginal'],
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['Recursive Tomatoes', 'xmp:dc:rights'],
      exposure: [
        '1/1250 s · f/13 · ISO 1000',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: brightBackgroundFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:creator'],
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: ['RF200-800mm F6.3-9 IS USM', 'exif:LensModel'],
      shutter: ['1/3200 s', 'exif:ExposureTime'],
      aperture: ['f/10', 'exif:FNumber'],
      iso: ['ISO 1600', 'exif:ISOSpeedRatings'],
      focalLength: ['800 mm', 'exif:FocalLength'],
      date: ['2026-04-05', 'exif:DateTimeOriginal'],
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['Recursive Tomatoes', 'xmp:rights'],
      exposure: [
        '1/3200 s · f/10 · ISO 1600',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: macroFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:dc:creator'],
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: ['RF100mm F2.8 L MACRO IS USM', 'exif:LensModel'],
      shutter: ['1/100 s', 'exif:ExposureTime'],
      aperture: ['f/8', 'exif:FNumber'],
      iso: ['ISO 800', 'exif:ISOSpeedRatings'],
      focalLength: ['100 mm', 'exif:FocalLength'],
      date: ['2026-10-21', 'exif:DateTimeOriginal'],
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['Recursive Tomatoes', 'xmp:dc:rights'],
      exposure: [
        '1/100 s · f/8 · ISO 800',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: heliconFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:dc:creator'],
      camera: ['Canon EOS R6m2', 'exif:Model'],
      lens: ['RF100mm F2.8 L MACRO IS USM', 'exif:LensModel'],
      shutter: ['1/250 s', 'exif:ExposureTime'],
      aperture: ['f/9', 'exif:FNumber'],
      iso: ['ISO 400', 'exif:ISOSpeedRatings'],
      focalLength: ['100 mm', 'exif:FocalLength'],
      date: ['2026-10-20', 'exif:DateTimeOriginal'],
      exposure: [
        '1/250 s · f/9 · ISO 400',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
      heliconStack: [
        'Focus stack · 15 images · Method A · R=8 · S=4',
        'exif:UserComment',
      ],
      heliconStackCount: ['15', 'exif:UserComment'],
      copyright: ['Recursive Tomatoes', 'xmp:dc:rights'],
    },
  },
  {
    fixture: nightFixture,
    expected: {
      author: ['Rafal Karczmarzyk', 'xmp:dc:creator'],
      camera: ['Canon EOS RP', 'exif:Model'],
      lens: ['RF24-105mm F4 L IS USM', 'exif:LensModel'],
      shutter: ['3.2 s', 'exif:ExposureTime'],
      aperture: ['f/4', 'exif:FNumber'],
      iso: ['ISO 2000', 'exif:ISOSpeedRatings'],
      focalLength: ['25 mm', 'exif:FocalLength'],
      date: ['2021-02-28', 'exif:DateTimeOriginal'],
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['LiptuN Entertainment', 'xmp:dc:rights'],
      exposure: [
        '3.2 s · f/4 · ISO 2000',
        'exif:ExposureTime,exif:FNumber,exif:ISOSpeedRatings',
      ],
    },
  },
  {
    fixture: xmpPortraitFixture,
    expected: {
      author: ['PAULINA PECZEK', 'xmp:dc:creator'],
      camera: ['', ''],
      lens: ['EF-S24mm f/2.8 STM', 'xmp:exifEX:LensModel'],
      shutter: ['', ''],
      aperture: ['', ''],
      iso: ['', ''],
      focalLength: ['', ''],
      date: ['2020-07-22', 'xmp:photoshop:DateCreated'],
      heliconStack: ['', ''],
      heliconStackCount: ['', ''],
      copyright: ['', ''],
      exposure: ['', ''],
    },
  },
] as const;

it.each(helperFixtures)(
  'records existing helper values and selected sources for $fixture.path',
  async ({ fixture, expected }) => {
    const captionTagsPath = '../packages/core/src/caption-tags.ts';
    const extractMetadataPath =
      '../packages/editor/src/features/photo/extract-metadata.ts';
    const [{ captionTags }, { extractMetadata }] = await Promise.all([
      import(captionTagsPath),
      import(extractMetadataPath),
    ]);
    const bytes = await readFile(fixture.path);
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    let metadata;
    try {
      metadata = await extractMetadata(buffer, new DOMParser());
    } catch {
      metadata = await extractMetadata(buffer);
    }
    const resolvedHelpers = captionTags(metadata) as {
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

it('preserves XMP namespace provenance while resolving an existing photo', async () => {
  const bytes = await readFile(xmpPortraitFixture.path);
  const extractMetadataPath =
    '../packages/editor/src/features/photo/extract-metadata.ts';
  const captionTagsPath = '../packages/core/src/caption-tags.ts';
  const { extractMetadata } = await import(extractMetadataPath);
  const { captionTags } = await import(captionTagsPath);
  const parser = new DOMParser({
    onError: (level, message) => {
      if (level === 'error' || level === 'fatalError') throw new Error(message);
    },
  });
  const metadata = await extractMetadata(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
    parser,
  );
  const resolvedHelpers = captionTags(metadata) as {
    key: string;
    displayValue: string;
    sources: readonly string[];
  }[];
  const helpers = new Map(
    resolvedHelpers.map(({ key, displayValue, sources }) => [
      key,
      { displayValue, sources },
    ]),
  );

  expect(helpers.get('author')).toMatchObject({
    displayValue: 'PAULINA PECZEK',
    sources: ['xmp:dc:creator'],
  });
  expect(helpers.get('lens')).toMatchObject({
    displayValue: 'EF-S24mm f/2.8 STM',
    sources: ['xmp:exifEX:LensModel'],
  });
  expect(helpers.get('date')).toMatchObject({
    displayValue: '2020-07-22',
    sources: ['xmp:photoshop:DateCreated'],
  });
});
