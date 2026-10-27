import { describe, expect, it } from 'vitest';
import { StoredZip, uniqueExportName } from './stored-zip';

function localEntries(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer);
  const entries = [];
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const start = offset + 30 + nameLength;
    entries.push({
      name: new TextDecoder().decode(bytes.slice(offset + 30, start)),
      content: new TextDecoder().decode(bytes.slice(start, start + size)),
      crc: view.getUint32(offset + 14, true),
      offset,
    });
    expect(view.getUint16(offset + 6, true)).toBe(0x0800);
    expect(view.getUint16(offset + 8, true)).toBe(0);
    offset = start + size;
  }
  return { entries, centralOffset: offset };
}

describe('stored ZIP', () => {
  it('writes UTF-8 names, CRCs, data and matching central-directory offsets', async () => {
    const zip = new StoredZip();
    await zip.add('żółw.jpg', new Blob(['123456789']));
    await zip.add('empty.jpg', new Blob([]));
    const bytes = new Uint8Array(await zip.finish().arrayBuffer());
    const view = new DataView(bytes.buffer);
    const { entries, centralOffset } = localEntries(bytes);
    expect(entries).toMatchObject([
      { name: 'żółw.jpg', content: '123456789', crc: 0xcbf43926 },
      { name: 'empty.jpg', content: '', crc: 0 },
    ]);
    let offset = centralOffset;
    for (const entry of entries) {
      expect(view.getUint32(offset, true)).toBe(0x02014b50);
      expect(view.getUint32(offset + 42, true)).toBe(entry.offset);
      expect(view.getUint32(offset + 16, true)).toBe(entry.crc);
      offset += 46 + view.getUint16(offset + 28, true);
    }
    expect(view.getUint32(offset, true)).toBe(0x06054b50);
    expect(view.getUint16(offset + 10, true)).toBe(2);
    expect(view.getUint32(offset + 16, true)).toBe(centralOffset);
    expect(view.getUint32(offset + 12, true)).toBe(offset - centralOffset);
  });
  it('does not append cancelled entries and can still finish previous entries', async () => {
    const zip = new StoredZip();
    await zip.add('one.jpg', new Blob(['one']));
    const controller = new AbortController();
    controller.abort();
    await expect(
      zip.add('two.jpg', new Blob(['two']), controller.signal),
    ).rejects.toThrow();
    const { entries } = localEntries(
      new Uint8Array(await zip.finish().arrayBuffer()),
    );
    expect(entries.map((entry) => entry.name)).toEqual(['one.jpg']);
  });
  it('sanitizes unsafe names and resolves collisions case-insensitively', () => {
    const used = new Set<string>();
    expect(uniqueExportName('photo.jpg', used)).toBe('photo.jpg');
    expect(uniqueExportName('PHOTO.jpg', used)).toBe('PHOTO-2.jpg');
    expect(uniqueExportName('photo-2.jpg', used)).toBe('photo-2-2.jpg');
    expect(uniqueExportName('../a\\b\u0000.jpg', used)).toBe('.._a_b_.jpg');
  });
});
