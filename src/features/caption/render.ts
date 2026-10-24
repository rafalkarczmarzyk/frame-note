import { jpegQuality } from './export-settings';
import { anchoredPosition } from './layout';
import Konva from 'konva';
import type { Caption, ImageDimensions } from '../../domain/document';

/** Shared geometry for preview and full-resolution export. */
export function captionConfig(
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  color: string,
) {
  const edge = Math.min(dimensions.width, dimensions.height);
  const fontSize = (edge * caption.style.fontSizePercent) / 100;
  const marginX = (edge * caption.position.marginXPercent) / 100;
  const marginY = (edge * caption.position.marginYPercent) / 100;
  const metrics = new Konva.Text({
    text,
    fontSize,
    fontFamily: caption.style.fontFamily,
    fontStyle: caption.style.fontWeight === 700 ? 'bold' : 'normal',
    lineHeight: caption.style.lineHeight,
    wrap: 'none',
  });
  const block = { width: metrics.width(), height: metrics.height() };
  metrics.destroy();
  const position = anchoredPosition(
    dimensions,
    block,
    caption.position.anchor,
    marginX,
    marginY,
  );
  return {
    text,
    ...position,
    width: block.width,
    fontSize,
    fontFamily: caption.style.fontFamily,
    fontStyle: caption.style.fontWeight === 700 ? 'bold' : 'normal',
    lineHeight: caption.style.lineHeight,
    align: caption.style.textAlign,
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
  const quality = jpegQuality(qualityPercent);
  await document.fonts.load(
    `${caption.style.fontWeight} 16px "${caption.style.fontFamily}"`,
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
      new Konva.Image({
        image,
        width: dimensions.width,
        height: dimensions.height,
      }),
    );
    layer.add(new Konva.Text(captionConfig(dimensions, caption, text, color)));
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
  return name.replace(/\.jpe?g$/iu, '') + '-framenote.jpg';
}
