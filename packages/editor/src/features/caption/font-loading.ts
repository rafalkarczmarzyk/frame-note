import {
  type FontSelection,
  effectiveFontStyle,
  effectiveFontWeight,
} from '../../../../core/src/font-style';

export async function ensureCaptionFont(
  style: FontSelection,
  text = 'Leave your mark.',
) {
  const loaded = await document.fonts.load(
    `${effectiveFontStyle({ style })} ${effectiveFontWeight({ style })} 16px "${style.fontFamily}"`,
    `${text} A`,
  );
  if (!loaded.length) throw new Error(`Could not load ${style.fontFamily}.`);
}
