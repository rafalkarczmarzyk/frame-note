import { describe, expect, it } from 'vitest';
import ExifReader from 'exifreader';
import { createMetadataField } from '../../domain/metadata';
import {
  addExportMetadata,
  defaultExportMetadata,
  exportXmp,
} from './export-metadata';
const field = (name: string, rawValue: unknown, group = 'exif') =>
  createMetadataField({
    group,
    name,
    rawValue,
    displayValue: String(rawValue),
  });
const fields = [
  field('Artist', 'A & <B>'),
  field('Copyright', '© Author'),
  field('Model', 'Camera'),
  field('ExposureTime', [[1, 250]]),
  field('FNumber', [[28, 10]]),
  field('DateTimeOriginal', ['2026:10:26 12:30:00']),
  field('GPSLatitude', [
    [50, 1],
    [30, 1],
    [0, 1],
  ]),
  field('GPSLatitudeRef', ['N']),
  field('UserComment', 'Private comment'),
  field('Orientation', 6),
  field('MakerNote', 'secret'),
];
const all = {
  removeAll: false,
  groups: {
    author: true,
    camera: true,
    date: true,
    location: true,
    description: true,
  },
};
describe('export metadata', () => {
  it('removes everything by default, even with groups selected', () =>
    expect(exportXmp(fields, defaultExportMetadata())).toBe(''));
  it('keeps only author on first opt-in and escapes XML', () => {
    const xml = exportXmp(fields, {
      ...defaultExportMetadata(),
      removeAll: false,
    });
    expect(xml).toContain('A &amp; &lt;B&gt;');
    expect(xml).toContain('© Author');
    for (const value of ['Camera', 'Private comment', '2026', 'GPS', 'secret'])
      expect(xml).not.toContain(value);
  });
  it('writes rational, date and coordinate values without stale structural tags', () => {
    const xml = exportXmp(fields, all);
    expect(xml).toContain('<exif:ExposureTime>1/250</exif:ExposureTime>');
    expect(xml).toContain('<exif:FNumber>28/10</exif:FNumber>');
    expect(xml).toContain('2026-10-26T12:30:00');
    expect(xml).toContain('<exif:GPSLatitude>50,30N</exif:GPSLatitude>');
    expect(xml).not.toContain('Orientation');
    expect(xml).not.toContain('secret');
  });
  it('does not leak custom XMP properties with matching local names', () => {
    const custom = {
      ...field('creator', 'secret', 'xmp'),
      candidates: [
        {
          group: 'xmp',
          name: 'creator',
          source: 'custom',
          rawValue: 'secret',
          displayValue: 'secret',
          namespaceUri: 'urn:private',
        },
      ],
    };
    expect(exportXmp([custom], all)).toBe('');
  });
  it('returns the same blob when no fields are selected', async () => {
    const blob = new Blob(['original']);
    expect(await addExportMetadata(blob, fields, defaultExportMetadata())).toBe(
      blob,
    );
    expect(exportXmp([], all)).toBe('');
  });
  it('round-trips XMP through the actual reader and preserves JPEG bytes', async () => {
    const source = new Uint8Array([255, 216, 255, 224, 0, 4, 0, 0, 255, 217]);
    const result = await addExportMetadata(new Blob([source]), fields, all);
    const bytes = new Uint8Array(await result.arrayBuffer());
    expect([...bytes.slice(0, 8)]).toEqual([...source.slice(0, 8)]);
    expect([...bytes.slice(-2)]).toEqual([255, 217]);
    const tags = ExifReader.load(await result.arrayBuffer(), {
      expanded: true,
    });
    expect(tags.xmp?.creator?.description).toContain('A & <B>');
    expect(tags.xmp?.ExposureTime?.description).toBe('1/250');
    expect(tags.xmp?.GPSLatitude?.description).toBeDefined();
  });
  it('rejects oversized metadata instead of silently losing it', async () => {
    await expect(
      addExportMetadata(
        new Blob([new Uint8Array([255, 216, 255, 217])]),
        [field('Artist', 'a'.repeat(70000))],
        all,
      ),
    ).rejects.toThrow('limit');
  });
});
