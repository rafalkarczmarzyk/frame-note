import { afterEach, expect, it } from 'vitest';
import { systemFontCatalog } from './system-fonts';
import { setSystemFonts, availableFonts, resolvedFontFamily } from './fonts';
import { supportsBold, supportsItalic, effectiveFontStyle } from './font-style';
import { createCaption } from './document';

afterEach(() => setSystemFonts([]));
it('groups families, prefers bundled names and records only real face combinations', () => {
  const catalog = systemFontCatalog([
    { family: 'Inter', style: 'Regular', postscriptName: 'Inter-Regular' },
    {
      family: 'Montserrat',
      style: 'Regular',
      postscriptName: 'Montserrat-Regular',
    },
    { family: 'Test Font', style: 'Regular', postscriptName: 'Test-Regular' },
    { family: 'Test Font', style: 'Bold', postscriptName: 'Test-Bold' },
    { family: 'Test Font', style: 'Italic', postscriptName: 'Test-Italic' },
    { family: 'Plain', style: 'Light', postscriptName: 'Plain-Light' },
  ]);
  expect(catalog.map((font) => font.id)).toEqual(['Plain', 'Test Font']);
  setSystemFonts(catalog);
  expect(resolvedFontFamily('Test Font')).toBe('Test Font');
  expect(supportsBold('Test Font')).toBe(true);
  expect(supportsItalic('Test Font')).toBe(true);
  expect(supportsItalic('Test Font', 700)).toBe(false);
  expect(supportsBold('Plain')).toBe(false);
  const caption = createCaption();
  caption.style = {
    ...caption.style,
    fontFamily: 'Test Font',
    fontWeight: 700,
    fontStyle: 'italic',
  };
  expect(effectiveFontStyle(caption)).toBe('normal');
  expect(availableFonts().filter((font) => font.id === 'Inter')).toHaveLength(
    1,
  );
});
it('ignores empty and hidden families and keeps an italic-only family usable', () => {
  const catalog = systemFontCatalog([
    { family: '', style: 'Regular', postscriptName: 'empty' },
    { family: '.Hidden', style: 'Regular', postscriptName: 'hidden' },
    { family: 'Only Italic', style: 'Italic', postscriptName: 'OnlyItalic' },
  ]);
  expect(catalog).toHaveLength(1);
  expect(catalog[0]!.faces).toContainEqual({
    weight: 400,
    style: 'normal',
    postscriptName: 'OnlyItalic',
  });
});
