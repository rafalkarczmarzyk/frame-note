import type { Caption, ImageDimensions } from '../../../../core/src/document';
import { toPixels } from '../../../../core/src/sizing';
import { anchoredPosition, customPosition } from './layout';

export function logoLayout(dimensions: ImageDimensions, caption: Caption) {
  if (!caption.logo) throw Error('Logo artwork is required.');
  const width = toPixels(caption.logo.width, caption.sizingUnit, dimensions);
  const block = { width, height: width / caption.logo.asset.aspect };
  const margins = {
    top: toPixels(caption.position.margins.top, caption.sizingUnit, dimensions),
    right: toPixels(
      caption.position.margins.right,
      caption.sizingUnit,
      dimensions,
    ),
    bottom: toPixels(
      caption.position.margins.bottom,
      caption.sizingUnit,
      dimensions,
    ),
    left: toPixels(
      caption.position.margins.left,
      caption.sizingUnit,
      dimensions,
    ),
  };
  const position = caption.position.custom
    ? customPosition(
        dimensions,
        block,
        caption.position.anchor,
        caption.position.custom,
      )
    : anchoredPosition(dimensions, block, caption.position.anchor, margins);
  return { ...block, ...position };
}
