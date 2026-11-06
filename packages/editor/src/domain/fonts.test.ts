import { expect, it } from 'vitest';
import {
  captionFonts,
  captionRenderText,
  resolvedFontFamily,
  fontLabel,
  isFontAvailable,
} from '../../../core/src/fonts';
import { createCaptionLayout } from '../../../core/src/caption-layout';
import { createPreset, parsePreset } from '../../../core/src/presets';
import {
  effectiveFontWeight,
  effectiveFontStyle,
  supportsItalic,
} from '../../../core/src/font-style';
it('round trips every stable family identifier in the bundled catalog', () => {
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
});
it('uses only supplied weights and styles', () => {
  const style = createCaptionLayout().containers[0]!.style;
  expect(
    effectiveFontWeight({
      style: { ...style, fontFamily: 'Prata', fontWeight: 700 },
    }),
  ).toBe(400);
  expect(supportsItalic('Inter')).toBe(true);
  expect(supportsItalic('7-Segment')).toBe(false);
  expect(supportsItalic('DSEG7 Classic')).toBe(false);
  expect(
    effectiveFontWeight({
      style: { ...style, fontFamily: '7-Segment', fontWeight: 700 },
    }),
  ).toBe(400);
  expect(supportsItalic('Manrope')).toBe(false);
});

it('preserves an unknown font in v1 without replacing its saved name', () => {
  const layout = createCaptionLayout();
  layout.containers[0]!.style.fontFamily = 'Missing Studio Font';
  const preset = createPreset('unknown', 'Unknown', layout, []);
  const parsed = parsePreset(JSON.stringify(preset), () => {
    throw Error('Unexpected asset');
  });
  expect(parsed).toEqual(preset);
  expect(parsed.version).toBe(1);
});

it('resolves retired DSEG preset names to 7-Segment without changing saved data', () => {
  const layout = createCaptionLayout();
  layout.containers[0]!.style.fontFamily = 'DSEG7 Classic';
  layout.containers[0]!.style.fontWeight = 700;
  layout.containers[0]!.style.fontStyle = 'italic';
  const preset = createPreset('legacy-segment', 'Legacy', layout, []);
  const restored = parsePreset(JSON.stringify(preset), () => {
    throw Error('No asset');
  });
  const style = restored.layout.containers[0]!.style;
  expect(restored).toEqual(preset);
  expect(resolvedFontFamily(style.fontFamily)).toBe('7-Segment');
  expect(fontLabel(style.fontFamily)).toBe('7-Segment');
  expect(isFontAvailable(style.fontFamily)).toBe(true);
  expect(effectiveFontWeight({ style })).toBe(400);
  expect(effectiveFontStyle({ style })).toBe('normal');
  expect(captionFonts.some((font) => font.id === 'DSEG7 Classic')).toBe(false);
});

it('uses the native year segment in 7-Segment and a readable apostrophe in other fonts', () => {
  const text = '\uF06226 07 06';
  expect(captionRenderText('7-Segment', text)).toBe(text);
  expect(captionRenderText('7-Segment', "'26 07 06")).toBe(text);
  expect(captionRenderText('7-Segment', "06 07 '26")).toBe('06 07 \uF06226');
  expect(captionRenderText('7-Segment', "'2026")).toBe("'2026");
  expect(captionRenderText('Montserrat Variable', "'26 07 06")).toBe(
    "'26 07 06",
  );
  expect(captionRenderText('DSEG7 Classic', text)).toBe(text);
  expect(captionRenderText('Montserrat Variable', text)).toBe("'26 07 06");
});
