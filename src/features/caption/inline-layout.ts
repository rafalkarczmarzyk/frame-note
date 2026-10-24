import Konva from 'konva';
import type { Caption, ImageDimensions } from '@/domain/document';
import { toPixels } from '../../domain/sizing';
import { anchoredPosition, customPosition } from './layout';
import { inlineRuns } from './inline-content';
import type { SvgIcon } from './svg-icons';

export interface InlineRun {
  x: number;
  y: number;
  width: number;
  text?: string;
  icon?: SvgIcon;
}
export function inlineLayout(
  dimensions: ImageDimensions,
  caption: Caption,
  text: string,
  icons: readonly SvgIcon[],
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
              fontStyle: caption.style.fontWeight === 700 ? 'bold' : 'normal',
              wrap: 'none',
            })
          : null;
      const size = icon ? fontSize * icon.aspect : (metrics?.width() ?? 0);
      metrics?.destroy();
      const result = {
        x: width,
        width: size,
        text: 'text' in run ? run.text : undefined,
        icon,
      };
      width += size;
      return result;
    });
    return { width, runs };
  });
  const block = {
    width: Math.max(0, ...lines.map((line) => line.width)),
    height: lines.length * lineHeight,
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
  const runs: InlineRun[] = lines.flatMap((line, row) => {
    const offset =
      caption.style.textAlign === 'right'
        ? block.width - line.width
        : caption.style.textAlign === 'center'
          ? (block.width - line.width) / 2
          : 0;
    return line.runs.map((run) => ({
      ...run,
      x: run.x + offset,
      y: row * lineHeight,
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
