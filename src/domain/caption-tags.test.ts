import { describe, expect, it } from 'vitest';
import { captionTags, metadataGroups } from './caption-tags';
import { createMetadataField, type MetadataField } from './metadata';
import { resolveTemplate } from '../features/caption/template';

function field(
  key: string,
  displayValue: string,
  rawValue: unknown = displayValue,
): MetadataField {
  const [group, name] = key.split(':');
  return createMetadataField({
    group: group!,
    name: name!,
    displayValue,
    rawValue,
  });
}
const get = (fields: MetadataField[], name: string) =>
  captionTags(fields).find((tag) => tag.key === name)!;
describe('FrameNote caption helpers', () => {
  it('chooses the first non-empty source and reports its provenance', () => {
    const fields = [
      field('xmp:creator', '  '),
      field('exif:Artist', 'Author'),
      field('iptc:By-line', 'Other'),
    ];
    expect(get(fields, 'author')).toMatchObject({
      displayValue: 'Author',
      sources: ['exif:Artist'],
    });
    expect(
      get([field('xmp:creator', 'XMP'), ...fields.slice(1)], 'author')
        .displayValue,
    ).toBe('XMP');
  });
  it('formats raw exposure values and combines only available parts', () => {
    const fields = [
      field('exif:ExposureTime', '1/250', [1, 250]),
      field('exif:FNumber', 'f/8.0', [8, 1]),
      field('exif:ISOSpeedRatings', '400', 400),
      field('exif:FocalLength', '100 mm', [100, 1]),
    ];
    expect(get(fields, 'exposure')).toMatchObject({
      displayValue: '1/250 s · f/8 · ISO 400',
      sources: ['exif:ExposureTime', 'exif:FNumber', 'exif:ISOSpeedRatings'],
    });
    expect(get(fields, 'iso').displayValue).toBe('ISO 400');
    expect(get(fields, 'shutter').displayValue).toBe('1/250 s');
    expect(get(fields, 'focalLength').displayValue).toBe('100 mm');
    expect(get(fields.slice(2), 'exposure').displayValue).toBe('ISO 400');
    expect(
      get([field('xmp:ExposureTime', '3.2', '32/10')], 'shutter').displayValue,
    ).toBe('3.2 s');
  });
  it('falls back past unusable values instead of inventing exposure data', () => {
    const fields = [
      field('exif:FNumber', 'unknown', [0, 0]),
      field('xmp:FNumber', 'f/2.8', '2.8'),
    ];
    expect(get(fields, 'aperture')).toMatchObject({
      displayValue: 'f/2.8',
      sources: ['xmp:FNumber'],
    });
    expect(get([], 'exposure').displayValue).toBe('');
    expect(get([], 'camera').sources).toEqual([]);
  });
  it('parses rational values by tag meaning and keeps ISO lists out of fractions', () => {
    const fields = [
      field('exif:ExposureTime', '1/250', [1, 250]),
      field('exif:FNumber', 'f/2.8', [28, 10]),
      field('exif:FocalLength', '100 mm', [100, 1]),
      field('exif:ISOSpeedRatings', '100, 200', [100, 200]),
      field('xmp:ISOSpeedRatings', 'ISO 800', '800'),
    ];

    expect(get(fields, 'shutter')).toMatchObject({
      displayValue: '1/250 s',
      sources: ['exif:ExposureTime'],
    });
    expect(get(fields, 'aperture').displayValue).toBe('f/2.8');
    expect(get(fields, 'focalLength').displayValue).toBe('100 mm');
    expect(get(fields, 'iso')).toMatchObject({
      displayValue: 'ISO 800',
      sources: ['xmp:ISOSpeedRatings'],
    });
  });
  it('converts APEX shutter and aperture values after direct values', () => {
    const fields = [
      field('exif:ShutterSpeedValue', '1/128', [7, 1]),
      field('exif:ApertureValue', '8.00', [6, 1]),
    ];

    expect(get(fields, 'shutter')).toMatchObject({
      displayValue: '1/128 s',
      sources: ['exif:ShutterSpeedValue'],
    });
    expect(get(fields, 'aperture')).toMatchObject({
      displayValue: 'f/8',
      sources: ['exif:ApertureValue'],
    });
    expect(
      get([field('exif:ShutterSpeedValue', '4', [-2, 1])], 'shutter'),
    ).toMatchObject({ displayValue: '4 s' });
    expect(
      get(
        [
          field('exif:ExposureTime', 'not a rational', [0, 0]),
          field('xmp:ExposureTime', '1/125', '1/125'),
        ],
        'shutter',
      ),
    ).toMatchObject({ displayValue: '1/125 s', sources: ['xmp:ExposureTime'] });
  });
  it('normalizes capture date without time zone conversion', () => {
    expect(
      get([field('exif:DateTimeOriginal', '2020:07:22 17:06:17')], 'date')
        .displayValue,
    ).toBe('2020-07-22');
    expect(
      get([field('xmp:CreateDate', '2020-07-22T17:06:17.79')], 'date')
        .displayValue,
    ).toBe('2020-07-22');
  });
  it('keeps originals unchanged and resolves both helper and source tokens', () => {
    const fields = [
      field('xmp:creator', 'Author'),
      field('exif:Artist', 'Other'),
    ];
    const before = structuredClone(fields);
    expect(
      resolveTemplate('{author} / {exif:Artist} / {xmp:creator}', fields),
    ).toMatchObject({
      text: 'Author / Other / Author',
      missing: [],
      invalidSyntax: false,
    });
    expect(fields).toEqual(before);
    expect(resolveTemplate('{iso}', fields)).toMatchObject({
      text: '',
      missing: ['iso'],
      invalidSyntax: false,
    });
  });
  it('groups helpers first and retains namespaces when searching source names', () => {
    const fields = [
      field('xmp:creator', 'Author'),
      field('exif:Artist', 'Other'),
      field('iptc:By-line', 'Name'),
      field('file:Image Width', '1200'),
    ];
    const groups = metadataGroups(fields, '');
    expect(groups.map((group) => group.name)).toEqual([
      'FrameNote',
      'exif',
      'xmp',
      'iptc',
      'file',
    ]);
    expect(
      groups
        .slice(1)
        .flatMap((group) => group.fields)
        .map((item) => item.key)
        .sort(),
    ).toEqual(fields.map((item) => item.key).sort());
    expect(
      metadataGroups(fields, 'xmp:creator').map((group) => group.name),
    ).toEqual(['FrameNote', 'xmp']);
  });
});
