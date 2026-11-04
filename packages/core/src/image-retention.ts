import { parseImageToken, type ImageAsset } from './inline-image';

export function referencedImageIds(template: string) {
  return new Set(
    [...template.matchAll(/\{(image:[^{}]*)\}/gu)]
      .map((match) => parseImageToken(match[1]!)?.assetId)
      .filter((id): id is string => !!id),
  );
}
export function activeImageAssets(
  template: string,
  assets: readonly ImageAsset[],
) {
  const ids = referencedImageIds(template);
  return assets.filter((asset) => ids.has(asset.id));
}
/** Validate content resources independently of the session history budget. */
export function checkImageRetention(
  template: string,
  assets: readonly ImageAsset[],
) {
  if (referencedImageIds(template).size > 100)
    throw Error('A layer supports up to 100 active images.');
  if (
    assets.length > 1000 ||
    assets.reduce((size, asset) => size + new Blob([asset.source]).size, 0) >
      64_000_000
  )
    throw Error(
      'Content resources reached 64 MB or 1000 assets. Remove unused images before adding more.',
    );
}
