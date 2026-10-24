import type { Margins } from '../../domain/sizing';
import type { Anchor, ImageDimensions } from '../../domain/document';

export const anchors: readonly Anchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/** Position the measured text block; alignment inside it is independent of anchor. */
export function anchoredPosition(
  image: ImageDimensions,
  block: ImageDimensions,
  anchor: Anchor,
  margins: Margins,
) {
  const column = anchor.endsWith('left')
    ? 'left'
    : anchor.endsWith('right')
      ? 'right'
      : 'center';
  const row = anchor.startsWith('top')
    ? 'top'
    : anchor.startsWith('bottom')
      ? 'bottom'
      : 'center';
  return {
    x:
      column === 'left'
        ? margins.left
        : column === 'right'
          ? image.width - margins.right - block.width
          : margins.left +
            (image.width - margins.left - margins.right - block.width) / 2,
    y:
      row === 'top'
        ? margins.top
        : row === 'bottom'
          ? image.height - margins.bottom - block.height
          : margins.top +
            (image.height - margins.top - margins.bottom - block.height) / 2,
  };
}

/** Fraction of the text block used as its stable positioning reference. */
export function anchorFraction(anchor: Anchor) {
  return {
    x: anchor.endsWith('left') ? 0 : anchor.endsWith('right') ? 1 : 0.5,
    y: anchor.startsWith('top') ? 0 : anchor.startsWith('bottom') ? 1 : 0.5,
  };
}

export function customPosition(
  image: ImageDimensions,
  block: ImageDimensions,
  anchor: Anchor,
  point: { x: number; y: number },
) {
  const fraction = anchorFraction(anchor);
  return {
    x: (point.x / 100) * image.width - fraction.x * block.width,
    y: (point.y / 100) * image.height - fraction.y * block.height,
  };
}

export function customPoint(
  image: ImageDimensions,
  block: ImageDimensions,
  anchor: Anchor,
  origin: { x: number; y: number },
) {
  const fraction = anchorFraction(anchor);
  return {
    x: ((origin.x + fraction.x * block.width) / image.width) * 100,
    y: ((origin.y + fraction.y * block.height) / image.height) * 100,
  };
}
