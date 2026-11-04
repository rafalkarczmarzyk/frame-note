/** Technical launch state belongs to the profile, never the editable config. */
export const startupAboutVersionKey = 'framenote.about-shown-version';
export function createStartupAbout(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  version: string,
) {
  let pending = true;
  try {
    pending = storage.getItem(startupAboutVersionKey) !== version;
  } catch {
    /* An unavailable profile must not block startup. */
  }
  return {
    get show() {
      return pending;
    },
    markShown() {
      pending = false;
      try {
        storage.setItem(startupAboutVersionKey, version);
      } catch {
        /* Suppress repeats in this launch even if persistence is unavailable. */
      }
    },
  };
}
