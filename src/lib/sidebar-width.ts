export const sidebarWidth = { default: 384, min: 320, max: 560 };
const key = 'framenote.sidebar.width.v1';
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;

export function clampSidebarWidth(value: number) {
  return Number.isFinite(value)
    ? Math.min(sidebarWidth.max, Math.max(sidebarWidth.min, value))
    : sidebarWidth.default;
}
export function readSidebarWidth(storage: StorageAccess) {
  try {
    const value = storage.getItem(key);
    return value === null || value.trim() === ''
      ? sidebarWidth.default
      : clampSidebarWidth(Number(value));
  } catch {
    return sidebarWidth.default;
  }
}
export function saveSidebarWidth(storage: StorageAccess, value: number) {
  try {
    storage.setItem(key, String(clampSidebarWidth(value)));
  } catch {
    /* Resizing still works without storage. */
  }
}
