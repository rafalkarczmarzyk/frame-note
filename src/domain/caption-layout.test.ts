import { describe, expect, it } from 'vitest';
import { createCaption } from './document';
import {
  addCaption,
  containerCaption,
  createCaptionLayout,
  removeCaption,
  updateCaption,
} from './caption-layout';
import { toPixels } from './sizing';

const dimensions = { width: 2000, height: 1000 };
describe('multiple caption containers', () => {
  it('adds an empty container with an independent copy of the selected style and position', () => {
    const first = createCaptionLayout({
      ...createCaption(),
      template: '{author}',
    });
    const next = addCaption(first, 'second');
    expect(next.activeId).toBe('second');
    expect(next.containers[1]!.template).toBe('');
    next.containers[1]!.style.fontSize = 5;
    next.containers[1]!.position.anchor = 'top-right';
    expect(first.containers[0]!.style.fontSize).toBe(2);
    expect(first.containers[0]!.position.anchor).toBe('bottom-left');
  });
  it('duplicates content with a new identity', () => {
    const first = createCaptionLayout({
      ...createCaption(),
      template: '{author}',
    });
    const next = addCaption(first, 'copy', true);
    expect(next.containers[1]!.template).toBe('{author}');
    expect(next.containers[1]!.id).toBe('copy');
  });
  it('edits only the selected container', () => {
    const first = addCaption(createCaptionLayout(), 'second');
    const caption = containerCaption(first, first.containers[1]!);
    const next = updateCaption(
      first,
      'second',
      {
        ...caption,
        template: 'Second',
        style: { ...caption.style, color: '#ff0000' },
      },
      dimensions,
    );
    expect(next.containers[0]!).toEqual(first.containers[0]!);
    expect(next.containers[1]!.template).toBe('Second');
    expect(next.containers[1]!.style.color).toBe('#ff0000');
  });
  it('converts every container together while preserving pixel geometry', () => {
    const first = addCaption(createCaptionLayout(), 'second');
    const caption = containerCaption(first, first.containers[1]!);
    const next = updateCaption(
      first,
      'second',
      {
        ...caption,
        sizingUnit: 'px',
        style: { ...caption.style, fontSize: 20 },
        position: {
          ...caption.position,
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
        },
      },
      dimensions,
    );
    expect(next.sizingUnit).toBe('px');
    for (const item of next.containers) {
      expect(item.style.fontSize).toBe(20);
      expect(containerCaption(next, item).position.margins.left).toBe(30);
      expect(toPixels(item.style.fontSize, next.sizingUnit, dimensions)).toBe(
        20,
      );
    }
  });
  it('selects the next neighbor when deleting the active container', () => {
    const first = addCaption(
      addCaption(createCaptionLayout(), 'second'),
      'third',
    );
    const next = removeCaption({ ...first, activeId: 'second' }, 'second');
    expect(next.activeId).toBe('third');
    expect(next.containers.map((item) => item.id)).toEqual([
      'caption-1',
      'third',
    ]);
  });
  it('preserves selection when deleting another container', () => {
    expect(
      removeCaption(addCaption(createCaptionLayout(), 'second'), 'caption-1')
        .activeId,
    ).toBe('second');
  });
  it('supports an empty layout and adding again with the document unit', () => {
    const first = createCaptionLayout({ ...createCaption(), sizingUnit: 'px' });
    const empty = removeCaption(first, 'caption-1');
    expect(empty.containers).toEqual([]);
    expect(empty.activeId).toBeNull();
    const next = addCaption(empty, 'new', false, dimensions);
    expect(next.sizingUnit).toBe('px');
    expect(next.activeId).toBe('new');
    expect(next.containers[0]!.style.fontSize).toBe(20);
  });
  it('shares margins between containers without changing their anchors or styles', () => {
    const layout = addCaption(createCaptionLayout(), 'second');
    layout.containers[1]!.position.anchor = 'top-right';
    const caption = containerCaption(layout, layout.containers[0]!);
    const next = updateCaption(
      layout,
      '',
      {
        ...caption,
        position: {
          ...caption.position,
          margins: { top: 4, right: 5, bottom: 6, left: 7 },
          marginLinkMode: 'none',
        },
      },
      dimensions,
    );
    expect(next.containers).toEqual(layout.containers);
    for (const container of next.containers)
      expect(containerCaption(next, container).position.margins).toEqual({
        top: 4,
        right: 5,
        bottom: 6,
        left: 7,
      });
    expect(layout.margins.left).toBe(3);
  });
  it('retains global margins in an empty layout and when adding again', () => {
    const empty = removeCaption(createCaptionLayout(), 'caption-1');
    const defaults = createCaption();
    const next = updateCaption(
      empty,
      '',
      {
        ...defaults,
        position: {
          ...defaults.position,
          margins: { top: 5, right: 5, bottom: 5, left: 5 },
          marginLinkMode: 'all',
        },
      },
      dimensions,
    );
    const added = addCaption(next, 'new', false, dimensions);
    expect(added.margins.left).toBe(5);
    expect(
      containerCaption(added, added.containers[0]!).position.marginLinkMode,
    ).toBe('all');
  });
  it('places new containers counterclockwise, skipping occupied anchors', () => {
    let layout = createCaptionLayout();
    const expected = [
      'bottom-right',
      'top-right',
      'top-left',
      'center-left',
      'bottom-center',
      'center-right',
      'top-center',
      'center',
    ] as const;
    for (const [index, anchor] of expected.entries()) {
      layout = addCaption(layout, `new-${index}`);
      expect(layout.containers.at(-1)!.position.anchor).toBe(anchor);
    }
    const full = addCaption(layout, 'overflow');
    expect(full.containers.at(-1)!.position.anchor).toBe('center');
  });
  it('skips occupied positions and preserves the anchor when duplicating', () => {
    const first = addCaption(createCaptionLayout(), 'second');
    const next = addCaption({ ...first, activeId: 'caption-1' }, 'third');
    expect(next.containers.at(-1)!.position.anchor).toBe('top-right');
    const copy = addCaption(next, 'copy', true);
    expect(copy.containers.at(-1)!.position.anchor).toBe('top-right');
  });
  it('preserves custom positions through edits, unit conversion and duplication', () => {
    const caption = createCaption();
    caption.position.custom = { x: 42, y: 72 };
    const layout = createCaptionLayout(caption);
    const changed = updateCaption(
      layout,
      '',
      { ...caption, sizingUnit: 'px' },
      dimensions,
    );
    expect(changed.containers[0]!.position.custom).toEqual({ x: 42, y: 72 });
    const duplicate = addCaption(changed, 'copy', true);
    expect(duplicate.containers[1]!.position.custom).toEqual({ x: 42, y: 72 });
    expect(
      addCaption(changed, 'new').containers[1]!.position.custom,
    ).toBeUndefined();
  });
});
