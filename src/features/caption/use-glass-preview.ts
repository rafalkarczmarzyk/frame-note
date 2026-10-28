import { useEffect, useState } from 'react';
import type { LoadedPhoto } from '../photo/load-photo';
import { convertSizing } from '../../domain/sizing';
import { renderPhotoCanvas, type RenderedCaption } from './render';

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
    canvas: HTMLCanvasElement;
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
      void renderPhotoCanvas(
        photo.previewImage ?? photo.image,
        dimensions,
        scaled,
      ).then(
        (canvas) => {
          if (cancelled) {
            canvas.width = canvas.height = 0;
            return;
          }
          setResult({ photo, canvas });
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
    const canvas = result?.canvas;
    return () => {
      if (canvas) canvas.width = canvas.height = 0;
    };
  }, [result]);
  return {
    canvas: enabled && result?.photo === photo ? result.canvas : null,
    error: enabled && failure?.photo === photo ? failure.message : '',
  };
}
