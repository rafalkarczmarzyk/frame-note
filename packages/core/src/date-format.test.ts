import { expect, it } from 'vitest';
import {
  dateToken,
  parseDateToken,
  formatCaptureDate,
  validDateFormat,
} from './date-format';
import { createCaptionLayout } from './caption-layout';
import { createPreset, parsePreset } from './presets';
import { resolveTemplate } from '../../editor/src/features/caption/template';
import { metadataTokenStatus } from '../../editor/src/features/caption/editor/token-status';
import { createMetadataField } from './metadata';

it('round trips custom patterns through preset v1 and resolves occurrences independently', () => {
  const fields = [
    createMetadataField({
      group: 'exif',
      name: 'DateTimeOriginal',
      displayValue: '2026:01:06 23:00:00-12:00',
      rawValue: null,
    }),
  ];
  const layout = createCaptionLayout();
  layout.containers[0]!.template = `{date} / {${dateToken("'YY MM DD")}} / {${dateToken('D.M.YYYY')}}`;
  const preset = createPreset('dates', 'Dates', layout, []);
  const restored = parsePreset(JSON.stringify(preset), () => {
    throw Error('No SVG');
  });
  expect(restored).toEqual(preset);
  expect(
    resolveTemplate(restored.layout.containers[0]!.template, fields),
  ).toEqual({
    text: "2026-01-06 / '26 01 06 / 6.1.2026",
    missing: [],
    invalidSyntax: false,
  });
  expect(
    metadataTokenStatus(dateToken('DD/MM/YY'), { date: '2026-01-06' }),
  ).toBe('value');
  expect(metadataTokenStatus(dateToken('DD/MM/YY'), {})).toBe('empty');
});
it('validates formats and safely rejects malformed encodings and unsupported fields', () => {
  for (const value of [
    '',
    'YYYY',
    'YYYY-MM-DD-DD',
    'YYYY-MM-DD hh:mm',
    '{date}',
    'YYYY\nMM\nDD',
    'YYYY-MM-DD<script>',
    'YY%MM%DD',
  ]) {
    expect(validDateFormat(value)).toBe(false);
    expect(() => dateToken(value)).toThrow();
  }
  expect(parseDateToken('date:%E0%A4%A')).toBeNull();
  expect(resolveTemplate('{date:YYYY}', []).invalidSyntax).toBe(true);
  expect(parseDateToken('date')).toEqual({ format: 'YYYY-MM-DD' });
  expect(parseDateToken(dateToken("DD MM 'YY"))).toEqual({
    format: "DD MM 'YY",
  });
  expect(formatCaptureDate('', 'YYYY-MM-DD')).toBe('');
});

it('uses capture time without timezone conversion and never invents midnight', () => {
  const field = (value: string) =>
    createMetadataField({
      group: 'exif',
      name: 'DateTimeOriginal',
      displayValue: value,
      rawValue: value,
    });
  const token = dateToken('YYYY/MM/DD HH:mm');
  expect(
    resolveTemplate(`{${token}}`, [field('2007:04:06 15:00:23+12:00')]),
  ).toEqual({ text: '2007/04/06 15:00', missing: [], invalidSyntax: false });
  for (const value of [
    '2007:04:06',
    '2007:04:06 24:00:00',
    '2007:04:06 15:60:00',
    '2007:02:29 15:00:00',
  ]) {
    expect(resolveTemplate(`{${token}}`, [field(value)]).text).toBe('');
    expect(resolveTemplate(`{${token}}`, [field(value)]).missing).toContain(
      token,
    );
  }
  expect(
    resolveTemplate('{date:YYYY%2FMM%2FDD}', [field('2007:04:06')]).text,
  ).toBe('2007/04/06');
  expect(
    metadataTokenStatus(token, {
      date: '2007-04-06',
      dateTime: '2007-04-06 15:00',
    }),
  ).toBe('value');
  expect(metadataTokenStatus(token, { date: '2007-04-06' })).toBe('empty');
  expect(validDateFormat('YYYY/MM/DD HH')).toBe(false);
  expect(validDateFormat('YYYY/MM/DD mm')).toBe(false);
});
