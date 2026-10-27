import { StoredZip, uniqueExportName } from '@/lib/stored-zip';
import { resolveLayout } from '@/features/caption/resolve-layout';
import { exportPhotoCaptions, exportName } from '@/features/caption/render';
import {
  addExportMetadata,
  type ExportMetadataOptions,
} from '@/features/caption/export-metadata';
import { loadPhoto } from './load-photo';
import type { SessionPhoto } from './session-state';

export interface RollExportOptions {
  quality: number;
  metadataOptions: ExportMetadataOptions;
}

export function rollWarnings(items: readonly SessionPhoto[]) {
  return items.flatMap((item) => {
    const captions = resolveLayout(
      item.editor.layout,
      item.photo.metadata,
      item.editor.icons,
    );
    const missing = [
      ...new Set(captions.flatMap((caption) => caption.missing)),
    ];
    const invalid = captions.some((caption) => caption.invalidSyntax);
    return missing.length || invalid
      ? [
          `${item.photo.name}: ${[invalid ? 'invalid tokens' : '', missing.length ? `missing ${missing.join(', ')}` : ''].filter(Boolean).join('; ')}`,
        ]
      : [];
  });
}

export async function exportRoll(
  items: readonly SessionPhoto[],
  options: RollExportOptions,
  signal: AbortSignal,
  onProgress: (completed: number, name: string) => void,
) {
  const zip = new StoredZip();
  const names = new Set<string>();
  const failures: string[] = [];
  let completed = 0;
  for (const [index, item] of items.entries()) {
    signal.throwIfAborted();
    onProgress(index, item.photo.name);
    let loaded: Awaited<ReturnType<typeof loadPhoto>> | undefined;
    try {
      loaded = await loadPhoto(item.file, { preview: false });
      signal.throwIfAborted();
      const captions = resolveLayout(
        item.editor.layout,
        loaded.document.photo.metadata,
        item.editor.icons,
      );
      const image = await exportPhotoCaptions(
        loaded.image,
        loaded.document.photo.dimensions,
        captions,
        options.quality,
      );
      signal.throwIfAborted();
      const blob = await addExportMetadata(
        image,
        loaded.document.photo.metadata,
        options.metadataOptions,
      );
      await zip.add(
        uniqueExportName(exportName(item.photo.name), names),
        blob,
        signal,
      );
      completed++;
    } catch (cause) {
      signal.throwIfAborted();
      failures.push(
        `${item.photo.name}: ${cause instanceof Error ? cause.message : 'Export failed.'}`,
      );
    } finally {
      loaded?.dispose();
    }
    // Let progress/cancel paint between full-resolution images.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  signal.throwIfAborted();
  return { blob: completed ? zip.finish() : null, failures, completed };
}
