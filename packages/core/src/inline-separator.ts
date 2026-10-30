import {
  captionColors,
  legacyCaptionColors,
  normalizeHex,
} from './caption-colors';

export interface SeparatorReference {
  widthMode: 'fixed' | 'flex';
  width: number;
  height: number;
  unit: 'font' | 'document';
  thickness: number;
  color: string;
  opacity: number;
}

/** Portable, per-occurrence settings, shared by editor, clipboard and presets. */
export function separatorToken(ref: SeparatorReference): string {
  return `separator:${ref.widthMode}:${ref.width}:${ref.height}:${ref.unit}:${ref.thickness}:${ref.color}:${ref.opacity}`;
}
export function parseSeparatorToken(token: string): SeparatorReference | null {
  const parts = token.split(':');
  if (parts.length !== 8 || parts[0] !== 'separator') return null;
  const [
    ,
    widthMode,
    rawWidth,
    rawHeight,
    unit,
    rawThickness,
    color,
    rawOpacity,
  ] = parts;
  const [width, height, thickness, opacity] = [
    rawWidth,
    rawHeight,
    rawThickness,
    rawOpacity,
  ].map(Number);
  if (
    (widthMode !== 'fixed' && widthMode !== 'flex') ||
    (unit !== 'font' && unit !== 'document') ||
    ![width, height, thickness].every(
      (value) => Number.isFinite(value) && value! > 0 && value! <= 1e7,
    ) ||
    !Number.isFinite(opacity) ||
    opacity! < 0 ||
    opacity! > 1 ||
    !color ||
    !(
      normalizeHex(color) ||
      captionColors.some((item) => item.value === color) ||
      legacyCaptionColors.some((item) => item === color)
    )
  )
    return null;
  return {
    widthMode,
    width: width!,
    height: height!,
    unit,
    thickness: thickness!,
    color,
    opacity: opacity!,
  };
}
