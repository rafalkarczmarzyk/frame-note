import { expect, it } from 'vitest';
import { createCaption, resolvedTextAlign } from '../../../core/src/document';
import { anchors } from '../features/caption/layout';

it.each(anchors)('Auto follows %s in Anchor and Manual modes', (anchor) => {
  const caption = createCaption();
  expect(caption.style.textAlign).toBe('auto');
  caption.position.anchor = anchor;
  const expected = anchor.endsWith('left')
    ? 'left'
    : anchor.endsWith('right')
      ? 'right'
      : 'center';
  expect(resolvedTextAlign(caption)).toBe(expected);
  caption.position.custom = { x: 35, y: 60 };
  expect(resolvedTextAlign(caption)).toBe(expected);
});

it.each(['left', 'center', 'right'] as const)(
  'explicit %s stays fixed across anchors',
  (alignment) => {
    const caption = createCaption();
    caption.style.textAlign = alignment;
    for (const anchor of anchors) {
      caption.position.anchor = anchor;
      expect(resolvedTextAlign(caption)).toBe(alignment);
    }
  },
);
