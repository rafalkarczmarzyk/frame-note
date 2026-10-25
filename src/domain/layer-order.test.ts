import { expect, it } from 'vitest';
import {
  createCaptionLayout,
  addCaption,
  moveLayer,
  toggleLayerVisibility,
} from './caption-layout';
import { createPreset, parsePreset } from './presets';

it('moves front-to-back list positions without changing selection or geometry', () => {
  const first = createCaptionLayout();
  const layout = addCaption(first, 'second');
  const moved = moveLayer(layout, 'second', 1);
  expect(moved.containers.map((item) => item.id)).toEqual([
    'second',
    'caption-1',
  ]);
  expect(moved.activeId).toBe('second');
  expect(moved.containers[0]).toEqual(layout.containers[1]);
  expect(moveLayer(layout, 'absent', 1)).toBe(layout);
  expect(moveLayer(layout, 'second', -1)).toBe(layout);
});
it('round trips hidden state and stacking in presets; absent visibility remains visible', () => {
  const layout = toggleLayerVisibility(
    addCaption(createCaptionLayout(), 'second'),
    'second',
  );
  expect(layout.containers[1]?.visible).toBe(false);
  const preset = createPreset('id', 'Layers', layout, []);
  const validate = (name: string, svg: string) => ({ name, svg, aspect: 1 });
  const restored = parsePreset(JSON.stringify(preset), validate);
  expect(restored.layout).toEqual(layout);
  expect(restored.layout.containers[0]?.visible).not.toBe(false);
  expect(toggleLayerVisibility(layout, 'second').containers[1]?.visible).toBe(
    true,
  );
  const fresh = addCaption(layout, 'third');
  expect(fresh.containers[2]?.visible).toBe(true);
  const invalid = structuredClone(preset);
  Object.assign(invalid.layout.containers[0]!, { visible: 'false' });
  expect(() => parsePreset(JSON.stringify(invalid), validate)).toThrow();
});
