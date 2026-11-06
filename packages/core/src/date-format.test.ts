import { expect, it } from 'vitest';
import {
  dateToken,
  segmentYearMark,
  parseDateToken,
  formatCaptureDate,
  validDateFormat,
} from './date-format';
import { layerContentLabel } from '../../editor/src/features/layers/layer-content-label';
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

it('formats contextual month names with a language stored per occurrence', () => {
  expect(formatCaptureDate('2026-07-06', 'D MMMM YYYY', 'pl')).toBe(
    '6 lipca 2026',
  );
  expect(formatCaptureDate('2026-07-06', 'D MMM YYYY', 'pl')).toBe(
    '6 lip 2026',
  );
  expect(formatCaptureDate('2026-07-06', 'D MMMM YYYY', 'en')).toBe(
    '6 July 2026',
  );
  expect(formatCaptureDate('2026-07-06', 'D MMM YYYY', 'en')).toBe(
    '6 Jul 2026',
  );
  const layout = createCaptionLayout();
  layout.containers[0]!.template = `{${dateToken('D MMMM YYYY', 'pl')}} / {${dateToken('D MMM YYYY', 'en')}} / {${dateToken('h:mm A', undefined, 'time')}}`;
  const preset = createPreset('localized', 'Localized', layout, []);
  const restored = parsePreset(JSON.stringify(preset), () => {
    throw Error('No asset');
  });
  expect(restored).toEqual(preset);
  const fields = [
    createMetadataField({
      group: 'exif',
      name: 'DateTimeOriginal',
      displayValue: '2026:07:06 15:05:00+12:00',
      rawValue: null,
    }),
  ];
  expect(
    resolveTemplate(restored.layout.containers[0]!.template, fields),
  ).toEqual({
    text: '6 lipca 2026 / 6 Jul 2026 / 3:05 PM',
    missing: [],
    invalidSyntax: false,
  });
  expect(parseDateToken('date:D%20MMMM%20YYYY|de')).toBeNull();
  expect(parseDateToken('date:D%20MMMM%20YYYY|pl|en')).toBeNull();
});

it('formats time-only tokens at midnight, noon and the end of the day', () => {
  for (const [time, expected] of [
    ['00:00', '12:00 AM'],
    ['12:00', '12:00 PM'],
    ['23:59', '11:59 PM'],
    ['03:05', '3:05 AM'],
  ]) {
    expect(formatCaptureDate(time!, 'h:mm A', 'en', true)).toBe(expected);
  }
  expect(formatCaptureDate('03:05', 'hh:mm A', 'en', true)).toBe('03:05 AM');
  expect(formatCaptureDate('2026-07-06', 'h:mm A', 'en', true)).toBe('');
  expect(formatCaptureDate('24:00', 'HH:mm', 'en', true)).toBe('');
  expect(formatCaptureDate('2026-02-30', 'D MMM YYYY')).toBe('');
  expect(formatCaptureDate('2026-13-01', 'D MMM YYYY')).toBe('');
  const token = dateToken('h:mm A', undefined, 'time');
  expect(metadataTokenStatus(token, { time: '15:05' })).toBe('value');
  expect(metadataTokenStatus(token, { date: '2026-07-06' })).toBe('empty');
  expect(resolveTemplate(`{${token}}`, []).missing).toEqual([token]);
  expect(resolveTemplate('{time:invalid}', []).invalidSyntax).toBe(true);
  for (const format of [
    'h:mm',
    'HH:mm A',
    'hh:mm A A',
    'HH:mm HH:mm',
    'MMMM MM D YYYY',
  ]) {
    expect(validDateFormat(format, !format.includes('YYYY'))).toBe(false);
  }
  expect(dateToken('HH:mm', undefined, 'time')).toBe('time');
});

it('round trips the selected upper-right year mark without changing legacy apostrophes', () => {
  const format = `${segmentYearMark}YY-MM-DD`;
  expect(validDateFormat(format)).toBe(true);
  expect(validDateFormat('\uF063YY-MM-DD')).toBe(false);
  const token = dateToken(format);
  expect(token).toBe('date:%EF%81%A2YY-MM-DD');
  expect(parseDateToken(token)).toEqual({ format });
  expect(formatCaptureDate('2026-07-06', format)).toBe(
    `${segmentYearMark}26-07-06`,
  );
  expect(formatCaptureDate('2026-07-06', "'YY-MM-DD")).toBe("'26-07-06");
  const layout = createCaptionLayout();
  layout.containers[0]!.template = `{${token}}`;
  layout.containers[0]!.style.fontFamily = '7-Segment';
  expect(layerContentLabel(layout.containers[0]!)).toBe("date ('YY-MM-DD)");
  expect(
    layerContentLabel({
      template: `{${dateToken('h:mm A', undefined, 'time')}}`,
    }),
  ).toBe('time (h:mm A)');
  const preset = createPreset('year-mark', 'Year mark', layout, []);
  expect(
    parsePreset(JSON.stringify(preset), () => {
      throw Error('No asset');
    }),
  ).toEqual(preset);
});
