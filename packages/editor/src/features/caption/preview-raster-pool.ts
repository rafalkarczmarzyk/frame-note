import Konva from 'konva';

/** Intermediate canvases never escape a preview frame. Export owns its own canvases. */
export class PreviewRasterPool {
  private canvases: HTMLCanvasElement[] = [];
  private cursor = 0;
  private decorations = new Map<
    string,
    {
      image: HTMLCanvasElement;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  >();
  private filter = new Konva.Image();
  begin() {
    this.cursor = 0;
  }
  canvas(width: number, height: number) {
    const index = this.cursor++;
    const canvas = (this.canvases[index] ??= document.createElement('canvas'));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    canvas.getContext('2d', { willReadFrequently: true })!.reset();
    return canvas;
  }
  decoration(
    key: string,
    create: () => {
      image: HTMLCanvasElement;
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    let tile = this.decorations.get(key);
    if (!tile) {
      tile = create();
      this.decorations.set(key, tile);
    } else {
      this.decorations.delete(key);
      this.decorations.set(key, tile);
    }
    let bytes = tile.width * tile.height * 4;
    for (const [id, cached] of [...this.decorations].reverse()) {
      if (id === key) continue;
      bytes += cached.width * cached.height * 4;
      if (bytes > 32 * 1024 * 1024) {
        cached.image.width = cached.image.height = 0;
        this.decorations.delete(id);
      }
    }
    return tile;
  }
  blur(source: HTMLCanvasElement, radius: number) {
    const ratio = Math.min(1, 120 / Math.max(radius, 1));
    const output = this.canvas(
      Math.max(1, Math.round(source.width * ratio)),
      Math.max(1, Math.round(source.height * ratio)),
    );
    const context = output.getContext('2d')!;
    context.drawImage(source, 0, 0, output.width, output.height);
    const pixels = context.getImageData(0, 0, output.width, output.height);
    this.filter.blurRadius(radius * ratio);
    const blur = Konva.Filters.Blur;
    if (typeof blur !== 'function') throw Error('Blur filter is unavailable.');
    blur.call(this.filter, pixels);
    context.putImageData(pixels, 0, 0);
    return output;
  }
  /** Do not retain arbitrarily large frame intermediates between requests. */
  end() {
    let retained = 0;
    this.canvases.forEach((canvas, index) => {
      const bytes = canvas.width * canvas.height * 4;
      if (index >= this.cursor || retained + bytes > 64 * 1024 * 1024)
        canvas.width = canvas.height = 0;
      else retained += bytes;
    });
    this.canvases.length = this.cursor;
    for (const [key, tile] of this.decorations)
      if (tile.width * tile.height * 4 > 32 * 1024 * 1024) {
        tile.image.width = tile.image.height = 0;
        this.decorations.delete(key);
      }
  }
  dispose() {
    this.canvases.forEach((c) => {
      c.width = c.height = 0;
    });
    this.canvases = [];
    this.filter.destroy();
    this.decorations.forEach((tile) => {
      tile.image.width = tile.image.height = 0;
    });
    this.decorations.clear();
  }
}
