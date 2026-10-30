// ZIP store method: JPG is already compressed, so keep blobs without recompressing.
// Classic ZIP headers are little-endian. UTF-8 names use general-purpose bit 11.
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++)
    value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

function header(size: number) {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

export class StoredZip {
  private parts: BlobPart[] = [];
  private entries: {
    name: Uint8Array<ArrayBuffer>;
    size: number;
    crc: number;
    offset: number;
  }[] = [];
  private size = 0;

  async add(name: string, blob: Blob, signal?: AbortSignal) {
    signal?.throwIfAborted();
    const encoded = new TextEncoder().encode(name);
    // Bound retained output blobs; decoded photos are released after each entry.
    if (this.size + blob.size + encoded.length + 30 > 1_000_000_000)
      throw Error(
        'The ZIP would exceed 1 GB. Export a smaller roll or reduce JPEG quality.',
      );
    if (encoded.length > 65535 || this.entries.length >= 65535)
      throw Error(
        'The ZIP contains too many files or a file name is too long.',
      );
    let crc = 0xffffffff;
    for (let offset = 0; offset < blob.size; offset += 1_048_576) {
      signal?.throwIfAborted();
      const chunk = new Uint8Array(
        await blob.slice(offset, offset + 1_048_576).arrayBuffer(),
      );
      for (const byte of chunk)
        crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255]!;
    }
    signal?.throwIfAborted();
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = header(30);
    local.view.setUint32(0, 0x04034b50, true);
    local.view.setUint16(4, 20, true);
    local.view.setUint16(6, 0x0800, true);
    local.view.setUint16(12, 0x0021, true); // 1980-01-01, valid minimum DOS date.
    local.view.setUint32(14, crc, true);
    local.view.setUint32(18, blob.size, true);
    local.view.setUint32(22, blob.size, true);
    local.view.setUint16(26, encoded.length, true);
    this.entries.push({
      name: encoded,
      size: blob.size,
      crc,
      offset: this.size,
    });
    this.parts.push(local.bytes, encoded, blob);
    this.size += 30 + encoded.length + blob.size;
  }

  finish(): Blob {
    const central: BlobPart[] = [];
    let centralSize = 0;
    for (const entry of this.entries) {
      const record = header(46);
      record.view.setUint32(0, 0x02014b50, true);
      record.view.setUint16(4, 20, true);
      record.view.setUint16(6, 20, true);
      record.view.setUint16(8, 0x0800, true);
      record.view.setUint16(14, 0x0021, true);
      record.view.setUint32(16, entry.crc, true);
      record.view.setUint32(20, entry.size, true);
      record.view.setUint32(24, entry.size, true);
      record.view.setUint16(28, entry.name.length, true);
      record.view.setUint32(42, entry.offset, true);
      central.push(record.bytes, entry.name);
      centralSize += 46 + entry.name.length;
    }
    const end = header(22);
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(8, this.entries.length, true);
    end.view.setUint16(10, this.entries.length, true);
    end.view.setUint32(12, centralSize, true);
    end.view.setUint32(16, this.size, true);
    return new Blob([...this.parts, ...central, end.bytes], {
      type: 'application/zip',
    });
  }
}

export function uniqueExportName(name: string, used: Set<string>): string {
  const safe = Array.from(name, (character) =>
    character.charCodeAt(0) < 32 ||
    character.charCodeAt(0) === 127 ||
    /[\\/:*?"<>|]/u.test(character)
      ? '_'
      : character,
  ).join('');
  const stem = safe.replace(/\.jpg$/iu, '');
  let candidate = safe;
  let suffix = 2;
  while (used.has(candidate.toLocaleLowerCase('en-US')))
    candidate = `${stem}-${suffix++}.jpg`;
  used.add(candidate.toLocaleLowerCase('en-US'));
  return candidate;
}
