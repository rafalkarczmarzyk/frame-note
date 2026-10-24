import { expect, it } from 'vitest';
import { exportName } from './render';
it('exports a distinct JPEG filename', () => {
  expect(exportName('photo.JPEG')).toBe('photo-framenote.jpg');
});
