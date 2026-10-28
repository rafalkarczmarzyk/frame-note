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
  const tile = useMemo(
    () => renderBackgroundTile(content, caption, dimensions),
    [content, caption, dimensions],
  );
  return tile && <CanvasImage {...tile} listening={false} />;
}
