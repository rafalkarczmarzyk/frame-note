import { ensureCaptionFont } from './font-loading';
import { canvasFontStyle } from '../../domain/font-style';
import { resolvedTextAlign } from '../../domain/document';
import type { InlineAsset } from '@/domain/inline-image';
import { logoLayout } from './logo-layout';
import { inlineLayout, tintedIcon } from './inline-layout';
import { loadIcon } from './svg-icons';
import { toPixels } from '../../domain/sizing';
import { jpegQuality } from './export-settings';
import { anchoredPosition, customPosition } from './layout';
import Konva from 'konva';
import type { Caption, ImageDimensions } from '../../domain/document';

/** Shared geometry for preview and full-resolution export. */
export function captionConfig(
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  color: string,
) {
  const fontSize = toPixels(
    caption.style.fontSize,
    caption.sizingUnit,
    dimensions,
  );
  const margins = {
    top: toPixels(caption.position.margins.top, caption.sizingUnit, dimensions),
    right: toPixels(
      caption.position.margins.right,
      caption.sizingUnit,
      dimensions,
    ),
    bottom: toPixels(
      caption.position.margins.bottom,
      caption.sizingUnit,
      dimensions,
    ),
    left: toPixels(
      caption.position.margins.left,
      caption.sizingUnit,
      dimensions,
    ),
  };
  const metrics = new Konva.Text({
    text,
    fontSize,
    fontFamily: caption.style.fontFamily,
    fontStyle: canvasFontStyle(caption),
    lineHeight: caption.style.lineHeight,
    wrap: 'none',
  });
  const block = { width: metrics.width(), height: metrics.height() };
  metrics.destroy();
  const position = caption.position.custom
    ? customPosition(
        dimensions,
        block,
        caption.position.anchor,
        caption.position.custom,
      )
    : anchoredPosition(dimensions, block, caption.position.anchor, margins);
  return {
    text,
    ...position,
    width: block.width,
    fontSize,
    fontFamily: caption.style.fontFamily,
    fontStyle: canvasFontStyle(caption),
    lineHeight: caption.style.lineHeight,
    align: resolvedTextAlign(caption),
    fill: color,
    opacity: caption.style.opacity,
    wrap: 'none',
    listening: false,
  } as const;
}

export async function exportPhoto(
  image: HTMLImageElement,
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  color: string,
  qualityPercent = 95,
): Promise<Blob> {
  return exportPhotoCaptions(
    image,
    dimensions,
    [{ caption, text, color }],
    qualityPercent,
  );
}

export interface RenderedCaption {
  caption: Caption;
  text: string;
  color: string;
  icons?: readonly InlineAsset[];
}

// Share the render queue between prepared JPGs and batch output. A cancelled
// preparation may still be encoding; never overlap full-resolution canvases.
let exportChain: Promise<void> = Promise.resolve();
export function exportPhotoCaptions(
  image: HTMLImageElement,
  dimensions: ImageDimensions,
  captions: readonly RenderedCaption[],
  qualityPercent = 95,
): Promise<Blob> {
  const job = exportChain.then(() =>
    renderPhotoCaptions(image, dimensions, captions, qualityPercent),
  );
  exportChain = job.then(
    () => {},
    () => {},
  );
  return job;
}

async function renderPhotoCaptions(
  image: HTMLImageElement,
  dimensions: ImageDimensions,
  captions: readonly RenderedCaption[],
  qualityPercent = 95,
): Promise<Blob> {
  const alphaMatte = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-caption-white')
    .trim();
  const quality = jpegQuality(qualityPercent);
  await Promise.all(
    captions.map(({ caption, text }) => ensureCaptionFont(caption.style, text)),
  );
  const container = document.createElement('div');
  const stage = new Konva.Stage({
    container,
    width: dimensions.width,
    height: dimensions.height,
  });
  try {
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
        fill: alphaMatte,
        listening: false,
      }),
    );
    layer.add(
      new Konva.Image({
        image,
        width: dimensions.width,
        height: dimensions.height,
      }),
    );
    for (const { caption, text, color, icons = [] } of captions) {
      if (caption.visible === false) continue;
      if (caption.logo) {
        const scene = logoLayout(dimensions, caption);
        const raw = await loadIcon(caption.logo.asset);
        const image =
          caption.logo.colorMode === 'single'
            ? tintedIcon(caption.logo.asset, raw, scene.height, color)
            : raw;
        layer.add(
          new Konva.Image({ ...scene, image, opacity: caption.style.opacity }),
        );
        continue;
      }
      if (!icons.length) {
        layer.add(
          new Konva.Text(captionConfig(dimensions, caption, text, color)),
        );
        continue;
      }
      const scene = inlineLayout(dimensions, caption, text, icons);
      const group = new Konva.Group({
        x: scene.x,
        y: scene.y,
        opacity: caption.style.opacity,
      });
      layer.add(group);
      for (const run of scene.runs) {
        if (run.icon) {
          const image = await loadIcon(run.icon);
          group.add(
            new Konva.Image({
              x: run.x,
              y:
                run.y +
                (run.icon.image ? 0 : (scene.lineHeight - scene.fontSize) / 2),
              width: run.width,
              height: run.height,
              image: run.original
                ? image
                : tintedIcon(run.icon, image, run.height, color),
            }),
          );
        } else
          group.add(
            new Konva.Text({
              x: run.x,
              y: run.y,
              text: run.text,
              fontSize: scene.fontSize,
              fontFamily: caption.style.fontFamily,
              fontStyle: canvasFontStyle(caption),
              lineHeight: caption.style.lineHeight,
              fill: color,
              wrap: 'none',
            }),
          );
      }
    }
    layer.draw();
    const blob = await stage.toBlob({
      mimeType: 'image/jpeg',
      quality,
      pixelRatio: 1,
    });
    if (!blob || blob.size === 0 || blob.type !== 'image/jpeg')
      throw new Error('The browser could not export this photo.');
    return blob;
  } finally {
    stage.destroy();
  }
}

export function exportName(name: string): string {
  return name.replace(/\.(?:jpe?g|png)$/iu, '') + '-framenote.jpg';
}
