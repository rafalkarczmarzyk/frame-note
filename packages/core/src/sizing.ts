import { parseSeparatorToken, separatorToken } from './inline-separator';
import { mapBackgroundLengths } from './layer-background';
import { iconToken, parseIconToken } from './inline-icon';
import { imageToken, parseImageToken } from './inline-image';
import type { Caption, ImageDimensions } from './document';

export type MarginLinkMode = 'none' | 'pairs' | 'all';
export const oppositeMargin: Record<keyof Margins, keyof Margins> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
export type SizingUnit = 'px' | 'short-edge' | 'long-edge';
export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export const marginSides = ['top', 'right', 'bottom', 'left'] as const;
export const sizingLabels: Record<SizingUnit, string> = {
  px: 'px',
  'short-edge': '% S',
  'long-edge': '% L',
};
export function pixelsPerUnit(
  unit: SizingUnit,
  dimensions: ImageDimensions,
): number {
  if (unit === 'px') return 1;
  return (
    (unit === 'short-edge'
      ? Math.min(dimensions.width, dimensions.height)
      : Math.max(dimensions.width, dimensions.height)) / 100
  );
}
export function toPixels(
  value: number,
  unit: SizingUnit,
  dimensions: ImageDimensions,
): number {
  if (unit === 'px') return value;
  const edge =
    unit === 'short-edge'
      ? Math.min(dimensions.width, dimensions.height)
      : Math.max(dimensions.width, dimensions.height);
  return (value * edge) / 100;
}
export function convertSizing(
  caption: Caption,
  unit: SizingUnit,
  dimensions: ImageDimensions,
): Caption {
  if (unit === caption.sizingUnit) return caption;
  const convert = (value: number) =>
    toPixels(value, caption.sizingUnit, dimensions) /
    pixelsPerUnit(unit, dimensions);
  const margins = caption.position.margins;
  return {
    ...caption,
    sizingUnit: unit,
    ...(caption.background
      ? { background: mapBackgroundLengths(caption.background, convert) }
      : {}),
    template: caption.template.replace(
      /\{((?:image|icon|separator):[^{}]*)\}/gu,
      (original, token: string) => {
        const separator = parseSeparatorToken(token);
        if (separator)
          return `{${separatorToken({
            ...separator,
            width: convert(separator.width),
            thickness: convert(separator.thickness),
            height:
              separator.unit === 'document'
                ? convert(separator.height)
                : separator.height,
          })}}`;
        const icon = parseIconToken(token);
        if (icon?.unit === 'document')
          return `{${iconToken({ ...icon, height: convert(icon.height) })}}`;
        const image = parseImageToken(token);
        return image?.unit === 'document'
          ? `{${imageToken({ ...image, height: convert(image.height) })}}`
          : original;
      },
    ),
    ...(caption.logo
      ? { logo: { ...caption.logo, width: convert(caption.logo.width) } }
      : {}),
    style: { ...caption.style, fontSize: convert(caption.style.fontSize) },
    position: {
      ...caption.position,
      margins: {
        top: convert(margins.top),
        right: convert(margins.right),
        bottom: convert(margins.bottom),
        left: convert(margins.left),
      },
    },
  };
}
/** Keep at least one source-image pixel inside the inset area. */
export function marginLimits(
  margins: Margins,
  unit: SizingUnit,
  dimensions: ImageDimensions,
  mode: MarginLinkMode,
): Margins {
  const factor = pixelsPerUnit(unit, dimensions);
  if (mode === 'all') {
    const max = Math.max(
      0,
      (Math.min(dimensions.width, dimensions.height) - 1) / (2 * factor),
    );
    return { top: max, right: max, bottom: max, left: max };
  }
  if (mode === 'pairs') {
    const vertical = Math.max(0, (dimensions.height - 1) / (2 * factor));
    const horizontal = Math.max(0, (dimensions.width - 1) / (2 * factor));
    return {
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
    };
  }
  return {
    top: Math.max(0, (dimensions.height - 1) / factor - margins.bottom),
    bottom: Math.max(0, (dimensions.height - 1) / factor - margins.top),
    left: Math.max(0, (dimensions.width - 1) / factor - margins.right),
    right: Math.max(0, (dimensions.width - 1) / factor - margins.left),
  };
}
export function changeMargin(
  margins: Margins,
  side: keyof Margins,
  value: number,
  mode: MarginLinkMode,
): Margins {
  if (mode === 'all')
    return { top: value, right: value, bottom: value, left: value };
  if (mode === 'pairs')
    return { ...margins, [side]: value, [oppositeMargin[side]]: value };
  return { ...margins, [side]: value };
}

export function setMarginLinkMode(
  margins: Margins,
  mode: MarginLinkMode,
  unit: SizingUnit,
  dimensions: ImageDimensions,
): Margins {
  const limits = marginLimits(margins, unit, dimensions, mode);
  if (mode === 'none') return { ...margins };
  const top = Math.min(margins.top, limits.top);
  if (mode === 'all') return { top, right: top, bottom: top, left: top };
  const left = Math.min(margins.left, limits.left);
  return { top, bottom: top, left, right: left };
}

/** Move a ruler handle in screen pixels, preserving the grab offset. */
export function moveMargin(
  margins: Margins,
  side: keyof Margins,
  delta: number,
  scale: number,
  unit: SizingUnit,
  dimensions: ImageDimensions,
  mode: MarginLinkMode,
): Margins {
  const direction = side === 'right' || side === 'bottom' ? -1 : 1;
  const step = unit === 'px' ? 1 : 0.1;
  const next =
    margins[side] +
    (direction * delta) / (scale * pixelsPerUnit(unit, dimensions));
  const rounded = Math.round(next / step) * step;
  const limit = marginLimits(margins, unit, dimensions, mode)[side];
  return changeMargin(
    margins,
    side,
    Math.min(limit, Math.max(0, rounded)),
    mode,
  );
}
