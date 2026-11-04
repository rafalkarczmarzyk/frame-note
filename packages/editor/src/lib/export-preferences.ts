import { platform } from './platform';
const key = 'framenote.export-quality';
export function readExportQuality(): number {
  if (platform().configuration)
    return platform().configuration!.current().exportQuality;
  try {
    const value = Number(platform().storage.getItem(key));
    return Number.isInteger(value) && value >= 1 && value <= 100 ? value : 95;
  } catch {
    return 95;
  }
}
export function storeExportQuality(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 100) return;
  if (platform().configuration) {
    void platform()
      .configuration!.save({ exportQuality: value })
      .catch(() => {});
    return;
  }
  try {
    platform().storage.setItem(key, String(value));
  } catch {
    /* Preferences may be unavailable; editing remains usable. */
  }
}

export function readRemoveMetadata(): boolean {
  return platform().configuration?.current().removeMetadata ?? true;
}
export function storeRemoveMetadata(removeMetadata: boolean): void {
  void platform()
    .configuration?.save({ removeMetadata })
    .catch(() => {});
}
