import type { ImageDimensions } from '../../../../core/src/document';

export interface GlassRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Blur samples beyond the panel boundary, never beyond the source image. */
export function glassSampleRect(
  rect: GlassRect,
  blur: number,
  dimensions: ImageDimensions,
): GlassRect | null {
  const bleed = Math.ceil(Math.max(0, blur) * 3 + 2);
  const x = Math.max(0, Math.floor(rect.x - bleed));
  const y = Math.max(0, Math.floor(rect.y - bleed));
  const right = Math.min(
    dimensions.width,
    Math.ceil(rect.x + rect.width + bleed),
  );
  const bottom = Math.min(
    dimensions.height,
    Math.ceil(rect.y + rect.height + bleed),
  );
  if (right <= x || bottom <= y) return null;
  return { x, y, width: right - x, height: bottom - y };
}
