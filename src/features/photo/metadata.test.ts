import { expect, it } from 'vitest';
import {
  imageType,
  isJpeg,
  normalizeMetadata,
  pngDimensions,
} from './metadata';

it('keeps groups, raw values and user comments without restricting tag names', () => {
  const fields = normalizeMetadata({
    exif: {
      UserComment: { value: [65], description: 'Stacked from 49 images.' },
      ISO: { value: 400, description: 400 },
    },
    xmp: { ISO: { value: '400', description: '400' } },
  });
  expect(fields.map((field) => field.key)).toEqual([
    'exif:ISO',
    'exif:UserComment',
    'xmp:ISO',
  ]);
  expect(fields[1]?.displayValue).toBe('Stacked from 49 images.');
  expect(fields[0]?.rawValue).toBe(400);
});
it('ignores structural data rather than exposing thumbnail bytes as fields', () => {
  expect(
    normalizeMetadata({
      Thumbnail: { image: { value: [1] } },
      exif: { pointer: null },
    }),
  ).toEqual([]);
});
it('recognizes JPEG bytes independently of the filename', () => {
  expect(isJpeg(new Uint8Array([255, 216, 255, 224]))).toBe(true);
  expect(isJpeg(new Uint8Array([137, 80, 78, 71]))).toBe(false);
  expect(isJpeg(new Uint8Array())).toBe(false);
});
it('recognizes PNG signatures and reads IHDR dimensions before decoding', () => {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  new DataView(bytes.buffer).setUint32(16, 1200);
  new DataView(bytes.buffer).setUint32(20, 800);
  expect(imageType(bytes)).toBe('image/png');
  expect(pngDimensions(bytes)).toEqual({ width: 1200, height: 800 });
  expect(pngDimensions(bytes.subarray(0, 20))).toBeNull();
  expect(imageType(new Uint8Array([137, 80, 78, 71]))).toBeNull();
});
