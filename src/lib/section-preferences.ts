type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;
const prefix = 'framenote.sidebar.v1.';

export function readSectionOpen(
  storage: PreferenceStorage,
  id: string,
  fallback: boolean,
): boolean {
  try {
    const value = storage.getItem(prefix + id);
    return value === 'true' ? true : value === 'false' ? false : fallback;
  } catch {
    return fallback;
  }
}

export function saveSectionOpen(
  storage: PreferenceStorage,
  id: string,
  open: boolean,
): void {
  try {
    storage.setItem(prefix + id, String(open));
  } catch {
    /* Storage may be unavailable; the UI still works. */
  }
}
