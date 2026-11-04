import { useEffect, useState, type RefObject } from 'react';
import type Konva from 'konva';
import type { Size } from './navigator-geometry';

/** Rasterize only composition changes, using the preview's scene and bounded output. */
export function useCompositionOverview(
  group: RefObject<Konva.Group | null>,
  dimensions: Size,
  ready: boolean,
  composition: unknown,
  assets: unknown,
  decorations: unknown,
  sourceKey: unknown,
) {
  const pixelRatio = Math.min(2, devicePixelRatio);
  const [result, setResult] = useState<{
    sourceKey: unknown;
    preview: string;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    if (!ready || !group.current) return;
    const source = group.current;
    const frame = requestAnimationFrame(() => {
      const scale = Math.min(260 / dimensions.width, 160 / dimensions.height);
      const clone = source.clone({
        x: 0,
        y: 0,
        scaleX: scale,
        scaleY: scale,
        listening: false,
      });
      try {
        clone
          .find('.navigator-decoration, .editor-placeholder')
          .forEach((node) => node.destroy());
        const preview = clone.toDataURL({
          x: 0,
          y: 0,
          width: dimensions.width * scale,
          height: dimensions.height * scale,
          pixelRatio,
        });
        setResult({ sourceKey, preview, error: false });
      } catch {
        setResult({ sourceKey, preview: '', error: true });
      } finally {
        clone.destroy();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    group,
    dimensions,
    ready,
    composition,
    assets,
    decorations,
    pixelRatio,
    sourceKey,
  ]);
  return {
    preview: result && result.sourceKey === sourceKey ? result.preview : '',
    error: result && result.sourceKey === sourceKey && result.error,
  };
}
