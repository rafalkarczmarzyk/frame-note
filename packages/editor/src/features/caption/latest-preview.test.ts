import { expect, it, vi } from 'vitest';
import { LatestPreview } from './latest-preview';

it('serializes work and settles skipped requests with only the latest one pending', async () => {
  const finish: Array<(value: number) => void> = [];
  const render = vi.fn(
    () => new Promise<number>((resolve) => finish.push(resolve)),
  );
  const queue = new LatestPreview<number, number>(render, vi.fn());
  const first = queue.request(1);
  const skipped = queue.request(2);
  const latest = queue.request(3);
  expect(render.mock.calls).toHaveLength(1);
  await expect(skipped).resolves.toBeUndefined();
  finish[0]!(10);
  await expect(first).resolves.toBe(10);
  expect(render.mock.calls).toHaveLength(2);
  finish[1]!(30);
  await expect(latest).resolves.toBe(30);
  queue.dispose();
});
it('releases an in-flight result and settles pending callers when its photo closes', async () => {
  let finish!: (result: number) => void;
  const release = vi.fn();
  const queue = new LatestPreview<number, number>(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    release,
  );
  const running = queue.request(1),
    pending = queue.request(2);
  queue.dispose();
  finish(10);
  await expect(running).resolves.toBeUndefined();
  await expect(pending).resolves.toBeUndefined();
  await expect(queue.request(3)).resolves.toBeUndefined();
  expect(release).toHaveBeenCalledExactlyOnceWith(10);
});
it('continues after a failed render instead of leaving newer positions stuck', async () => {
  const error = Error('bad image');
  const render = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(2);
  const queue = new LatestPreview<number, number>(render, vi.fn());
  const first = queue.request(1),
    second = queue.request(2);
  await expect(first).rejects.toBe(error);
  await expect(second).resolves.toBe(2);
  queue.dispose();
});
