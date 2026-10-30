import { afterEach, expect, it, vi } from 'vitest';
import { browserPlatform, configurePlatform, platform } from './platform';
afterEach(() => {
  configurePlatform(browserPlatform);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('propagates save failures instead of reporting success', async () => {
  const saveFile = vi.fn().mockRejectedValue(new Error('Disk full'));
  configurePlatform({ saveFile, storage: browserPlatform.storage });
  await expect(
    platform().saveFile(new Blob(['photo']), 'photo.jpg'),
  ).rejects.toThrow('Disk full');
  expect(saveFile).toHaveBeenCalledOnce();
});
it('starts a browser download and revokes its object URL after delivery', async () => {
  vi.useFakeTimers();
  const link = { href: '', download: '', click: vi.fn() };
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('document', { createElement: () => link });
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:output',
    revokeObjectURL,
  });
  await browserPlatform.saveFile(new Blob(['photo']), 'photo.jpg');
  expect(link.download).toBe('photo.jpg');
  expect(link.click).toHaveBeenCalledOnce();
  expect(revokeObjectURL).not.toHaveBeenCalled();
  vi.runAllTimers();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:output');
});
