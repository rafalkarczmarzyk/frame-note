import type { Caption } from './document';

export function supportsItalic(family: Caption['style']['fontFamily']) {
  return family === 'Montserrat Variable';
}
export function effectiveFontStyle(
  caption: Pick<Caption, 'style'>,
): 'normal' | 'italic' {
  return supportsItalic(caption.style.fontFamily) &&
    caption.style.fontStyle === 'italic'
    ? 'italic'
    : 'normal';
}
export function canvasFontStyle(caption: Pick<Caption, 'style'>) {
  return (
    [
      caption.style.fontWeight === 700 ? 'bold' : '',
      effectiveFontStyle(caption) === 'italic' ? 'italic' : '',
    ]
      .filter(Boolean)
      .join(' ') || 'normal'
  );
}
