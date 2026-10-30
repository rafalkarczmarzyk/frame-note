import { describe, expect, it } from 'vitest';
import { createCaption } from '../../../../core/src/document';
import { convertSizing } from '../../../../core/src/sizing';
import {
  createCaptionLayout,
  addLogo,
  addCaption,
  containerCaption,
  updateCaption,
} from '../../../../core/src/caption-layout';
import { logoLayout } from './logo-layout';
const dimensions = { width: 2000, height: 1000 };
const asset = { name: 'logo.svg', svg: '<svg/>', aspect: 2 };

describe('standalone SVG logo', () => {
  it('starts with a proportional size in the shared document unit and a free anchor', () => {
    const layout = addLogo(createCaptionLayout(), 'logo', asset, dimensions);
    const caption = containerCaption(layout, layout.containers[1]!);
    expect(caption.logo?.width).toBe(15);
    expect(caption.position.anchor).toBe('bottom-right');
    expect(logoLayout(dimensions, caption)).toEqual({
      width: 150,
      height: 75,
      x: 1820,
      y: 895,
    });
  });
  it('preserves pixel dimensions on unit conversion', () => {
    const caption = {
      ...createCaption(),
      logo: { asset, width: 15, colorMode: 'original' as const },
    };
    expect(convertSizing(caption, 'px', dimensions).logo?.width).toBe(150);
    expect(
      logoLayout(dimensions, convertSizing(caption, 'px', dimensions)),
    ).toEqual(logoLayout(dimensions, caption));
  });
  it('uses the full image reference in Custom independently of margins', () => {
    const caption = {
      ...createCaption(),
      logo: { asset, width: 15, colorMode: 'single' as const },
    };
    caption.position.anchor = 'bottom-right';
    caption.position.custom = { x: 50, y: 50 };
    expect(logoLayout(dimensions, caption)).toEqual({
      width: 150,
      height: 75,
      x: 850,
      y: 425,
    });
    caption.position.margins.left = 15;
    expect(logoLayout(dimensions, caption).x).toBe(850);
  });
  it('duplicates the SVG independently, and adds fresh text without inheriting a logo', () => {
    const layout = addLogo(createCaptionLayout(), 'logo', asset, dimensions);
    const duplicated = addCaption(layout, 'copy', true);
    duplicated.containers[2]!.logo!.width = 25;
    expect(layout.containers[1]!.logo!.width).toBe(15);
    expect(addCaption(layout, 'text').containers[2]!.logo).toBeUndefined();
    const caption = containerCaption(layout, layout.containers[1]!);
    const px = updateCaption(
      layout,
      '',
      convertSizing(caption, 'px', dimensions),
      dimensions,
    );
    expect(px.containers[1]!.logo!.width).toBe(150);
  });
});
