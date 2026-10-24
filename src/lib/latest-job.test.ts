import { afterEach, expect, it, vi } from 'vitest';
import { LatestJob } from './latest-job';
afterEach(() => vi.useRealTimers());
it('debounces rapid edits and only runs the newest request', async () => {
  vi.useFakeTimers();
  const run = vi.fn(async (value: number) => value);
  const success = vi.fn();
  const queue = new LatestJob(run, 450);
  queue.schedule(1, success, vi.fn());
  queue.schedule(2, success, vi.fn());
  await vi.advanceTimersByTimeAsync(449);
  expect(run).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  expect(run).toHaveBeenCalledExactlyOnceWith(2);
  expect(success).toHaveBeenCalledExactlyOnceWith(2);
});
it('serializes encoding and discards an outdated result', async () => {
  vi.useFakeTimers();
  let resolve: (value: number) => void = () => {};
  const run = vi.fn((value: number) =>
    value === 1
      ? new Promise<number>((done) => {
          resolve = done;
        })
      : Promise.resolve(value),
  );
  const success = vi.fn();
  const failure = vi.fn();
  const queue = new LatestJob(run, 10);
  queue.schedule(1, success, failure);
  await vi.advanceTimersByTimeAsync(10);
  queue.schedule(2, success, failure);
  await vi.advanceTimersByTimeAsync(10);
  expect(run).toHaveBeenCalledTimes(1);
  resolve(1);
  await vi.advanceTimersByTimeAsync(0);
  expect(success).toHaveBeenCalledExactlyOnceWith(2);
  expect(run).toHaveBeenCalledTimes(2);
});
it('ignores canceled errors and remains usable after a failure', async () => {
  vi.useFakeTimers();
  const failure = vi.fn();
  const success = vi.fn();
  const queue = new LatestJob(async (value: number) => {
    if (value === 1) throw new Error('encode');
    return value;
  }, 10);
  queue.schedule(1, success, failure);
  await vi.advanceTimersByTimeAsync(10);
  expect(failure).toHaveBeenCalledTimes(1);
  queue.schedule(2, success, failure);
  queue.cancel();
  await vi.advanceTimersByTimeAsync(10);
  expect(success).not.toHaveBeenCalled();
  queue.schedule(3, success, failure);
  await vi.advanceTimersByTimeAsync(10);
  expect(success).toHaveBeenCalledWith(3);
});
