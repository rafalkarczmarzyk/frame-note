import { expect, it } from 'vitest';
import { isJpeg, normalizeMetadata } from './metadata';

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
