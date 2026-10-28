import { canvasFontStyle } from '../../domain/font-style';
import { resolvedTextAlign } from '../../domain/document';
import Konva from 'konva';
import type { Caption, ImageDimensions } from '@/domain/document';
import { toPixels } from '../../domain/sizing';
import { anchoredPosition, customPosition } from './layout';
import { inlineRuns } from './inline-content';
import type { InlineAsset } from '@/domain/inline-image';
import type { SvgIcon } from './svg-icons';

export interface InlineRun {
  x: number;
  y: number;
  width: number;
  text?: string;
  icon?: InlineAsset;
  height: number;
  original?: boolean;
}
export function inlineLayout(
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  icons: readonly InlineAsset[],
) {
  const fontSize = toPixels(
    caption.style.fontSize,
    caption.sizingUnit,
    dimensions,
  );
  const lineHeight = fontSize * caption.style.lineHeight;
  const lines = text.split('\n').map((line) => {
    let width = 0;
    const runs = inlineRuns(line).map((run) => {
      const icon = 'icon' in run ? icons[run.icon] : undefined;
      const metrics =
        'text' in run
          ? new Konva.Text({
              text: run.text,
              fontSize,
              fontFamily: caption.style.fontFamily,
              fontStyle: canvasFontStyle(caption),
              wrap: 'none',
            })
          : null;
      const sizing = icon?.image ?? icon?.sizing;
      const height = sizing
        ? sizing.unit === 'font'
          ? fontSize * sizing.height
          : toPixels(sizing.height, caption.sizingUnit, dimensions)
        : fontSize;
      const size = icon ? height * icon.aspect : (metrics?.width() ?? 0);
      metrics?.destroy();
      const result = {
        x: width,
        height,
        original:
          icon?.image?.colorMode === 'original' ||
          icon?.image?.asset.format === 'png',
        width: size,
        text: 'text' in run ? run.text : undefined,
        icon,
      };
      width += size;
      return result;
    });
    const imageOnly = runs.length > 0 && runs.every((run) => run.icon?.image);
    const referenceHeight = imageOnly ? 0 : lineHeight;
    const positioned = runs.map((run) => {
      const sizing = run.icon?.image ?? run.icon?.sizing;
      const factor =
        sizing?.alignment === 'top'
          ? 0
          : sizing?.alignment === 'bottom'
            ? 1
            : 0.5;
      return {
        ...run,
        y: sizing ? (referenceHeight - run.height) * factor : 0,
      };
    });
    const top = Math.min(0, ...positioned.map((run) => run.y));
    const bottom = Math.max(
      referenceHeight,
      ...positioned.map((run) => run.y + (run.icon ? run.height : lineHeight)),
    );
    return { width, runs: positioned, height: bottom - top, top };
  });
  const block = {
    width: Math.max(0, ...lines.map((line) => line.width)),
    height: lines.reduce((sum, line) => sum + line.height, 0),
  };
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
  const position = caption.position.custom
    ? customPosition(
        dimensions,
        block,
        caption.position.anchor,
        caption.position.custom,
      )
    : anchoredPosition(dimensions, block, caption.position.anchor, margins);
  let rowY = 0;
  const runs: InlineRun[] = lines.flatMap((line) => {
    const y = rowY;
    rowY += line.height;
    const offset =
      resolvedTextAlign(caption) === 'right'
        ? block.width - line.width
        : resolvedTextAlign(caption) === 'center'
          ? (block.width - line.width) / 2
          : 0;
    return line.runs.map((run) => ({
      ...run,
      x: run.x + offset,
      y: y + run.y - line.top,
    }));
  });
  return { ...block, ...position, fontSize, lineHeight, runs };
}

const tinted = new Map<string, HTMLCanvasElement>();
export function tintedIcon(
  icon: SvgIcon,
  image: HTMLImageElement,
  height: number,
  color: string,
) {
  const pixelHeight = Math.max(
    1,
    Math.min(4096, Math.ceil(height), Math.ceil(4096 / icon.aspect)),
  );
  const key = `${icon.svg}|${pixelHeight}|${color}`;
  let canvas = tinted.get(key);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(pixelHeight * icon.aspect));
    canvas.height = pixelHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    tinted.set(key, canvas);
    if (tinted.size > 64) tinted.delete(tinted.keys().next().value!);
  }
  return canvas;
}
