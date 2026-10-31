import { setTimeout } from 'node:timers/promises';
import console from 'node:console';

/** Finder may still be registering a newly mounted volume. Retry only its busy error. */
export async function applyFinderLayout(run, pause = setTimeout) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (attempt === 5 || !/\(-15260\)/u.test(String(error?.stderr ?? '')))
        throw error;
      console.warn(`Finder is busy; retrying DMG layout (${attempt + 1}/5)…`);
      await pause(attempt * 1000);
    }
  }
}
