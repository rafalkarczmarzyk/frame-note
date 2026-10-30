/** Decimal units, matching the file-size convention used by macOS Finder. */
export function formatBytes(bytes: number): string {
  if (!Number.isSafeInteger(bytes) || bytes < 0)
    throw new Error('Invalid byte count.');
  if (bytes < 1000) return `${bytes} B`;
  const unit = bytes < 1_000_000 ? 'kB' : bytes < 1_000_000_000 ? 'MB' : 'GB';
  const divisor =
    unit === 'kB' ? 1000 : unit === 'MB' ? 1_000_000 : 1_000_000_000;
  return `${(bytes / divisor).toFixed(2)} ${unit}`;
}
