import Konva from 'konva';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import {
  effectBleed,
  effectiveLayerEffect,
  mapEffectLengths,
} from '../../../../core/src/layer-effects';
import { toPixels } from '../../../../core/src/sizing';
import { resolvedColor } from './resolve-color';

/** Rasterize the shared content alpha and its decorations, once per motif, never per Tiled copy. */
export async function renderContentEffects(
  content: Konva.Group,
  caption: Caption,
  dimensions: ImageDimensions,
) {
  if (
    !caption.effects?.some(
      (effect) =>
        effect.type !== 'blur' && effect.enabled && effect.opacity > 0,
    )
  )
    return null;
  // One original alpha mask for text, SVG, PNG and separators. The background
  // is rendered outside this group and cannot enter the mask.
  const mask = content.clone({ opacity: 1, listening: false });
  if (!mask.children.length) {
    mask.destroy();
    return null;
  }
  const bounds = mask.getClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    mask.destroy();
    return null;
  }
  const bleed = effectBleed(caption, dimensions);
  const x = Math.floor(bounds.x - bleed),
    y = Math.floor(bounds.y - bleed);
  const width = Math.ceil(bounds.width + bleed * 2 + 2),
    height = Math.ceil(bounds.height + bleed * 2 + 2);
  if (width > 16384 || height > 16384 || width * height > 64_000_000) {
    mask.destroy();
    throw Error(
      'Layer effects are too large to render. Reduce effect size or content size.',
    );
  }
  let source: HTMLCanvasElement | undefined;
  let output: HTMLCanvasElement | undefined;
  let url: string | undefined;
  try {
    source = mask.toCanvas({ x, y, width, height, pixelRatio: 1 });
    const data = source.toDataURL();
    const filters: string[] = [],
      uses: string[] = [];
    for (const [index, item] of [...(caption.effects ?? [])]
      .reverse()
      .entries()) {
      if (!item.enabled || item.opacity <= 0 || item.type === 'blur') continue;
      const effect = mapEffectLengths(effectiveLayerEffect(item), (value) =>
        toPixels(value, caption.sizingUnit, dimensions),
      );
      // All filters read the same original content alpha, never another effect.
      filters.push(
        `<filter id="e${index}" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="${effect.spread < 0 ? 'erode' : 'dilate'}" radius="${Math.abs(effect.spread)}" result="spread"/><feGaussianBlur in="spread" stdDeviation="${effect.blur / 2}" result="blur"/><feOffset in="blur" dx="${effect.x}" dy="${effect.y}" result="offset"/><feFlood flood-color="${resolvedColor(effect.color)}" flood-opacity="${effect.opacity}"/><feComposite in2="offset" operator="in"/></filter>`,
      );
      uses.push(`<use href="#mask" filter="url(#e${index})"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><image id="mask" href="${data}" width="${width}" height="${height}"/>${filters.join('')}</defs>${uses.join('')}</svg>`;
    url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const image = new Image();
    image.src = url;
    await image.decode();
    output = document.createElement('canvas');
    output.width = width;
    output.height = height;
    const context = output.getContext('2d');
    if (!context) throw Error('Canvas is unavailable.');
    context.drawImage(image, 0, 0);
    return { image: output, x, y, width, height };
  } catch (error) {
    if (output) output.width = output.height = 0;
    throw error;
  } finally {
    mask.destroy();
    if (source) source.width = source.height = 0;
    if (url) URL.revokeObjectURL(url);
  }
}

/** Blur the composed content, including its text decorations; background stays separate.
 * Enabled Blur entries run from back to front, with opacity mixing sharp/blurred content. */
export function renderContentBlur(
  content: Konva.Group,
  caption: Caption,
  dimensions: ImageDimensions,
) {
  const effects = [...(caption.effects ?? [])]
    .reverse()
    .filter(
      (effect) =>
        effect.type === 'blur' &&
        effect.enabled &&
        effect.opacity > 0 &&
        effect.blur > 0,
    );
  if (!effects.length || !content.children.length) return null;
  const bounds = content.getClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) return null;
  const bleed =
    Math.ceil(
      effects.reduce(
        (sum, effect) =>
          sum + toPixels(effect.blur, caption.sizingUnit, dimensions) * 1.5,
        0,
      ),
    ) + 2;
  const x = Math.floor(bounds.x - bleed),
    y = Math.floor(bounds.y - bleed);
  const width = Math.ceil(bounds.width + bleed * 2 + 2),
    height = Math.ceil(bounds.height + bleed * 2 + 2);
  if (width > 16384 || height > 16384 || width * height > 64_000_000)
    throw Error(
      'Layer blur is too large to render. Reduce blur or content size.',
    );
  let source = content.toCanvas({ x, y, width, height, pixelRatio: 1 });
  try {
    for (const effect of effects) {
      const next = document.createElement('canvas');
      next.width = width;
      next.height = height;
      try {
        const context = next.getContext('2d');
        if (!context) throw Error('Canvas is unavailable.');
        context.globalAlpha = 1 - effect.opacity;
        context.drawImage(source, 0, 0);
        context.globalCompositeOperation = 'lighter';
        context.globalAlpha = effect.opacity;
        context.filter = `blur(${toPixels(effect.blur, caption.sizingUnit, dimensions) / 2}px)`;
        context.drawImage(source, 0, 0);
      } catch (error) {
        next.width = next.height = 0;
        throw error;
      }
      source.width = source.height = 0;
      source = next;
    }
    return { image: source, x, y, width, height };
  } catch (error) {
    source.width = source.height = 0;
    throw error;
  }
}
