import { expect, it, vi } from 'vitest';
import { exportRoll } from './export-roll';
import { defaultSessionDocument } from './session-document';
import type { SessionPhoto } from './session-state';
import { defaultExportMetadata } from '../caption/export-metadata';
import { exportPhotoCaptions } from '../caption/render';
import { loadPhoto } from './load-photo';

vi.mock('../caption/resolve-layout', () => ({ resolveLayout: () => [] }));
vi.mock('./load-photo', () => ({ loadPhoto: vi.fn() }));
vi.mock('../caption/render', async (original) => ({
  ...(await original<typeof import('../caption/render')>()),
  exportPhotoCaptions: vi.fn(),
}));

it.each(['jpg', 'png'] as const)(
  'keeps the initial %s format throughout a mixed-source ZIP and resolves duplicate names',
  async (format) => {
    const dispose = vi.fn();
    vi.mocked(loadPhoto).mockResolvedValue({
      image: {} as HTMLImageElement,
      document: {
        photo: { dimensions: { width: 2, height: 2 }, metadata: [] },
      },
      dispose,
    } as unknown as Awaited<ReturnType<typeof loadPhoto>>);
    const signature = format === 'png' ? [137, 80, 78, 71] : [255, 216];
    vi.mocked(exportPhotoCaptions).mockImplementation(
      async () => new Blob([new Uint8Array(signature)]),
    );
    const items: SessionPhoto[] = ['same.jpg', 'same.png'].map((name, id) => ({
      id: String(id),
      file: {} as File,
      thumbnailUrl: '',
      editor: defaultSessionDocument(),
      photo: {
        name,
        mimeType: name.endsWith('png') ? 'image/png' : 'image/jpeg',
        byteLength: 10,
        dimensions: { width: 2, height: 2 },
        metadata: [],
      },
    }));
    const options = {
      format,
      quality: 75,
      metadataOptions: defaultExportMetadata(),
    };
    const result = await exportRoll(
      items,
      options,
      new AbortController().signal,
      () => {
        // Changing the caller's selection after starting must not mix output formats.
        options.format = format === 'png' ? 'jpg' : 'png';
      },
    );
    expect(result.failures).toEqual([]);
    expect(result.completed).toBe(2);
    const bytes = new Uint8Array(await result.blob!.arrayBuffer());
    const view = new DataView(bytes.buffer);
    let offset = 0;
    const names = [];
    while (view.getUint32(offset, true) === 0x04034b50) {
      const size = view.getUint32(offset + 18, true);
      const length = view.getUint16(offset + 26, true);
      const start = offset + 30 + length;
      names.push(new TextDecoder().decode(bytes.slice(offset + 30, start)));
      expect([...bytes.slice(start, start + size)]).toEqual(signature);
      offset = start + size;
    }
    expect(names).toEqual([
      `same-framenote.${format}`,
      `same-framenote-2.${format}`,
    ]);
    expect(
      vi
        .mocked(exportPhotoCaptions)
        .mock.calls.slice(-2)
        .map((call) => call[4]),
    ).toEqual([format, format]);
    expect(dispose).toHaveBeenCalledTimes(2);
  },
);
