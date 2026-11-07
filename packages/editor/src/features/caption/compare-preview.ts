import { LivePreviewRenderer } from './live-preview-renderer';
import { renderPhotoComposition, type RenderedCaption } from './render';
import type { ImageDimensions } from '../../../../core/src/document';

/** Diagnostic only: compare the experimental compositor with the export scene. */
export async function comparePreview(
  source: CanvasImageSource,
  dimensions: ImageDimensions,
  items: readonly RenderedCaption[],
) {
  const renderer = new LivePreviewRenderer(source, dimensions);
  let reference: HTMLCanvasElement | undefined;
  let actual: HTMLCanvasElement | undefined;
  const diff = document.createElement('canvas');
  try {
    reference = await renderPhotoComposition(source, dimensions, items);
    // Exercise the same retained caches across a placement change, including
    // a stationary Glass layer whose lower composition has changed.
    const shifted = structuredClone(items);
    const moving = shifted.find((item) => item.caption.visible !== false);
    if (moving) {
      const position = moving.caption.position;
      if (position.tiled?.enabled) position.tiled.offset.x += 3;
      else
        position.custom = {
          x: (position.custom?.x ?? 50) + 3,
          y: position.custom?.y ?? 50,
        };
      const warm = await renderer.render(shifted);
      renderer.release(warm);
    }
    actual = await renderer.render(items);
    diff.width = dimensions.width;
    diff.height = dimensions.height;
    const left = reference
      .getContext('2d')!
      .getImageData(0, 0, diff.width, diff.height).data;
    const right = actual
      .getContext('2d')!
      .getImageData(0, 0, diff.width, diff.height).data;
    const output = diff
      .getContext('2d')!
      .createImageData(diff.width, diff.height);
    let differing = 0,
      maximum = 0,
      sum = 0;
    for (let i = 0; i < left.length; i += 4) {
      let pixel = 0;
      for (let channel = 0; channel < 4; channel++) {
        const delta = Math.abs(left[i + channel]! - right[i + channel]!);
        sum += delta;
        pixel = Math.max(pixel, delta);
      }
      maximum = Math.max(maximum, pixel);
      if (pixel > 2) differing++;
      output.data[i] = pixel > 2 ? 255 : 0;
      output.data[i + 3] = 255;
    }
    diff.getContext('2d')!.putImageData(output, 0, 0);
    return {
      metrics: {
        pixels: diff.width * diff.height,
        differingOver2: differing,
        maximum,
        meanChannelError: sum / left.length,
      },
      reference: reference.toDataURL(),
      actual: actual.toDataURL(),
      diff: diff.toDataURL(),
    };
  } finally {
    renderer.dispose();
    if (reference) reference.width = reference.height = 0;
    if (actual) actual.width = actual.height = 0;
    diff.width = diff.height = 0;
  }
}
