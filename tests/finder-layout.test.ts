import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error The packaging helper is plain JavaScript.
import { applyFinderLayout } from '../scripts/finder-layout.mjs';
const busy = () =>
  Object.assign(Error('Finder busy'), {
    stderr: 'Finder got an error: The Finder is busy. (-15260)',
  });
afterEach(() => vi.restoreAllMocks());
describe('DMG Finder layout retries', () => {
  it('recovers from a transient busy error with bounded backoff', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const run = vi
      .fn()
      .mockRejectedValueOnce(busy())
      .mockRejectedValueOnce(busy())
      .mockResolvedValue('ready');
    const pause = vi.fn().mockResolvedValue(undefined);
    await expect(applyFinderLayout(run, pause)).resolves.toBe('ready');
    expect(run).toHaveBeenCalledTimes(3);
    expect(pause.mock.calls).toEqual([[1000], [2000]]);
  });
  it('does not retry permission errors or AppleScript bugs', async () => {
    const error = Object.assign(Error('Denied'), {
      stderr: 'Not authorized. (-1743)',
    });
    const run = vi.fn().mockRejectedValue(error),
      pause = vi.fn();
    await expect(applyFinderLayout(run, pause)).rejects.toBe(error);
    expect(run).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
  });
  it('stops after five busy attempts and propagates the failure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = busy(),
      run = vi.fn().mockRejectedValue(error),
      pause = vi.fn().mockResolvedValue(undefined);
    await expect(applyFinderLayout(run, pause)).rejects.toBe(error);
    expect(run).toHaveBeenCalledTimes(5);
    expect(pause).toHaveBeenCalledTimes(4);
  });
});
