import type { MarginLinkMode, Margins } from './sizing';

export interface LayerBackground {
  type: 'none' | 'color' | 'glass';
  color: string;
  opacity: number;
  padding: Margins;
  paddingLinkMode: MarginLinkMode;
  radius: number;
  blur: number;
  shadow: {
    enabled: boolean;
    color: string;
    opacity: number;
    blur: number;
    spread: number;
    x: number;
    y: number;
  };
}

export function createLayerBackground(): LayerBackground {
  return {
    type: 'none',
    color: 'charcoal',
    opacity: 0.25,
    padding: { top: 1.5, right: 2, bottom: 1.5, left: 2 },
    paddingLinkMode: 'pairs',
    radius: 0.8,
    blur: 0.8,
    shadow: {
      enabled: false,
      color: 'caption-black',
      opacity: 0.35,
      blur: 1,
      spread: 0,
      x: 0,
      y: 0.5,
    },
  };
}

/** Glass starts with the compact, rounded surface values used in the editor. */
export function createGlassLayerBackground(): LayerBackground {
  return {
    ...createLayerBackground(),
    type: 'glass',
    color: 'caption-dark-gray',
    opacity: 0.12,
    padding: { top: 0.8, right: 1.7, bottom: 0.8, left: 1.7 },
    paddingLinkMode: 'pairs',
    radius: 1.5,
    blur: 0.5,
  };
}

/** Color backgrounds start with a compact, subtle panel behind the text. */
export function createColorLayerBackground(): LayerBackground {
  return {
    ...createLayerBackground(),
    type: 'color',
    color: 'charcoal',
    opacity: 0.67,
    padding: { top: 0.8, right: 1.7, bottom: 0.8, left: 1.7 },
    paddingLinkMode: 'pairs',
    radius: 1.5,
    shadow: { ...createLayerBackground().shadow, enabled: false },
  };
}

/** All lengths use the document unit, including settings retained under None. */
export function mapBackgroundLengths(
  background: LayerBackground,
  convert: (value: number) => number,
): LayerBackground {
  return {
    ...background,
    padding: {
      top: convert(background.padding.top),
      right: convert(background.padding.right),
      bottom: convert(background.padding.bottom),
      left: convert(background.padding.left),
    },
    radius: convert(background.radius),
    blur: convert(background.blur),
    shadow: {
      ...background.shadow,
      blur: convert(background.shadow.blur),
      spread: convert(background.shadow.spread),
      x: convert(background.shadow.x),
      y: convert(background.shadow.y),
    },
  };
}

export interface ContentRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Padding changes decoration bounds, never the content origin or anchor. Empty
 * resolved content does not leave an orphan panel behind. */
export function backgroundRect(
  content: ContentRect,
  background?: LayerBackground,
): ContentRect {
  if (
    !background ||
    background.type === 'none' ||
    content.width <= 0 ||
    content.height <= 0
  )
    return { ...content };
  const p = background.padding;
  return {
    x: content.x - p.left,
    y: content.y - p.top,
    width: content.width + p.left + p.right,
    height: content.height + p.top + p.bottom,
  };
}
