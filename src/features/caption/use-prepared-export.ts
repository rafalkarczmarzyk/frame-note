import { useEffect, useMemo, useState } from 'react';
import type { Caption, ImageDimensions } from '../../domain/document';
import { LatestJob } from '../../lib/latest-job';
import { exportPhoto } from './render';

export interface ExportRequest {
  image: HTMLImageElement;
  dimensions: ImageDimensions;
  caption: Caption;
  text: string;
  color: string;
  quality: number;
}

export function usePreparedExport(request: ExportRequest, enabled: boolean) {
  const queue = useMemo(
    () =>
      new LatestJob<ExportRequest, Blob>(
        (input) =>
          exportPhoto(
            input.image,
            input.dimensions,
            input.caption,
            input.text,
            input.color,
            input.quality,
          ),
        450,
      ),
    [],
  );
  const [result, setResult] = useState<{
    request: ExportRequest;
    blob: Blob;
  } | null>(null);
  const [failure, setFailure] = useState<{
    request: ExportRequest;
    message: string;
  } | null>(null);
  useEffect(() => {
    if (enabled)
      queue.schedule(
        request,
        (blob) => setResult({ request, blob }),
        (error) =>
          setFailure({
            request,
            message:
              error instanceof Error
                ? error.message
                : 'Could not prepare export.',
          }),
      );
    return () => queue.cancel();
  }, [request, enabled, queue]);
  const blob = enabled && result?.request === request ? result.blob : null;
  const error = enabled && failure?.request === request ? failure.message : '';
  return { blob, error };
}
