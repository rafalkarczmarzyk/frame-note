import { useMemo } from 'react';
import { Image as CanvasImage, Rect } from 'react-konva';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import type { ContentRect } from '../../../../core/src/layer-background';
import {
  captionBackgroundRect,
  pixelBackground,
  renderBackgroundTile,
} from './background-render';
import { resolvedColor } from './resolve-color';

export function BackgroundPreview({
  content,
  caption,
  dimensions,
  simplified = false,
}: {
  content: ContentRect;
  caption: Caption;
  dimensions: ImageDimensions;
  simplified?: boolean;
}) {
  const { x, y, width, height } = content;
  const imageWidth = dimensions.width,
    imageHeight = dimensions.height;
  // Hover/selection produces fresh geometry objects, but doesn't change pixels.
  const tile = useMemo(
    () =>
      simplified
        ? null
        : renderBackgroundTile({ x, y, width, height }, caption, {
            width: imageWidth,
            height: imageHeight,
          }),
    [x, y, width, height, caption, imageWidth, imageHeight, simplified],
  );
  if (simplified) {
    const background = pixelBackground(caption, dimensions);
    if (!background || background.type === 'none') return null;
    return (
      <Rect
        {...captionBackgroundRect(content, caption, dimensions)}
        cornerRadius={background.radius}
        fill={resolvedColor(background.color)}
        opacity={background.opacity}
        listening={false}
      />
    );
  }
  return tile && <CanvasImage {...tile} listening={false} />;
}
