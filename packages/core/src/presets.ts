import { presetV1 } from './preset-formats/v1';
import { parseIconToken } from './inline-icon';
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
  version: 1;
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
/** Validate the official wire contract and all embedded artwork. */
export function parsePreset(
  source: string,
  validateSvg: (name: string, svg: string) => SvgAsset,
): LayoutPreset {
  if (new Blob([source]).size > presetByteLimit)
    throw Error('Preset must be smaller than 5 MB.');
  const value: unknown = JSON.parse(source);
  if (
    value &&
    typeof value === 'object' &&
    'version' in value &&
    typeof value.version === 'number' &&
    value.version > 1
  )
    throw Error('Preset version is newer than this application supports.');
  const parsed = presetV1.safeParse(value);
  if (!parsed.success) throw Error('Invalid FrameNote v1 preset.');
  const data = parsed.data;
  const ids = new Set(data.layout.containers.map((c) => c.id));
  if (
    ids.size !== data.layout.containers.length ||
    new Set(data.icons.map((i) => i.name)).size !== data.icons.length
  )
    throw Error('Preset identifiers must be unique.');
  const validColor = (color: string) => {
    if (
      !normalizeHex(color) &&
      !captionColors.some((item) => item.value === color) &&
      !legacyCaptionColors.some((item) => item === color)
    )
      throw Error('Invalid preset color.');
  };
  for (const c of data.layout.containers) {
    validColor(c.style.color);
    if (c.background) {
      validColor(c.background.color);
      validColor(c.background.shadow.color);
    }
    if (c.images) c.images = validateImageAssets(c.images, validateSvg);
  }
  const icons = data.icons.map((icon) => validateSvg(icon.name, icon.svg));
  return {
    version: 1,
    id: data.id,
    name: data.name,
    layout: {
      ...data.layout,
      activeId:
        data.layout.activeId && ids.has(data.layout.activeId)
          ? data.layout.activeId
          : (data.layout.containers[0]?.id ?? null),
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
    version: 1,
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
