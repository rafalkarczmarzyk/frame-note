import { presetSchema } from './preset-schema';
import { defaultTiledPosition } from './tiled-watermark';
import { createLayerBlending } from './layer-blending';
import { parseIconToken } from './inline-icon';
import { migrateLogo, parseImageToken } from './inline-image';
import { validateImageAssets } from './image-validation';
import type { CaptionLayout, CaptionContainer } from './caption-layout';
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
/** Add defaults only for absent capabilities; supplied values are schema-validated. */
function normalizeContainer(container: CaptionContainer): CaptionContainer {
  return {
    ...container,
    effects: container.effects ?? [],
    blending: container.blending ?? createLayerBlending(),
    position: {
      ...container.position,
      tiled: container.position.tiled ?? {
        ...defaultTiledPosition(),
        enabled: false,
      },
    },
  };
}
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
    value.version > 3
  )
    throw Error('Preset version is newer than this application supports.');
  const parsed = presetSchema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]!;
    const path = issue.path.join('.') || 'preset';
    const reason =
      issue.code === 'invalid_type'
        ? 'Missing field or incorrect value type.'
        : 'Value does not match the supported preset format.';
    throw Error(`Invalid FrameNote preset: ${path}. ${reason}`);
  }
  const data = parsed.data;
  const ids = new Set(data.layout.containers.map((c) => c.id));
  if (
    ids.size !== data.layout.containers.length ||
    new Set(data.icons.map((i) => i.name)).size !== data.icons.length
  )
    throw Error('Preset identifiers must be unique.');
  const validColor = (color: string, path: string) => {
    if (
      !normalizeHex(color) &&
      !captionColors.some((item) => item.value === color) &&
      !legacyCaptionColors.some((item) => item === color)
    )
      throw Error(`Invalid preset color at ${path}.`);
  };
  for (const [index, c] of data.layout.containers.entries()) {
    const path = `layout.containers.${index}`;
    if (
      new Set(c.effects?.map((effect) => effect.id)).size !==
      (c.effects?.length ?? 0)
    )
      throw Error(
        `Preset effect identifiers must be unique at ${path}.effects.`,
      );
    c.effects?.forEach((effect, effectIndex) =>
      validColor(effect.color, `${path}.effects.${effectIndex}.color`),
    );
    validColor(c.style.color, `${path}.style.color`);
    if (c.background) {
      validColor(c.background.color, `${path}.background.color`);
      validColor(c.background.shadow.color, `${path}.background.shadow.color`);
    }
    if (c.images) {
      try {
        const originals = c.images;
        c.images = validateImageAssets(c.images, validateSvg).map(
          (image, index) => ({ ...originals[index], ...image }),
        );
      } catch (cause) {
        throw Error(
          `${path}.images: ${cause instanceof Error ? cause.message : 'Invalid image asset.'}`,
          { cause },
        );
      }
    }
  }
  const icons = data.icons.map((icon, index) => {
    try {
      return { ...icon, ...validateSvg(icon.name, icon.svg) };
    } catch (cause) {
      throw Error(
        `icons.${index}: ${cause instanceof Error ? cause.message : 'Invalid SVG asset.'}`,
        { cause },
      );
    }
  });
  return {
    ...data,
    version: 1,
    id: data.id,
    name: data.name,
    layout: {
      ...data.layout,
      containers: data.layout.containers.map(normalizeContainer),
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
  base?: LayoutPreset,
): LayoutPreset {
  const used = new Set([
    ...layout.containers.flatMap((c) =>
      [...c.template.matchAll(/\{icon:([^{}]+)\}/gu)].map(
        (match) => parseIconToken(`icon:${match[1]}`)?.name,
      ),
    ),
  ]);
  return structuredClone({
    ...base,
    version: 1,
    id,
    name: name.trim(),
    layout: {
      ...layout,
      containers: layout.containers.map((container) => {
        const migrated = normalizeContainer(migrateLogo(container));
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
