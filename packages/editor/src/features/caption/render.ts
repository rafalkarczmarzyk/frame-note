import { tiledCopies } from '../../../../core/src/tiled-watermark';
import { captionBackgroundRect } from './background-render';
import { tiledBackground } from './tiled-background';
import { resolvedFontFamily } from '../../../../core/src/fonts';
import { resolvedColor } from './resolve-color';
import { renderBackgroundTile } from './background-render';
import { ensureCaptionFont } from './font-loading';
import { canvasFontStyle } from '../../../../core/src/font-style';
import { resolvedTextAlign } from '../../../../core/src/document';
import type { InlineAsset } from '../../../../core/src/inline-image';
import { logoLayout } from './logo-layout';
import { inlineLayout, tintedIcon } from './inline-layout';
import { loadIcon } from './svg-icons';
import { toPixels } from '../../../../core/src/sizing';
import { jpegQuality, type ExportFormat } from './export-settings';
import { anchoredPosition, customPosition } from './layout';
import Konva from 'konva';
import type { Caption, ImageDimensions } from '../../../../core/src/document';

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
    fontFamily: resolvedFontFamily(caption.style.fontFamily),
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
    fontFamily: resolvedFontFamily(caption.style.fontFamily),
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
  format: ExportFormat = 'jpg',
): Promise<Blob> {
  return exportPhotoCaptions(
    image,
    dimensions,
    [{ caption, text, color }],
    qualityPercent,
    format,
  );
}

export interface RenderedCaption {
  id?: string;
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
  format: ExportFormat = 'jpg',
): Promise<Blob> {
  const job = exportChain.then(() =>
    renderPhotoCaptions(image, dimensions, captions, qualityPercent, format),
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
  format: ExportFormat = 'jpg',
): Promise<Blob> {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  return withPhotoStage(
    image,
    dimensions,
    captions,
    async (stage) => {
      const blob = await stage.toBlob({
        mimeType,
        quality: format === 'jpg' ? jpegQuality(qualityPercent) : undefined,
        pixelRatio: 1,
      });
      if (!blob || blob.size === 0 || blob.type !== mimeType)
        throw new Error('The browser could not export this photo.');
      return blob;
    },
    undefined,
    format === 'jpg',
  );
}

type BackgroundTile = NonNullable<ReturnType<typeof renderBackgroundTile>>;

/** Keep preview rasterization local to the decorations. The photo and caption
 * remain native sharp nodes in the editor. Returned tiles belong to the caller. */
export async function renderPhotoBackgrounds(
  image: CanvasImageSource,
  dimensions: ImageDimensions,
  captions: readonly RenderedCaption[],
): Promise<Map<number, BackgroundTile>> {
  const tiles = new Map<number, BackgroundTile>();
  try {
    await withPhotoStage(
      image,
      dimensions,
      captions,
      () => undefined,
      (index, tile) => {
        const copy = document.createElement('canvas');
        copy.width = tile.width;
        copy.height = tile.height;
        const context = copy.getContext('2d');
        if (!context) throw Error('Canvas is unavailable.');
        context.drawImage(tile.image, 0, 0);
        tiles.set(index, { ...tile, image: copy });
      },
    );
    return tiles;
  } catch (error) {
    tiles.forEach((tile) => {
      tile.image.width = tile.image.height = 0;
    });
    throw error;
  }
}

async function withPhotoStage<T>(
  image: CanvasImageSource,
  dimensions: ImageDimensions,
  captions: readonly RenderedCaption[],
  consume: (stage: Konva.Stage) => T | Promise<T>,
  onDecoration?: (index: number, tile: BackgroundTile) => void,
  matte = true,
): Promise<T> {
  const alphaMatte = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-caption-white')
    .trim();
  await Promise.all(
    captions.map(({ caption, text }) => ensureCaptionFont(caption.style, text)),
  );
  const container = document.createElement('div');
  const stage = new Konva.Stage({
    container,
    width: dimensions.width,
    height: dimensions.height,
  });
  const decorations: HTMLCanvasElement[] = [];
  try {
    const layer = new Konva.Layer();
    stage.add(layer);
    if (matte)
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
    for (const [
      index,
      { caption, text, color, icons = [] },
    ] of captions.entries()) {
      if (caption.visible === false) continue;
      const geometry = caption.logo
        ? logoLayout(dimensions, caption)
        : inlineLayout(dimensions, caption, text, icons);
      if (caption.position.tiled?.enabled) {
        if (!text.trim() && !caption.logo) continue;
        const decorated = captionBackgroundRect(
          { x: 0, y: 0, width: geometry.width, height: geometry.height },
          caption,
          dimensions,
        );
        const copies = tiledCopies(
          dimensions,
          decorated,
          caption.position.tiled,
        );
        const motif = await captionNode(
          dimensions,
          caption,
          text,
          color,
          icons,
        );
        const backgrounds = new Konva.Group({ listening: false });
        // Every glass sample sees the layers below this layer, not sibling copies.
        for (const copy of copies) {
          const tile = tiledBackground(
            layer,
            dimensions,
            caption,
            geometry,
            copy,
          );
          if (tile) {
            decorations.push(tile.image);
            const group = new Konva.Group({
              x: copy.x,
              y: copy.y,
              rotation: caption.position.tiled.angle,
              listening: false,
            });
            group.add(new Konva.Image({ ...tile, listening: false }));
            backgrounds.add(group);
          }
        }
        layer.add(backgrounds);
        if (onDecoration && backgrounds.children.length) {
          const canvas = backgrounds.toCanvas({
            x: 0,
            y: 0,
            width: dimensions.width,
            height: dimensions.height,
            pixelRatio: 1,
          });
          decorations.push(canvas);
          onDecoration(index, {
            image: canvas,
            x: 0,
            y: 0,
            width: dimensions.width,
            height: dimensions.height,
          });
        }
        for (const copy of copies) {
          layer.add(
            motif.clone({
              x: copy.x,
              y: copy.y,
              rotation: caption.position.tiled.angle,
              offsetX: geometry.width / 2,
              offsetY: geometry.height / 2,
            }),
          );
        }
        motif.destroy();
        continue;
      }
      const background =
        text.trim() || caption.logo
          ? renderBackgroundTile(geometry, caption, dimensions, (rect) =>
              layer.toCanvas({ ...rect, pixelRatio: 1 }),
            )
          : null;
      if (background) {
        decorations.push(background.image);
        onDecoration?.(index, background);
        layer.add(new Konva.Image({ ...background, listening: false }));
      }
      const node = await captionNode(dimensions, caption, text, color, icons);
      node.position({ x: geometry.x, y: geometry.y });
      layer.add(node);
    }
    layer.draw();
    return await consume(stage);
  } finally {
    stage.destroy();
    decorations.forEach((canvas) => {
      canvas.width = canvas.height = 0;
    });
  }
}

async function captionNode(
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  color: string,
  icons: readonly InlineAsset[],
) {
  const scene = caption.logo
    ? logoLayout(dimensions, caption)
    : inlineLayout(dimensions, caption, text, icons);
  const group = new Konva.Group({
    opacity: caption.style.opacity,
    listening: false,
  });
  if (caption.logo) {
    const raw = await loadIcon(caption.logo.asset);
    group.add(
      new Konva.Image({
        width: scene.width,
        height: scene.height,
        image:
          caption.logo.colorMode === 'single'
            ? tintedIcon(caption.logo.asset, raw, scene.height, color)
            : raw,
      }),
    );
    return group;
  }
  if (!icons.length) {
    group.add(
      new Konva.Text({
        ...captionConfig(dimensions, caption, text, color),
        x: 0,
        y: 0,
        opacity: 1,
      }),
    );
    return group;
  }
  const inline = inlineLayout(dimensions, caption, text, icons);
  for (const run of inline.runs) {
    if (run.separator)
      group.add(
        new Konva.Rect({
          x: run.x,
          y: run.y + (run.height - (run.thickness ?? 0)) / 2,
          width: run.width,
          height: run.thickness,
          fill: resolvedColor(run.separator.color),
          opacity: run.separator.opacity,
        }),
      );
    else if (run.icon) {
      const image = await loadIcon(run.icon);
      group.add(
        new Konva.Image({
          x: run.x,
          y:
            run.y +
            (run.icon.image || run.icon.sizing
              ? 0
              : (inline.lineHeight - inline.fontSize) / 2),
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
          fontSize: inline.fontSize,
          fontFamily: resolvedFontFamily(caption.style.fontFamily),
          fontStyle: canvasFontStyle(caption),
          lineHeight: caption.style.lineHeight,
          fill: color,
          wrap: 'none',
        }),
      );
  }
  return group;
}

export function exportName(name: string, format: ExportFormat = 'jpg'): string {
  return name.replace(/\.(?:jpe?g|png)$/iu, '') + `-framenote.${format}`;
}
