import { expect, it } from 'vitest';
import { presetBasename, presetFilename } from './preset-filename';

it.each([
  ['Macro', 'macro'],
  ['Wildlife Night Photos', 'wildlife-night-photos'],
  ['  Macro   Flowers  ', 'macro-flowers'],
  ['Zażółć gęślą jaźń', 'zazolc-gesla-jazn'],
  ['Crème brûlée', 'creme-brulee'],
  ['Cafe\u0301', 'cafe'],
  ['Café', 'cafe'],
  ['Macro / Flowers \\ Garden', 'macro-flowers-garden'],
  ['Photo<>:"|?*Preset', 'photo-preset'],
  ['macro___---flowers', 'macro-flowers'],
  ['...Macro...', 'macro'],
  ['Macro\tNight\nSky', 'macro-night-sky'],
  ['Macro\0Flowers', 'macro-flowers'],
  ['📷 Macro 🌸 Flowers', 'macro-flowers'],
  ['../..\\Macro', 'macro'],
  ['', 'preset'],
  ['   ', 'preset'],
  ['???', 'preset'],
  ['🌸', 'preset'],
  ['CON', 'preset-con'],
  ['nul', 'preset-nul'],
  ['COM1', 'preset-com1'],
  ['LPT9', 'preset-lpt9'],
  ['CONcert', 'concert'],
  ['COM10', 'com10'],
  ['中文', 'preset'],
  ['日本語 Macro', 'macro'],
  ['Macro.JSON', 'macro-json'],
  ['a'.repeat(180), 'a'.repeat(180)],
  ['a'.repeat(181), 'a'.repeat(180)],
  ['a'.repeat(179) + ' b', 'a'.repeat(179)],
  ['COM¹', 'preset-com1'],
  ['Straße Øresund', 'strasse-oresund'],
])('converts %j into a portable basename', (input, expected) => {
  expect(presetBasename(input)).toBe(expected);
  expect(presetFilename(input, new Set())).toBe(expected + '.json');
});
it('numbers case-insensitive collisions including truncated names', () => {
  expect(presetFilename('Macro', new Set(['MACRO.json']))).toBe('macro-2.json');
  expect(presetFilename('Macro', new Set(['macro.json', 'macro-2.json']))).toBe(
    'macro-3.json',
  );
  const base = 'a'.repeat(180);
  expect(presetFilename(base + 'b', new Set([base + '.json']))).toBe(
    base + '-2.json',
  );
});
