import type { Caption, ImageDimensions } from '../../domain/document';
import {
  backgroundRect,
  mapBackgroundLengths,
  type ContentRect,
} from '../../domain/layer-background';
import { toPixels } from '../../domain/sizing';
import { resolvedColor } from './resolve-color';

export function pixelBackground(caption: Caption, dimensions: ImageDimensions) {
  return (
    caption.background &&
    mapBackgroundLengths(caption.background, (value) =>
      toPixels(value, caption.sizingUnit, dimensions),
    )
  );
}
export function captionBackgroundRect(
  content: ContentRect,
  caption: Caption,
  dimensions: ImageDimensions,
) {
  return backgroundRect(content, pixelBackground(caption, dimensions));
}
function path(
  context: CanvasRenderingContext2D,
  rect: ContentRect,
  radius: number,
) {
  context.beginPath();
  context.roundRect(
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    Math.max(0, Math.min(radius, rect.width / 2, rect.height / 2)),
  );
}

/** Raster decoration only. Content remains a separate sharp, independently opaque node. */
export function renderBackgroundTile(
  content: ContentRect,
  caption: Caption,
  dimensions: ImageDimensions,
) {
  const background = pixelBackground(caption, dimensions);
  if (
    !background ||
    background.type === 'none' ||
    content.width <= 0 ||
    content.height <= 0
  )
    return null;
  const rect = backgroundRect(content, background);
  const shadow = background.shadow;
  const hasShadow = background.type === 'color' && shadow.enabled;
  const bleed = hasShadow
    ? Math.ceil(
        shadow.blur * 3 +
          Math.abs(shadow.spread) +
          Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) +
          2,
      )
    : 2;
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
  const image = document.createElement('canvas');
  image.width = right - x;
  image.height = bottom - y;
  const context = image.getContext('2d');
  if (!context) throw Error('Canvas is unavailable.');
  context.translate(-x, -y);
  if (hasShadow) {
    const spread = shadow.spread;
    const shape = {
      x: rect.x - spread,
      y: rect.y - spread,
      width: rect.width + spread * 2,
      height: rect.height + spread * 2,
    };
    if (shape.width > 0 && shape.height > 0) {
      // Offset the casting shape outside the canvas, leaving only its shadow.
      const offset =
        dimensions.width +
        Math.abs(shape.x) +
        shape.width +
        shadow.blur * 3 +
        1;
      context.save();
      context.globalAlpha = shadow.opacity;
      context.fillStyle = resolvedColor(shadow.color);
      context.shadowColor = resolvedColor(shadow.color);
      context.shadowBlur = shadow.blur;
      context.shadowOffsetX = shadow.x + offset;
      context.shadowOffsetY = shadow.y;
      path(
        context,
        { ...shape, x: shape.x - offset },
        background.radius + spread,
      );
      context.fill();
      context.restore();
      context.save();
      context.globalCompositeOperation = 'destination-out';
      path(context, rect, background.radius);
      context.fill();
      context.restore();
    }
  }
  context.save();
  context.globalAlpha = background.opacity;
  context.fillStyle = resolvedColor(background.color);
  path(context, rect, background.radius);
  context.fill();
  context.restore();
  return { image, x, y, width: image.width, height: image.height };
}
