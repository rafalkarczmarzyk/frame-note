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
