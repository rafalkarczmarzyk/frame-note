import Konva from 'konva';

/** Konva caps its pixel blur radius. Downsample large radii before filtering so
 * high-resolution export preserves the same visual amount as the preview. */
export function blurBackdrop(
  source: HTMLCanvasElement,
  radius: number,
): HTMLCanvasElement {
  const ratio = Math.min(1, 120 / Math.max(radius, 1));
  const work = document.createElement('canvas');
  work.width = Math.max(1, Math.round(source.width * ratio));
  work.height = Math.max(1, Math.round(source.height * ratio));
  const context = work.getContext('2d');
  if (!context) throw Error('Canvas is unavailable.');
  context.drawImage(source, 0, 0, work.width, work.height);
  const node = new Konva.Image({
    image: work,
    width: work.width,
    height: work.height,
    listening: false,
  });
  try {
    node.cache({ pixelRatio: 1 });
    node.filters([Konva.Filters.Blur]);
    node.blurRadius(radius * ratio);
    return node.toCanvas({
      x: 0,
      y: 0,
      width: work.width,
      height: work.height,
      pixelRatio: 1,
    });
  } finally {
    node.destroy();
    work.width = work.height = 0;
  }
}
