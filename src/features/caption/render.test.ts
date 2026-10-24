import { expect, it } from 'vitest';
import { createCaption } from '../../domain/document';
import { captionConfig, exportName } from './render';
it('scales text and margins with original dimensions, including fractions', () => {
  const caption = createCaption();
  const a = captionConfig(
    { width: 6000, height: 4000 },
    caption,
    'one\ntwo',
    'test-color',
  );
  const b = captionConfig(
    { width: 3000, height: 2000 },
    caption,
    'one\ntwo',
    'test-color',
  );
  expect(a.fontSize).toBeCloseTo(54);
  expect(a.x).toBe(b.x * 2);
  expect(a.y).toBe(b.y * 2);
  expect(a.fill).toBe('test-color');
});
it('exports a distinct JPEG filename', () => {
  expect(exportName('photo.JPEG')).toBe('photo-framenote.jpg');
});
