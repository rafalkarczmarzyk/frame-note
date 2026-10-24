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
  marginX: number,
  marginY: number,
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
        ? marginX
        : column === 'right'
          ? image.width - marginX - block.width
          : (image.width - block.width) / 2,
    y:
      row === 'top'
        ? marginY
        : row === 'bottom'
          ? image.height - marginY - block.height
          : (image.height - block.height) / 2,
  };
}
