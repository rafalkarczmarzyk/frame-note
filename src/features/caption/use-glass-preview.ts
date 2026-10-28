import { useEffect, useState } from 'react';
import type { LoadedPhoto } from '../photo/load-photo';
import { convertSizing } from '../../domain/sizing';
import { renderPhotoBackgrounds, type RenderedCaption } from './render';
import type { renderBackgroundTile } from './background-render';
type Tile = NonNullable<ReturnType<typeof renderBackgroundTile>>;

/** A bounded, screen-resolution composition. Requests are coalesced to a frame;
 * outdated results are released and never replace a newer photo's preview. */
export function useGlassPreview(
  photo: LoadedPhoto | null,
  captions: readonly RenderedCaption[],
  ready: boolean,
  maxSide: number,
) {
  const [result, setResult] = useState<{
    photo: LoadedPhoto;
    tiles: Map<string, Tile>;
  } | null>(null);
  const [failure, setFailure] = useState<{
    photo: LoadedPhoto;
    message: string;
  } | null>(null);
  const enabled =
    ready && captions.some((item) => item.caption.background?.type === 'glass');
  if ((!photo || !enabled) && result) setResult(null);
  if ((!photo || !enabled) && failure) setFailure(null);
  useEffect(() => {
    if (!photo || !enabled) return;
    let cancelled = false;
    const timer = requestAnimationFrame(() => {
      const original = photo.document.photo.dimensions;
      const ratio = Math.min(
        1,
        Math.max(320, Math.min(1600, maxSide)) /
          Math.max(original.width, original.height),
      );
      const dimensions = {
        width: Math.max(1, Math.round(original.width * ratio)),
        height: Math.max(1, Math.round(original.height * ratio)),
      };
      const scaled = captions.map((item) => ({
        ...item,
        caption: convertSizing(item.caption, 'short-edge', original),
      }));
      void renderPhotoBackgrounds(
        photo.previewImage ?? photo.image,
        dimensions,
        scaled,
      ).then(
        (backgrounds) => {
          if (cancelled) {
            backgrounds.forEach((tile) => {
              tile.image.width = tile.image.height = 0;
            });
            return;
          }
          const tiles = new Map<string, Tile>();
          backgrounds.forEach((tile, index) =>
            tiles.set(captions[index]!.id ?? String(index), {
              ...tile,
              x: (tile.x * original.width) / dimensions.width,
              y: (tile.y * original.height) / dimensions.height,
              width: (tile.width * original.width) / dimensions.width,
              height: (tile.height * original.height) / dimensions.height,
            }),
          );
          setResult({ photo, tiles });
          setFailure(null);
        },
        (error) => {
          if (!cancelled)
            setFailure({
              photo,
              message:
                error instanceof Error
                  ? error.message
                  : 'Glass preview failed.',
            });
        },
      );
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(timer);
      // React may still display this result until the next frame is ready;
      // let its canvas be collected after replacement rather than blanking it.
    };
  }, [photo, captions, enabled, maxSide]);
  // Release results when replaced or unmounted; effects don't clear a canvas
  // while it is still displayed by react-konva.
  useEffect(() => {
    const tiles = result?.tiles;
    return () => {
      tiles?.forEach((tile) => {
        tile.image.width = tile.image.height = 0;
      });
    };
  }, [result]);
  return {
    tiles: enabled && result?.photo === photo ? result.tiles : null,
    error: enabled && failure?.photo === photo ? failure.message : '',
  };
}
