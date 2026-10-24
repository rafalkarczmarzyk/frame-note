import { describe, expect, it } from 'vitest';
import { createPhotoDocument, type Photo } from './document';

function photo(): Photo {
  return {
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    byteLength: 1024,
    dimensions: { width: 5964, height: 3976 },
    metadata: [],
  };
}

describe('photo document', () => {
  it('keeps fractional font sizing independent of photo resolution', () => {
    const original = createPhotoDocument(photo());
    const cropped = createPhotoDocument({
      ...photo(),
      dimensions: { width: 3000, height: 2000 },
    });
    expect(original.caption.style.fontSize).toBe(1.35);
    expect(cropped.caption).toEqual(original.caption);
  });
  it('does not share mutable caption settings between documents', () => {
    const first = createPhotoDocument(photo());
    const second = createPhotoDocument(photo());
    first.caption.position.margins.left = 8;
    expect(second.caption.position.margins.left).toBe(3);
  });
  it('does not mutate the input photo dimensions', () => {
    const input = photo();
    const document = createPhotoDocument(input);
    document.photo.dimensions.width = 100;
    expect(input.dimensions.width).toBe(5964);
  });
  it.each([0, -1, 1.5, NaN, Infinity])(
    'rejects invalid dimensions %s',
    (width) => {
      expect(() =>
        createPhotoDocument({
          ...photo(),
          dimensions: { width, height: 2000 },
        }),
      ).toThrow();
    },
  );
  it('rejects an empty file', () => {
    expect(() => createPhotoDocument({ ...photo(), byteLength: 0 })).toThrow();
  });
});
