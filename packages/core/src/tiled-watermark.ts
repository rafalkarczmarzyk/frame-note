import type { ImageDimensions } from './document';

export interface TiledPosition {
  enabled: boolean;
  pattern: 'grid' | 'staggered';
  angle: number;
  spacing: number;
  offset: { x: number; y: number };
}
export const defaultTiledPosition = (): TiledPosition => ({
  enabled: true,
  pattern: 'staggered',
  angle: 30,
  spacing: 12,
  offset: { x: 0, y: 0 },
});
export const tiledCopyLimit = 2000;

/** Centers in photo axes. Inverse-rotate the photo bounds to enumerate the lattice. */
export function tiledCopies(
  dimensions: ImageDimensions,
  motif: ImageDimensions,
  tiled: TiledPosition,
) {
  if (motif.width <= 0 || motif.height <= 0) return [];
  const short = Math.min(dimensions.width, dimensions.height) / 100;
  const stepX = motif.width + tiled.spacing * short;
  const stepY = motif.height + tiled.spacing * short;
  if (![stepX, stepY].every((v) => Number.isFinite(v) && v > 0)) return [];
  const angle = (tiled.angle * Math.PI) / 180;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  const origin = {
    x: dimensions.width / 2 + tiled.offset.x * short,
    y: dimensions.height / 2 + tiled.offset.y * short,
  };
  const corners = [
    [0, 0],
    [dimensions.width, 0],
    [0, dimensions.height],
    [dimensions.width, dimensions.height],
  ].map(([x, y]) => ({
    x: (x! - origin.x) * cos + (y! - origin.y) * sin,
    y: -(x! - origin.x) * sin + (y! - origin.y) * cos,
  }));
  const minX = Math.min(...corners.map((p) => p.x)) - motif.width / 2;
  const maxX = Math.max(...corners.map((p) => p.x)) + motif.width / 2;
  const minRow = Math.ceil(
    (Math.min(...corners.map((p) => p.y)) - motif.height / 2) / stepY,
  );
  const maxRow = Math.floor(
    (Math.max(...corners.map((p) => p.y)) + motif.height / 2) / stepY,
  );
  const copies: { x: number; y: number; row: number; column: number }[] = [];
  if (maxRow - minRow > tiledCopyLimit)
    throw Error(
      'Pattern is too dense. Increase spacing or layer size (maximum 2000 copies).',
    );
  for (let row = minRow; row <= maxRow; row++) {
    const shift =
      tiled.pattern === 'staggered' && Math.abs(row % 2) === 1 ? stepX / 2 : 0;
    const minColumn = Math.ceil((minX - shift) / stepX);
    const maxColumn = Math.floor((maxX - shift) / stepX);
    for (let column = minColumn; column <= maxColumn; column++) {
      const x = column * stepX + shift,
        y = row * stepY;
      const px = origin.x + x * cos - y * sin,
        py = origin.y + x * sin + y * cos;
      const dx = px - dimensions.width / 2,
        dy = py - dimensions.height / 2;
      // Separating axes of the photo and the rotated motif: omit off-photo copies.
      if (
        Math.abs(dx) >
          dimensions.width / 2 +
            (Math.abs(cos) * motif.width) / 2 +
            (Math.abs(sin) * motif.height) / 2 +
            1e-7 ||
        Math.abs(dy) >
          dimensions.height / 2 +
            (Math.abs(sin) * motif.width) / 2 +
            (Math.abs(cos) * motif.height) / 2 +
            1e-7 ||
        Math.abs(dx * cos + dy * sin) >
          (Math.abs(cos) * dimensions.width) / 2 +
            (Math.abs(sin) * dimensions.height) / 2 +
            motif.width / 2 +
            1e-7 ||
        Math.abs(-dx * sin + dy * cos) >
          (Math.abs(sin) * dimensions.width) / 2 +
            (Math.abs(cos) * dimensions.height) / 2 +
            motif.height / 2 +
            1e-7
      )
        continue;
      copies.push({ x: px, y: py, row, column });
      if (copies.length > tiledCopyLimit)
        throw Error(
          'Pattern is too dense. Increase spacing or layer size (maximum 2000 copies).',
        );
    }
  }
  return copies;
}

/** Drag displacement is already in photo axes, independent of the lattice angle. */
export function offsetTiled(
  tiled: TiledPosition,
  delta: { x: number; y: number },
  dimensions: ImageDimensions,
): TiledPosition {
  const unit = Math.min(dimensions.width, dimensions.height) / 100;
  const clamp = (v: number) => Math.max(-100, Math.min(100, v));
  return {
    ...tiled,
    offset: {
      x: clamp(tiled.offset.x + delta.x / unit),
      y: clamp(tiled.offset.y + delta.y / unit),
    },
  };
}
