import { useMemo } from 'react';
import { Image as CanvasImage } from 'react-konva';
import type { Caption, ImageDimensions } from '@/domain/document';
import type { ContentRect } from '@/domain/layer-background';
import { renderBackgroundTile } from './background-render';

export function BackgroundPreview({
  content,
  caption,
  dimensions,
}: {
  content: ContentRect;
  caption: Caption;
  dimensions: ImageDimensions;
}) {
  const { x, y, width, height } = content;
  const imageWidth = dimensions.width,
    imageHeight = dimensions.height;
  // Hover/selection produces fresh geometry objects, but doesn't change pixels.
  const tile = useMemo(
    () =>
      renderBackgroundTile({ x, y, width, height }, caption, {
        width: imageWidth,
        height: imageHeight,
      }),
    [x, y, width, height, caption, imageWidth, imageHeight],
  );
  return tile && <CanvasImage {...tile} listening={false} />;
}
