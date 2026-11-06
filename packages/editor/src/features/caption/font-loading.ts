import {
  resolvedFontFamily,
  markFontUnavailable,
} from '../../../../core/src/fonts';
import {
  type FontSelection,
  effectiveFontStyle,
  effectiveFontWeight,
} from '../../../../core/src/font-style';

export async function ensureCaptionFont(
  style: FontSelection,
  text = 'Leave your mark.',
) {
  const family = resolvedFontFamily(style.fontFamily);
  try {
    const loaded = await document.fonts.load(
      `${effectiveFontStyle({ style })} ${effectiveFontWeight({ style })} 16px ${JSON.stringify(family)}`,
      `${text} A`,
    );
    if (family === '7-Segment') {
      await document.fonts.load(
        `${effectiveFontStyle({ style })} ${effectiveFontWeight({ style })} 16px "Montserrat Variable"`,
        text,
      );
    }
    if (!loaded.length) throw new Error(`Could not load ${family}.`);
  } catch (error) {
    if (family === 'Montserrat Variable') throw error;
    markFontUnavailable(style.fontFamily);
    await ensureCaptionFont(style, text);
  }
}
