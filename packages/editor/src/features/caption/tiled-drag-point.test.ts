import { describe, expect, it, vi } from 'vitest';
import Konva from 'konva';
import { tiledDragPoint } from './tiled-drag-point';
import {
  defaultTiledPosition,
  offsetTiled,
} from '../../../../core/src/tiled-watermark';

describe('Tiled pointer coordinates', () => {
  it.each([0.167, 1, 2])(
    'keeps the offset through repeated events and reversals at zoom %s',
    (scale) => {
      const photo = new Konva.Group({
        x: -120,
        y: 80,
        scaleX: scale,
        scaleY: scale,
      });
      const moving = new Konva.Group();
      photo.add(moving);
      const pointer = { x: 300, y: 250 };
      const stage = {
        getPointerPosition: () => pointer,
        _getPointerById: () => pointer,
        batchDraw() {},
      };
      vi.spyOn(photo, 'getStage').mockReturnValue(
        stage as unknown as Konva.Stage,
      );
      const initial = tiledDragPoint(moving)!;
      const origin = moving.getAbsolutePosition();
      const drag = {
        pointerId: 1,
        offset: { x: pointer.x - origin.x, y: pointer.y - origin.y },
      };
      const tiled = { ...defaultTiledPosition(), offset: { x: 5, y: -2 } };
      const results = [];
      for (const dx of [80, 80, 80, 40, 0, -40, -40]) {
        pointer.x = 300 + dx;
        moving._setDragPosition({}, drag);
        const point = tiledDragPoint(moving)!;
        moving.position({ x: 0, y: 0 });
        results.push(
          offsetTiled(
            tiled,
            { x: point.x - initial.x, y: point.y - initial.y },
            { width: 6000, height: 4000 },
          ).offset,
        );
      }
      expect(results[0]!.x).toBeCloseTo(5 + 80 / scale / 40);
      expect(results[1]).toEqual(results[0]);
      expect(results[2]).toEqual(results[0]);
      expect(results[3]!.x).toBeCloseTo(5 + 40 / scale / 40);
      expect(results[4]!.x).toBeCloseTo(5);
      expect(results[5]!.x).toBeCloseTo(5 - 40 / scale / 40);
      expect(results[6]).toEqual(results[5]);
      expect(results.every((p) => p.y === -2)).toBe(true);
      photo.destroy();
    },
  );
  it('does not invent an origin without an active pointer', () => {
    const photo = new Konva.Group();
    const moving = new Konva.Group();
    photo.add(moving);
    vi.spyOn(photo, 'getStage').mockReturnValue({
      getPointerPosition: () => null,
      batchDraw() {},
    } as unknown as Konva.Stage);
    expect(tiledDragPoint(moving)).toBeNull();
    photo.destroy();
  });
});
