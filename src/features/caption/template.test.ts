import { describe, expect, it } from 'vitest';
import { createMetadataField } from '../../domain/metadata';
import { resolveTemplate } from './template';
const fields = [
  createMetadataField({
    group: 'exif',
    name: 'Artist',
    displayValue: 'Rafal',
    rawValue: 'Rafal',
  }),
];
describe('template', () => {
  it('replaces repeated qualified tokens and preserves literal separators', () => {
    expect(resolveTemplate('{exif:Artist} · {exif:Artist}', fields).text).toBe(
      'Rafal · Rafal',
    );
  });
  it('reports missing fields once and removes empty lines', () => {
    expect(
      resolveTemplate(
        '{exif:Artist}\r\n{exif:Missing}\n{exif:Missing}',
        fields,
      ),
    ).toEqual({
      text: 'Rafal',
      missing: ['exif:Missing'],
      invalidSyntax: false,
    });
  });
  it.each(['{', '{Artist}', '{}', '{{exif:Artist}}'])(
    'reports invalid syntax %s',
    (input) => {
      expect(resolveTemplate(input, fields).invalidSyntax).toBe(true);
    },
  );
  it('does not parse braces in metadata as further tokens', () => {
    const values = [
      createMetadataField({
        group: 'exif',
        name: 'Artist',
        displayValue: '{literal}',
        rawValue: '',
      }),
    ];
    expect(resolveTemplate('{exif:Artist}', values).text).toBe('{literal}');
  });
});

it('preserves intentional blank lines but drops lines emptied by missing metadata', () => {
  expect(resolveTemplate('A\n\n{exif:Missing}\nB', []).text).toBe('A\n\nB');
  expect(resolveTemplate('\nA\n\n', []).text).toBe('\nA\n\n');
});

it('treats an existing metadata field with an empty value as missing', () => {
  const empty = createMetadataField({
    group: 'exif',
    name: 'Artist',
    displayValue: '  ',
    rawValue: null,
  });
  expect(resolveTemplate('{exif:Artist}', [empty])).toMatchObject({
    text: '',
    missing: ['exif:Artist'],
  });
});
