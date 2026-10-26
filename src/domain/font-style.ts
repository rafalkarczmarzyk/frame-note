import { captionFont } from './fonts';
import type { Caption } from './document';

export type FontSelection = Pick<
  Caption['style'],
  'fontFamily' | 'fontWeight' | 'fontStyle'
>;
type FontCaption = { style: FontSelection };

export function supportsItalic(family: Caption['style']['fontFamily']) {
  return captionFont(family).italic;
}
export function effectiveFontStyle(caption: FontCaption): 'normal' | 'italic' {
  return supportsItalic(caption.style.fontFamily) &&
    caption.style.fontStyle === 'italic'
    ? 'italic'
    : 'normal';
}
export function canvasFontStyle(caption: FontCaption) {
  return (
    [
      effectiveFontWeight(caption) === 700 ? 'bold' : '',
      effectiveFontStyle(caption) === 'italic' ? 'italic' : '',
    ]
      .filter(Boolean)
      .join(' ') || 'normal'
  );
}

export function supportsBold(family: string) {
  return captionFont(family).bold;
}
export function effectiveFontWeight(caption: FontCaption): 400 | 700 {
  return supportsBold(caption.style.fontFamily)
    ? caption.style.fontWeight
    : 400;
}
