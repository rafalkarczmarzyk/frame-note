import type { PreviewRasterPool } from './preview-raster-pool';
import { convertSizing } from '../../../../core/src/sizing';
import type Konva from 'konva';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import { pixelBackground, renderBackgroundTile } from './background-render';

/** Render decorations in motif coordinates, sampling the composition through the inverse rotation. */
export function tiledBackground(
  layer: Konva.Layer,
  dimensions: ImageDimensions,
  caption: Caption,
  motif: ImageDimensions,
  center: { x: number; y: number },
  snapshot?: HTMLCanvasElement,
  pool?: PreviewRasterPool,
) {
  const background = pixelBackground(caption, dimensions);
  if (!background || background.type === 'none') return null;
  const scale = Math.min(dimensions.width, dimensions.height) / 800;
  const shadow =
    background.type === 'glass'
      ? 80 * scale
      : background.shadow.enabled
        ? background.shadow.blur * 3 +
          Math.abs(background.shadow.spread) +
          Math.max(Math.abs(background.shadow.x), Math.abs(background.shadow.y))
        : 0;
  const pad = Math.ceil(
    Math.max(...Object.values(background.padding)) + shadow + 4,
  );
  const local = {
    width: Math.ceil(motif.width + pad * 2),
    height: Math.ceil(motif.height + pad * 2),
  };
  const angle = (caption.position.tiled!.angle * Math.PI) / 180;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  const origin = { x: pad + motif.width / 2, y: pad + motif.height / 2 };
  const tile = renderBackgroundTile(
    { x: pad, y: pad, width: motif.width, height: motif.height },
    convertSizing(caption, 'px', dimensions),
    local,
    (sample) => {
      const corners = [
        [sample.x, sample.y],
        [sample.x + sample.width, sample.y],
        [sample.x, sample.y + sample.height],
        [sample.x + sample.width, sample.y + sample.height],
      ].map(([x, y]) => ({
        x: center.x + (x! - origin.x) * cos - (y! - origin.y) * sin,
        y: center.y + (x! - origin.x) * sin + (y! - origin.y) * cos,
      }));
      const x = Math.floor(Math.min(...corners.map((p) => p.x))),
        y = Math.floor(Math.min(...corners.map((p) => p.y)));
      const width = Math.ceil(Math.max(...corners.map((p) => p.x))) - x,
        height = Math.ceil(Math.max(...corners.map((p) => p.y))) - y;
      const crop = snapshot
        ? (pool?.canvas(width, height) ?? document.createElement('canvas'))
        : layer.toCanvas({ x, y, width, height, pixelRatio: 1 });
      if (snapshot) {
        if (!pool) {
          crop.width = width;
          crop.height = height;
        }
        crop.getContext('2d')!.drawImage(snapshot, -x, -y);
      }
      const image =
        pool?.canvas(Math.ceil(sample.width), Math.ceil(sample.height)) ??
        document.createElement('canvas');
      if (!pool) {
        image.width = Math.ceil(sample.width);
        image.height = Math.ceil(sample.height);
      }
      const context = image.getContext('2d');
      if (!context) throw Error('Canvas is unavailable.');
      context.translate(-sample.x, -sample.y);
      context.translate(origin.x, origin.y);
      context.rotate(-angle);
      context.translate(-center.x, -center.y);
      context.drawImage(crop, x, y);
      if (!pool) crop.width = crop.height = 0;
      return image;
    },
    dimensions,
    pool,
  );
  return tile && { ...tile, x: tile.x - origin.x, y: tile.y - origin.y };
}
