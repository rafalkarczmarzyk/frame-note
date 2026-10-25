import { describe, expect, it } from 'vitest';
import { captionTags, metadataGroups } from './caption-tags';
import {
  createMetadataField,
  type MetadataCandidate,
  type MetadataField,
} from './metadata';
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
function xmpField(
  name: string,
  candidates: MetadataCandidate[],
): MetadataField {
  return createMetadataField({
    group: 'xmp',
    name,
    displayValue: candidates[0]?.displayValue ?? '',
    rawValue: candidates[0]?.rawValue ?? null,
    candidates,
  });
}
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
  it('uses a primary photographic sensitivity when its EXIF type is absent or unspecified', () => {
    for (const fields of [
      [field('exif:PhotographicSensitivity', '640', 640)],
      [
        field('exif:PhotographicSensitivity', '640', 640),
        field('exif:SensitivityType', '0', 0),
      ],
    ]) {
      expect(get(fields, 'iso')).toMatchObject({
        displayValue: 'ISO 640',
        sources: ['exif:PhotographicSensitivity'],
      });
    }
  });
  it('resolves the 65535 sentinel only through an indicated full ISO speed in the same group', () => {
    const valid = [
      field('exif:PhotographicSensitivity', '65535', 65535),
      field('exif:SensitivityType', '3', 3),
      field('exif:ISOSpeed', '12800', 12800),
    ];
    expect(get(valid, 'iso')).toMatchObject({
      displayValue: 'ISO 12800',
      sources: ['exif:ISOSpeed', 'exif:SensitivityType'],
    });
    expect(
      get(
        [
          field('exif:PhotographicSensitivity', '65535', 65535),
          field('exif:SensitivityType', '3', 3),
          field('xmp:ISOSpeed', '12800', 12800),
        ],
        'iso',
      ).displayValue,
    ).toBe('');
    expect(
      get(
        [
          field('exif:PhotographicSensitivity', '65535', 65535),
          ...valid.slice(1, 2),
        ],
        'iso',
      ).displayValue,
    ).toBe('');
  });
  it('uses PhotographicSensitivity for each declared sensitivity type', () => {
    for (const type of [1, 2, 3, 4, 5, 6, 7]) {
      expect(
        get(
          [
            field('exif:PhotographicSensitivity', '800', 800),
            field('exif:SensitivityType', String(type), type),
          ],
          'iso',
        ),
      ).toMatchObject({
        displayValue: 'ISO 800',
        sources: ['exif:PhotographicSensitivity'],
      });
    }
  });
  it('rejects contradictions, reserved types, and list values', () => {
    expect(
      get(
        [
          field('exif:PhotographicSensitivity', '800', 800),
          field('exif:SensitivityType', '3', 3),
          field('exif:ISOSpeed', '1600', 1600),
        ],
        'iso',
      ).displayValue,
    ).toBe('');
    expect(
      get(
        [
          field('exif:PhotographicSensitivity', '800', 800),
          field('exif:SensitivityType', '8', 8),
        ],
        'iso',
      ).displayValue,
    ).toBe('');
    expect(
      get([field('exif:ISOSpeedRatings', '100, 200', [100, 200])], 'iso')
        .displayValue,
    ).toBe('');
  });
  it('resolves XMP ISO from allowed namespaces and preserves candidate provenance', () => {
    const candidates: MetadataCandidate[] = [
      {
        group: 'xmp',
        name: 'PhotographicSensitivity',
        source: 'xmp:other:PhotographicSensitivity',
        rawValue: 3200,
        displayValue: '3200',
        namespaceUri: 'urn:unrelated',
      },
      {
        group: 'xmp',
        name: 'PhotographicSensitivity',
        source: 'xmp:exif:PhotographicSensitivity',
        rawValue: 1600,
        displayValue: '1600',
        namespaceUri: 'http://ns.adobe.com/exif/1.0/',
      },
    ];
    expect(
      get([xmpField('PhotographicSensitivity', candidates)], 'iso'),
    ).toMatchObject({
      displayValue: 'ISO 1600',
      sources: ['xmp:exif:PhotographicSensitivity'],
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
    ).toBe('');
    expect(
      get([field('iptc:DateCreated', '20240229')], 'date').displayValue,
    ).toBe('2024-02-29');
    expect(
      get([field('exif:DateTimeOriginal', '2023:02:29 12:00:00')], 'date')
        .displayValue,
    ).toBe('');
    expect(
      get([field('exif:DateTimeOriginal', '2024:04:31 12:00:00')], 'date')
        .displayValue,
    ).toBe('');
    expect(
      get([field('xmp:CreateDate', '2024-02-29T12:00:00Z')], 'date')
        .displayValue,
    ).toBe('');
  });
  it('selects an XMP language alternative predictably and preserves equipment text', () => {
    const authorCandidates: MetadataCandidate[] = [
      {
        group: 'xmp',
        name: 'creator',
        source: 'xmp:dc:creator',
        rawValue: 'Auteur',
        displayValue: 'Auteur',
        namespaceUri: 'http://purl.org/dc/elements/1.1/',
        language: 'fr',
      },
      {
        group: 'xmp',
        name: 'creator',
        source: 'xmp:dc:creator',
        rawValue: 'Photographer',
        displayValue: 'Photographer',
        namespaceUri: 'http://purl.org/dc/elements/1.1/',
        language: 'x-default',
      },
    ];
    expect(
      get([xmpField('creator', authorCandidates)], 'author'),
    ).toMatchObject({
      displayValue: 'Photographer',
      sources: ['xmp:dc:creator'],
    });
    expect(
      get([field('exif:Model', ' EOS R6m2 ')], 'camera').displayValue,
    ).toBe('EOS R6m2');
    expect(
      get([field('exif:LensModel', 'EF-S24mm f/2.8 STM')], 'lens').displayValue,
    ).toBe('EF-S24mm f/2.8 STM');
    expect(
      get([field('exif:LensID', 'Canon RF100-500mm')], 'lens').displayValue,
    ).toBe('');
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
