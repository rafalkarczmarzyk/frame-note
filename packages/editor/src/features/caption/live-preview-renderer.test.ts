import { expect, it } from 'vitest';
import { createCaption } from '../../../../core/src/document';
import { previewContentKey } from './live-preview-renderer';

it('reuses content for placement, backdrop and blend changes while invalidating visual content', () => {
  const dimensions = { width: 1200, height: 800 };
  const caption = createCaption();
  caption.style.textAlign = 'left';
  const item = { caption, text: 'One\nTwo', color: '#ffffff' };
  const key = previewContentKey(item, dimensions);
  const moved = structuredClone(item);
  moved.caption.position.custom = { x: 42, y: 68 };
  moved.caption.position.anchor = 'bottom-right';
  moved.caption.blending = { mode: 'screen', opacity: 0.5 };
  expect(previewContentKey(moved, dimensions)).toBe(key);
  moved.text = 'Changed';
  expect(previewContentKey(moved, dimensions)).not.toBe(key);
  expect(previewContentKey(item, { width: 2400, height: 1600 })).not.toBe(key);
  const style = structuredClone(item);
  style.caption.style.fontSize += 1;
  expect(previewContentKey(style, dimensions)).not.toBe(key);
  const auto = structuredClone(item);
  auto.caption.style.textAlign = 'auto';
  const before = previewContentKey(auto, dimensions);
  auto.caption.position.anchor = 'top-right';
  expect(previewContentKey(auto, dimensions)).not.toBe(before);
});
