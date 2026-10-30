import { expect, it } from 'vitest';
import { createCaption } from '../../../core/src/document';
import {
  canvasFontStyle,
  effectiveFontStyle,
  supportsItalic,
} from '../../../core/src/font-style';
import { createCaptionLayout } from '../../../core/src/caption-layout';
import { createPreset, parsePreset } from '../../../core/src/presets';

it('combines real italic with bold and falls back for unavailable variants', () => {
  const caption = createCaption();
  expect(canvasFontStyle(caption)).toBe('normal');
  caption.style.fontStyle = 'italic';
  expect(canvasFontStyle(caption)).toBe('italic');
  caption.style.fontWeight = 700;
  expect(canvasFontStyle(caption)).toBe('bold italic');
  caption.style.fontFamily = 'Advercase';
  expect(supportsItalic(caption.style.fontFamily)).toBe(false);
  expect(effectiveFontStyle(caption)).toBe('normal');
  expect(canvasFontStyle(caption)).toBe('bold');
});
it('round trips italic and accepts presets without fontStyle', () => {
  const layout = createCaptionLayout();
  const preset = createPreset('id', 'Name', layout, []);
  const validate = () => {
    throw Error('Unexpected asset');
  };
  expect(parsePreset(JSON.stringify(preset), validate)).toEqual(preset);
  preset.layout.containers[0]!.style.fontStyle = 'italic';
  expect(
    parsePreset(JSON.stringify(preset), validate).layout.containers[0]!.style
      .fontStyle,
  ).toBe('italic');
});
