import type { CaptionLayout } from './caption-layout';
import type { SvgAsset } from './svg-asset';
import { captionColors, normalizeHex } from './caption-colors';

export interface LayoutPreset {
  version: 1;
  id: string;
  name: string;
  layout: CaptionLayout;
  icons: SvgAsset[];
}
export const presetStorageKey = 'framenote.presets.v1';
const invalid = () => {
  throw Error('This is not a valid FrameNote preset.');
};
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid();
  return value as Record<string, unknown>;
};
const text = (value: unknown, max: number): string => {
  if (typeof value !== 'string' || value.length > max) return invalid();
  return value;
};
const number = (value: unknown, min: number, max = 1e7): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    return invalid();
  return value;
};
function oneOf<T extends string | number>(
  value: unknown,
  choices: readonly T[],
): T {
  if (!choices.includes(value as T)) return invalid();
  return value as T;
}

/** Rebuild trusted domain data, discarding unknown fields and validating every SVG. */
export function parsePreset(
  source: string,
  validateSvg: (name: string, svg: string) => SvgAsset,
): LayoutPreset {
  if (source.length > 5_000_000)
    throw Error('Preset must be smaller than 5 MB.');
  const data = record(JSON.parse(source));
  if (data.version !== 1) throw Error('Unsupported preset version.');
  const name = text(data.name, 80).trim();
  if (!name) return invalid();
  const asset = (value: unknown, logo = false) => {
    const data = record(value);
    const name = text(data.name, logo ? 255 : 48);
    return {
      ...validateSvg(logo ? 'logo' : name, text(data.svg, 256_000)),
      name,
    };
  };
  const raw = record(data.layout);
  const margins = record(raw.margins);
  if (
    !Array.isArray(raw.containers) ||
    raw.containers.length > 100 ||
    !Array.isArray(data.icons) ||
    data.icons.length > 100
  )
    return invalid();
  const ids = new Set<string>();
  const containers = raw.containers.map((value) => {
    const c = record(value),
      s = record(c.style),
      p = record(c.position);
    const id = text(c.id, 100);
    if (!id || ids.has(id)) return invalid();
    ids.add(id);
    const color = text(s.color, 64);
    if (
      !normalizeHex(color) &&
      !captionColors.some((item) => item.value === color)
    )
      return invalid();
    const custom = p.custom === undefined ? undefined : record(p.custom);
    const logo = c.logo === undefined ? undefined : record(c.logo);
    return {
      id,
      template: text(c.template, 100_000),
      style: {
        fontFamily: oneOf(s.fontFamily, ['Montserrat Variable', 'Advercase']),
        fontWeight: oneOf(s.fontWeight, [400, 700]),
        fontSize: number(s.fontSize, 0),
        color,
        opacity: number(s.opacity, 0, 1),
        lineHeight: number(s.lineHeight, 0.1, 10),
        textAlign: oneOf(s.textAlign, ['left', 'center', 'right']),
      },
      position: {
        anchor: oneOf(p.anchor, [
          'top-left',
          'top-center',
          'top-right',
          'center-left',
          'center',
          'center-right',
          'bottom-left',
          'bottom-center',
          'bottom-right',
        ]),
        ...(custom
          ? {
              custom: {
                x: number(custom.x, 0, 100),
                y: number(custom.y, 0, 100),
              },
            }
          : {}),
      },
      ...(logo
        ? {
            logo: {
              asset: asset(logo.asset, true),
              width: number(logo.width, 0),
              colorMode: oneOf(logo.colorMode, ['original', 'single']),
            },
          }
        : {}),
    };
  });
  const icons = data.icons.map((value) => asset(value));
  if (new Set(icons.map((icon) => icon.name)).size !== icons.length)
    return invalid();
  return {
    version: 1,
    id: text(data.id, 100),
    name,
    layout: {
      sizingUnit: oneOf(raw.sizingUnit, ['px', 'short-edge', 'long-edge']),
      margins: {
        top: number(margins.top, 0),
        right: number(margins.right, 0),
        bottom: number(margins.bottom, 0),
        left: number(margins.left, 0),
      },
      marginLinkMode: oneOf(raw.marginLinkMode, ['none', 'pairs', 'all']),
      containers,
      activeId:
        typeof raw.activeId === 'string' && ids.has(raw.activeId)
          ? raw.activeId
          : (containers[0]?.id ?? null),
    },
    icons,
  };
}

export function createPreset(
  id: string,
  name: string,
  layout: CaptionLayout,
  icons: SvgAsset[],
): LayoutPreset {
  const used = new Set([
    ...layout.containers.flatMap((c) =>
      [...c.template.matchAll(/\{icon:([^{}]+)\}/gu)].map((match) => match[1]),
    ),
  ]);
  return structuredClone({
    version: 1,
    id,
    name: name.trim(),
    layout,
    icons: icons.filter((icon) => used.has(icon.name)),
  });
}
