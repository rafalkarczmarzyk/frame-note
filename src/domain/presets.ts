import { parseIconToken } from './inline-icon';
import { fontIds } from './fonts';
import { migrateLogo, parseImageToken } from './inline-image';
import { validateImageAssets } from './image-validation';
import type { CaptionLayout } from './caption-layout';
import type { SvgAsset } from './svg-asset';
import {
  captionColors,
  legacyCaptionColors,
  normalizeHex,
} from './caption-colors';

export interface LayoutPreset {
  version: 1 | 2;
  id: string;
  name: string;
  layout: CaptionLayout;
  icons: SvgAsset[];
}
export const presetNameLimit = 80;
export const presetByteLimit = 5_000_000;
export const copyPresetName = (name: string) =>
  `${name.slice(0, presetNameLimit - 5).trimEnd()} copy`;
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
  if (new Blob([source]).size > presetByteLimit)
    throw Error('Preset must be smaller than 5 MB.');
  const data = record(JSON.parse(source));
  if (data.version !== 1 && data.version !== 2)
    throw Error('Unsupported preset version.');
  const name = text(data.name, presetNameLimit).trim();
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
      !captionColors.some((item) => item.value === color) &&
      !legacyCaptionColors.some((item) => item === color)
    )
      return invalid();
    const custom = p.custom === undefined ? undefined : record(p.custom);
    const logo = c.logo === undefined ? undefined : record(c.logo);
    return {
      id,
      ...(c.visible === undefined
        ? {}
        : { visible: typeof c.visible === 'boolean' ? c.visible : invalid() }),
      ...(c.images !== undefined
        ? { images: validateImageAssets(c.images, validateSvg) }
        : {}),
      template: text(c.template, 100_000),
      style: {
        fontFamily: oneOf(s.fontFamily, fontIds),
        fontWeight: oneOf(s.fontWeight, [400, 700]),
        ...(s.fontStyle === undefined
          ? {}
          : { fontStyle: oneOf(s.fontStyle, ['normal', 'italic']) }),
        fontSize: number(s.fontSize, 0),
        color,
        opacity: number(s.opacity, 0, 1),
        lineHeight: number(s.lineHeight, 0.1, 10),
        textAlign: oneOf(s.textAlign, ['auto', 'left', 'center', 'right']),
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
    version: 2,
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
      containers: containers.map(migrateLogo),
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
      [...c.template.matchAll(/\{icon:([^{}]+)\}/gu)].map(
        (match) => parseIconToken(`icon:${match[1]}`)?.name,
      ),
    ),
  ]);
  return structuredClone({
    version: 2,
    id,
    name: name.trim(),
    layout: {
      ...layout,
      containers: layout.containers.map((container) => {
        const migrated = migrateLogo(container);
        const ids = new Set(
          [...migrated.template.matchAll(/\{(image:[^{}]*)\}/gu)].map(
            (match) => parseImageToken(match[1]!)?.assetId,
          ),
        );
        return {
          ...migrated,
          ...(migrated.images
            ? { images: migrated.images.filter((image) => ids.has(image.id)) }
            : {}),
        };
      }),
    },
    icons: icons.filter((icon) => used.has(icon.name)),
  });
}
