import { expect, it } from 'vitest';
import { captionFonts } from '../../../core/src/fonts';
import { createCaptionLayout } from '../../../core/src/caption-layout';
import { createPreset, parsePreset } from '../../../core/src/presets';
import {
  effectiveFontWeight,
  supportsItalic,
} from '../../../core/src/font-style';
it('round trips every stable family identifier including legacy families', () => {
  for (const font of captionFonts) {
    const layout = createCaptionLayout();
    layout.containers[0]!.style.fontFamily = font.id;
    const preset = createPreset('font', font.label, layout, []);
    expect(
      parsePreset(JSON.stringify(preset), () => {
        throw Error('Unexpected asset');
      }),
    ).toEqual(preset);
  }
  expect(captionFonts).toHaveLength(26);
});
it('uses only supplied weights and styles', () => {
  const style = createCaptionLayout().containers[0]!.style;
  expect(
    effectiveFontWeight({
      style: { ...style, fontFamily: 'Prata', fontWeight: 700 },
    }),
  ).toBe(400);
  expect(supportsItalic('Inter')).toBe(true);
  expect(supportsItalic('Manrope')).toBe(false);
});
