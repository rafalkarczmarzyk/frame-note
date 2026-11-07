import { comparePreview } from './compare-preview';
import { LivePreviewRenderer } from './live-preview-renderer';
import { LatestPreview } from './latest-preview';
import {
  dragSample,
  dragTimer,
  liveDragPreview,
} from '../photo/drag-diagnostics';
import { hasLayerEffects } from '../../../../core/src/layer-effects';
import { hasLayerBlending } from '../../../../core/src/layer-blending';
import { useEffect, useState, useRef } from 'react';
import type { LoadedPhoto } from '../photo/load-photo';
import { convertSizing } from '../../../../core/src/sizing';
import {
  renderPhotoBackgrounds,
  renderPhotoComposition,
  type RenderedCaption,
} from './render';
import type { renderBackgroundTile } from './background-render';
type Tile = NonNullable<ReturnType<typeof renderBackgroundTile>>;

/** A bounded, screen-resolution composition. Requests are coalesced to a frame;
 * outdated results are released and never replace a newer photo's preview. */
export function useGlassPreview(
  photo: LoadedPhoto | null,
  captions: readonly RenderedCaption[],
  ready: boolean,
  resolutionScale: number,
  dragging = false,
) {
  const live = useRef<{
    photo: LoadedPhoto;
    source: CanvasImageSource;
    width: number;
    height: number;
    renderer: LivePreviewRenderer;
    queue: LatestPreview<readonly RenderedCaption[], HTMLCanvasElement>;
  } | null>(null);
  useEffect(
    () => () => {
      live.current?.queue.dispose();
      live.current?.renderer.dispose();
      live.current = null;
    },
    [photo, resolutionScale, ready],
  );
  const [result, setResult] = useState<{
    photo: LoadedPhoto;
    tiles: Map<string, Tile>;
    composition?: Tile;
    release?: () => void;
  } | null>(null);
  const [failure, setFailure] = useState<{
    photo: LoadedPhoto;
    message: string;
  } | null>(null);
  const blended = captions.some(
    (item) => hasLayerBlending(item.caption) || hasLayerEffects(item.caption),
  );
  const enabled =
    ready &&
    !dragging &&
    (liveDragPreview ||
      blended ||
      captions.some(
        (item) =>
          item.caption.background?.type === 'glass' ||
          (item.caption.position.tiled?.enabled &&
            item.caption.background &&
            item.caption.background.type !== 'none'),
      ));
  if ((!photo || !enabled) && result) setResult(null);
  if ((!photo || !enabled) && failure) setFailure(null);
  useEffect(() => {
    if (!photo || !enabled) return;
    let cancelled = false;
    const timer = requestAnimationFrame(() => {
      const original = photo.document.photo.dimensions;
      const ratio = Math.max(0.001, Math.min(1, resolutionScale));
      const dimensions = {
        width: Math.max(1, Math.round(original.width * ratio)),
        height: Math.max(1, Math.round(original.height * ratio)),
      };
      const scaled = captions.map((item) => ({
        ...item,
        caption: convertSizing(item.caption, 'short-edge', original),
      }));
      const finishRender = dragTimer('preview-render');
      dragSample('preview-request');
      const source =
        photo.previewImage &&
        photo.previewImage.width >= dimensions.width &&
        photo.previewImage.height >= dimensions.height
          ? photo.previewImage
          : photo.image;
      const useLive = liveDragPreview;
      if (
        useLive &&
        (!live.current ||
          live.current.photo !== photo ||
          live.current.source !== source ||
          live.current.width !== dimensions.width ||
          live.current.height !== dimensions.height)
      ) {
        live.current?.queue.dispose();
        live.current?.renderer.dispose();
        const renderer = new LivePreviewRenderer(source, dimensions);
        live.current = {
          photo,
          source,
          ...dimensions,
          renderer,
          queue: new LatestPreview(
            (items) => renderer.render(items),
            (canvas) => renderer.release(canvas),
          ),
        };
      }
      if (useLive)
        Object.assign(window, {
          __frameNoteComparePreview: () =>
            comparePreview(source, dimensions, scaled),
        });
      const liveSession = live.current;
      const request = useLive
        ? live.current!.queue.request(scaled)
        : (blended ? renderPhotoComposition : renderPhotoBackgrounds)(
            source,
            dimensions,
            scaled,
          );
      void request.then(
        (backgrounds) => {
          finishRender();
          if (!backgrounds) return;
          const obsolete = useLive ? live.current !== liveSession : cancelled;
          dragSample(obsolete ? 'preview-discarded' : 'preview-accepted');
          if (obsolete) {
            if (backgrounds instanceof HTMLCanvasElement) {
              if (useLive) liveSession!.renderer.release(backgrounds);
              else backgrounds.width = backgrounds.height = 0;
            } else
              backgrounds.forEach((tile) => {
                tile.image.width = tile.image.height = 0;
              });
            return;
          }
          if (backgrounds instanceof HTMLCanvasElement) {
            setResult({
              photo,
              release: useLive
                ? () => liveSession!.renderer.release(backgrounds)
                : undefined,
              tiles: new Map(),
              composition: {
                image: backgrounds,
                x: 0,
                y: 0,
                width: original.width,
                height: original.height,
              },
            });
            setFailure(null);
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
          finishRender();
          dragSample('preview-error');
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
  }, [photo, captions, enabled, resolutionScale, blended]);
  useEffect(() => {
    if (result) dragSample('preview-react-effect');
  }, [result]);
  // Release results when replaced or unmounted; effects don't clear a canvas
  // while it is still displayed by react-konva.
  useEffect(() => {
    const tiles = result?.tiles;
    const composition = result?.composition;
    const release = result?.release;
    return () => {
      if (release) release();
      else if (composition)
        composition.image.width = composition.image.height = 0;
      tiles?.forEach((tile) => {
        tile.image.width = tile.image.height = 0;
      });
    };
  }, [result]);
  return {
    blended: (blended || liveDragPreview) && !dragging,
    composition:
      enabled && (blended || liveDragPreview) && result?.photo === photo
        ? result.composition
        : undefined,
    tiles: enabled && result?.photo === photo ? result.tiles : null,
    error: enabled && failure?.photo === photo ? failure.message : '',
  };
}
