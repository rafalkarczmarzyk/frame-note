import { afterEach, expect, it, vi } from 'vitest';
import type Konva from 'konva';
import { createCaption } from '../../../../core/src/document';
import { createGlassLayerBackground } from '../../../../core/src/layer-background';
import { defaultTiledPosition } from '../../../../core/src/tiled-watermark';
import * as background from './background-render';
import { tiledBackground } from './tiled-background';

afterEach(() => vi.restoreAllMocks());
it('keeps a background inside motif-local bounds even when content has an anchored photo position', () => {
  const caption = createCaption();
  caption.background = createGlassLayerBackground();
  caption.position.tiled = defaultTiledPosition();
  let visible = false;
  vi.spyOn(background, 'renderBackgroundTile').mockImplementation(
    (content, _caption, dimensions) => {
      // The real renderer clips against this local canvas. Photo-space x/y would clip it away.
      visible =
        content.x >= 0 &&
        content.y >= 0 &&
        content.x + content.width <= dimensions.width &&
        content.y + content.height <= dimensions.height;
      return null;
    },
  );
  const anchored = { x: 3500, y: 2800, width: 200, height: 40 };
  tiledBackground(
    {} as Konva.Layer,
    { width: 6000, height: 4000 },
    caption,
    anchored,
    { x: 3000, y: 2000 },
  );
  expect(visible).toBe(true);
});
