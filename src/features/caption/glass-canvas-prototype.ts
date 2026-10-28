import Konva from 'konva';
import type { ImageDimensions } from '@/domain/document';
import { glassSampleRect, type GlassRect } from './glass-geometry';

export interface GlassPanelPrototype extends GlassRect {
  radius: number;
  blur: number;
  color: string;
  opacity: number;
  /** Text coordinates describe content; padding only expands the panel. */
  text: { x: number; y: number; fontSize: number; lines: string[] };
}

export interface GlassMaterialColors {
  light: string;
  dark: string;
  text: string;
}

function roundedPath(
  context: CanvasRenderingContext2D,
  panel: GlassPanelPrototype,
) {
  context.beginPath();
  context.roundRect(
    panel.x,
    panel.y,
    panel.width,
    panel.height,
    Math.min(Math.max(0, panel.radius), panel.width / 2, panel.height / 2),
  );
}

/** Isolated stage-1 trial. Preview and JPG consume this same full-resolution canvas.
 * No CSS/native canvas filter: use Konva's pixel blur in both browser engines.
 */
export function renderGlassPrototype(
  image: CanvasImageSource,
  dimensions: ImageDimensions,
  panels: readonly GlassPanelPrototype[],
  colors: GlassMaterialColors,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  context.fillStyle = colors.light;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width, canvas.height) / 800;
  try {
    for (const panel of panels) {
      if (panel.width <= 0 || panel.height <= 0) continue;
      const sample = glassSampleRect(panel, panel.blur, dimensions);
      if (!sample) continue;
      // Snapshot before this panel, so subsequent panels see lower glass and text.
      const crop = document.createElement('canvas');
      crop.width = sample.width;
      crop.height = sample.height;
      const cropContext = crop.getContext('2d');
      if (!cropContext) throw new Error('Canvas is unavailable.');
      cropContext.drawImage(
        canvas,
        sample.x,
        sample.y,
        sample.width,
        sample.height,
        0,
        0,
        sample.width,
        sample.height,
      );
      const node = new Konva.Image({
        image: crop,
        width: crop.width,
        height: crop.height,
        listening: false,
      });
      let blurred: HTMLCanvasElement | undefined;
      try {
        if (panel.blur > 0) {
          node.cache({ pixelRatio: 1 });
          node.filters([Konva.Filters.Blur]);
          node.blurRadius(panel.blur);
          blurred = node.toCanvas({
            x: 0,
            y: 0,
            width: crop.width,
            height: crop.height,
            pixelRatio: 1,
          });
        }
        // External shadow follows the complete panel. Restore pixels inside from
        // the snapshot afterwards, retaining only the shadow outside the shape.
        context.save();
        roundedPath(context, panel);
        context.shadowColor = colors.dark;
        context.shadowBlur = 24 * scale;
        context.shadowOffsetY = 8 * scale;
        context.globalAlpha = 0.4;
        context.fillStyle = colors.dark;
        context.fill();
        context.restore();

        context.save();
        roundedPath(context, panel);
        context.clip();
        context.drawImage(blurred ?? crop, sample.x, sample.y);
        context.globalAlpha = panel.opacity;
        context.fillStyle = panel.color;
        context.fillRect(panel.x, panel.y, panel.width, panel.height);
        const reflection = context.createLinearGradient(
          panel.x,
          panel.y,
          panel.x + panel.width,
          panel.y + panel.height,
        );
        reflection.addColorStop(0, colors.light);
        reflection.addColorStop(0.5, panel.color);
        reflection.addColorStop(1, colors.dark);
        context.globalAlpha = 0.18;
        context.fillStyle = reflection;
        context.fillRect(panel.x, panel.y, panel.width, panel.height);
        // Clipped shifted strokes form the bevel with a light upper edge and
        // dark lower edge, avoiding blur/shadow support differences in CSS.
        context.globalAlpha = 0.35;
        context.strokeStyle = colors.light;
        context.lineWidth = scale;
        roundedPath(context, { ...panel, y: panel.y + 0.25 * scale });
        context.stroke();
        context.globalAlpha = 0.22;
        context.strokeStyle = colors.dark;
        roundedPath(context, { ...panel, y: panel.y - 0.25 * scale });
        context.stroke();
        context.restore();
      } finally {
        node.destroy();
        crop.width = crop.height = 0;
        if (blurred) blurred.width = blurred.height = 0;
      }
      context.save();
      context.fillStyle = colors.text;
      context.font = `${panel.text.fontSize}px "Montserrat Variable"`;
      context.textBaseline = 'top';
      panel.text.lines.forEach((line, index) => {
        context.fillText(
          line,
          panel.text.x,
          panel.text.y + index * panel.text.fontSize * 1.5,
        );
      });
      context.restore();
    }
    return canvas;
  } catch (error) {
    canvas.width = canvas.height = 0;
    throw error;
  }
}

export function encodeGlassPrototype(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (blob?.size && blob.type === 'image/jpeg') resolve(blob);
        else reject(new Error('The browser could not export this photo.'));
      },
      'image/jpeg',
      0.95,
    ),
  );
}
