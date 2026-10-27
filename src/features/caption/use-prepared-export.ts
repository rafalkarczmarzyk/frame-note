import type { MetadataField } from '@/domain/metadata';
import {
  addExportMetadata,
  type ExportMetadataOptions,
} from './export-metadata';
import { useEffect, useMemo, useState } from 'react';
import type { ImageDimensions } from '../../domain/document';
import { LatestJob } from '../../lib/latest-job';
import { exportPhotoCaptions, type RenderedCaption } from './render';

export interface ExportRequest {
  image: HTMLImageElement;
  dimensions: ImageDimensions;
  captions: readonly RenderedCaption[];
  quality: number;
  metadata: readonly MetadataField[];
  metadataOptions: ExportMetadataOptions;
}

export function usePreparedExport(
  request: ExportRequest | null,
  enabled: boolean,
) {
  const queue = useMemo(
    () =>
      new LatestJob<ExportRequest, Blob>(
        async (input) =>
          addExportMetadata(
            await exportPhotoCaptions(
              input.image,
              input.dimensions,
              input.captions,
              input.quality,
            ),
            input.metadata,
            input.metadataOptions,
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
  // Closing a session also releases its retained encoded result.
  if (!request && result) setResult(null);
  if (!request && failure) setFailure(null);
  useEffect(() => {
    if (enabled && request)
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
