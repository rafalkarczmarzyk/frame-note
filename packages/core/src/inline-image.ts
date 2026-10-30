import type { SeparatorReference } from './inline-separator';
import type { ElementSizing } from './inline-icon';
import type { SvgAsset } from './svg-asset';

export interface ImageAsset {
  id: string;
  name: string;
  format: 'svg' | 'png';
  source: string;
  width: number;
  height: number;
}
export interface ImageReference extends ElementSizing {
  assetId: string;
  height: number;
  unit: 'font' | 'document';
  colorMode: 'original' | 'single';
}
export interface InlineAsset extends SvgAsset {
  separator?: SeparatorReference;
  sizing?: ElementSizing;
  image?: ImageReference & { asset: ImageAsset };
}

// Per-occurrence settings are serialized with the token, so editing/reordering
// text never reassigns settings to another occurrence of the same asset.
export function imageToken(image: ImageReference): string {
  return `image:${image.assetId}:${image.height}:${image.unit}:${image.colorMode}${image.alignment ? `:${image.alignment}` : ''}`;
}
export function parseImageToken(token: string): ImageReference | null {
  const match =
    /^image:([a-zA-Z0-9-]{1,100}):([\d.e+-]+):(font|document):(original|single)(?::(top|center|bottom))?$/u.exec(
      token,
    );
  if (!match) return null;
  const height = Number(match[2]);
  if (!Number.isFinite(height) || height <= 0 || height > 1e7) return null;
  return {
    assetId: match[1]!,
    height,
    unit: match[3] as ImageReference['unit'],
    colorMode: match[4] as ImageReference['colorMode'],
    ...(match[5]
      ? { alignment: match[5] as NonNullable<ImageReference['alignment']> }
      : {}),
  };
}
export function migrateLogo<
  T extends {
    template: string;
    logo?: { asset: SvgAsset; width: number; colorMode: 'original' | 'single' };
    images?: ImageAsset[];
  },
>(caption: T): T {
  if (!caption.logo) return caption;
  const { logo, ...rest } = caption;
  const asset: ImageAsset = {
    id: `legacy-logo${caption.images?.length ? `-${caption.images.length}` : ''}`,
    name: logo.asset.name,
    format: 'svg',
    source: logo.asset.svg,
    width: logo.asset.aspect,
    height: 1,
  };
  return {
    ...rest,
    images: [...(caption.images ?? []), asset],
    template: `{${imageToken({ assetId: asset.id, height: logo.width / logo.asset.aspect, unit: 'document', colorMode: logo.colorMode })}}`,
  } as T;
}
