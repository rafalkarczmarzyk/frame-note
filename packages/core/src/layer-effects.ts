import type { Caption, ImageDimensions } from './document';
import { pixelsPerUnit } from './sizing';

export type LayerEffectType = 'outline' | 'shadow' | 'glow' | 'blur';
/** Top-first stack; lengths use the document sizing unit. */
export interface LayerEffect {
  id: string;
  type: LayerEffectType;
  enabled: boolean;
  color: string;
  opacity: number;
  x: number;
  y: number;
  spread: number;
  blur: number;
}
export function createLayerEffect(
  type: LayerEffectType,
  caption: Caption,
  dimensions: ImageDimensions,
): LayerEffect {
  const unit = pixelsPerUnit(caption.sizingUnit, dimensions);
  // Defaults scale with the document, independent of preview zoom.
  const scale = Math.min(dimensions.width, dimensions.height) / 600 / unit;
  const shortPercent =
    Math.min(dimensions.width, dimensions.height) / 100 / unit;
  return {
    id: crypto.randomUUID(),
    type,
    enabled: true,
    color: type === 'glow' ? 'caption-muted-gold' : 'caption-black',
    opacity: type === 'blur' ? 1 : 0.8,
    x: type === 'shadow' ? 0.2 * shortPercent : 0,
    y: type === 'shadow' ? 0.2 * shortPercent : 0,
    spread: type === 'outline' ? 0.12 * shortPercent : 0,
    blur:
      type === 'outline' ? 0 : type === 'blur' ? 0.2 * shortPercent : 6 * scale,
  };
}
/** Outline is always a sharp, centered text contour. Retain old wire fields. */
export function effectiveLayerEffect(effect: LayerEffect): LayerEffect {
  return effect.type === 'outline'
    ? { ...effect, x: 0, y: 0, blur: 0 }
    : effect;
}
export function mapEffectLengths(
  effect: LayerEffect,
  convert: (value: number) => number,
): LayerEffect {
  return {
    ...effect,
    x: convert(effect.x),
    y: convert(effect.y),
    spread: convert(effect.spread),
    blur: convert(effect.blur),
  };
}
export const hasLayerEffects = (caption: Caption) =>
  !!caption.effects?.some(
    (effect) =>
      effect.enabled &&
      effect.opacity > 0 &&
      (effect.type !== 'blur' || effect.blur > 0),
  );
/** Content decorations plus sequential blurs, in document pixels. */
export function effectBleed(
  caption: Caption,
  dimensions: ImageDimensions,
): number {
  if (!hasLayerEffects(caption)) return 0;
  const unit = pixelsPerUnit(caption.sizingUnit, dimensions);
  const enabled = (caption.effects ?? []).filter(
    (effect) => effect.enabled && effect.opacity > 0,
  );
  const text = Math.max(
    0,
    ...enabled
      .filter((effect) => effect.type !== 'blur')
      .map(effectiveLayerEffect)
      .map(
        (effect) =>
          Math.max(0, effect.spread) +
          effect.blur * 1.5 +
          Math.max(Math.abs(effect.x), Math.abs(effect.y)),
      ),
  );
  const blur = enabled
    .filter((effect) => effect.type === 'blur')
    .reduce((sum, effect) => sum + effect.blur * 1.5, 0);
  return Math.ceil((text + blur) * unit + 2);
}
