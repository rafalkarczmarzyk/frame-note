import { expect, it } from 'vitest';
import { exportName } from './render';
it('exports a distinct JPEG filename', () => {
  expect(exportName('photo.JPEG')).toBe('photo-framenote.jpg');
  expect(exportName('photo.png')).toBe('photo-framenote.jpg');
});

it('uses the selected extension for PNG output', () => {
  expect(exportName('photo.JPEG', 'png')).toBe('photo-framenote.png');
  expect(exportName('photo.PNG', 'png')).toBe('photo-framenote.png');
});
