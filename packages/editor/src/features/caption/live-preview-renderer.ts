import Konva from 'konva';
import {
  resolvedTextAlign,
  type Caption,
  type ImageDimensions,
} from '../../../../core/src/document';
import type { ContentRect } from '../../../../core/src/layer-background';
import { blendOperation } from '../../../../core/src/layer-blending';
import {
  effectBleed,
  hasLayerEffects,
} from '../../../../core/src/layer-effects';
import { tiledCopies } from '../../../../core/src/tiled-watermark';
import { toPixels } from '../../../../core/src/sizing';
import { captionNode, type RenderedCaption } from './render';
import { inlineLayout } from './inline-layout';
import { logoLayout } from './logo-layout';
import { ensureCaptionFont } from './font-loading';
import { anchoredPosition, customPosition } from './layout';
import {
  captionBackgroundRect,
  renderBackgroundTile,
} from './background-render';
import { tiledBackground } from './tiled-background';
import { PreviewRasterPool } from './preview-raster-pool';
import { dragSample } from '../photo/drag-diagnostics';

type Tile = NonNullable<ReturnType<typeof renderBackgroundTile>>;
type Motif = {
  key: string;
  tile: Tile;
  width: number;
  height: number;
  native?: Konva.Group;
};

/** Position-independent content key. Placement, blending and backdrop are composed live. */
export function previewContentKey(
  item: RenderedCaption,
  dimensions: ImageDimensions,
) {
  const {
    position: _position,
    background: _background,
    blending: _blending,
    visible: _visible,
    ...content
  } = item.caption;
  void _position;
  void _background;
  void _blending;
  void _visible;
  return JSON.stringify([
    dimensions,
    content,
    resolvedTextAlign(item.caption),
    item.text,
    item.color,
    item.icons ?? [],
  ]);
}

/** Experimental retained Canvas 2D compositor. Never used by JPG/PNG export. */
export class LivePreviewRenderer {
  private motifs = new Map<string, Motif>();
  private layers = new Map<
    string,
    { key: string; tile: Tile; version: number }
  >();
  private version = 0;
  private outputs: HTMLCanvasElement[] = [];
  private pool = new PreviewRasterPool();
  private composition: HTMLCanvasElement;
  private layer: HTMLCanvasElement;
  private disposed = false;
  private context: CanvasRenderingContext2D;
  private stage: Konva.Stage;
  private measuringLayer: Konva.Layer;
  private source: CanvasImageSource;
  private dimensions: ImageDimensions;
  constructor(source: CanvasImageSource, dimensions: ImageDimensions) {
    this.source = source;
    this.dimensions = dimensions;
    this.composition = document.createElement('canvas');
    this.composition.width = dimensions.width;
    this.composition.height = dimensions.height;
    this.context = this.composition.getContext('2d')!;
    this.layer = document.createElement('canvas');
    this.stage = new Konva.Stage({
      container: document.createElement('div'),
      width: 1,
      height: 1,
    });
    this.measuringLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.measuringLayer);
    this.measuringLayer.getCanvas().setPixelRatio(1);
  }
  private async motif(item: RenderedCaption) {
    const key = previewContentKey(item, this.dimensions);
    const id = item.id ?? key;
    const cached = this.motifs.get(id);
    if (cached?.key === key) {
      dragSample('content-cache-hit');
      return cached;
    }
    await ensureCaptionFont(item.caption.style, item.text);
    const geometry = item.caption.logo
      ? logoLayout(this.dimensions, item.caption)
      : inlineLayout(
          this.dimensions,
          item.caption,
          item.text,
          item.icons ?? [],
        );
    const decorations: HTMLCanvasElement[] = [];
    const node = await captionNode(
      this.dimensions,
      item.caption,
      item.text,
      item.color,
      item.icons ?? [],
      decorations,
    ).catch((error) => {
      decorations.forEach((canvas) => {
        canvas.width = canvas.height = 0;
      });
      throw error;
    });
    try {
      const bounds = node.getClientRect();
      const x = Math.floor(bounds.x),
        y = Math.floor(bounds.y);
      const width = Math.max(1, Math.ceil(bounds.x + bounds.width) - x + 2);
      const height = Math.max(1, Math.ceil(bounds.y + bounds.height) - y + 2);
      const rasterized = hasLayerEffects(item.caption);
      const image = rasterized
        ? node.toCanvas({ x, y, width, height, pixelRatio: 1 })
        : document.createElement('canvas');
      if (!rasterized) image.width = image.height = 1;
      const result: Motif = {
        key,
        width: geometry.width,
        height: geometry.height,
        tile: { image, x, y, width, height },
        native: rasterized ? undefined : node,
      };
      if (this.disposed) {
        image.width = image.height = 0;
        throw Error('Preview disposed.');
      }
      if (cached) {
        cached.tile.image.width = cached.tile.image.height = 0;
        cached.native?.destroy();
      }
      this.motifs.delete(id);
      this.motifs.set(id, result);
      dragSample('content-cache-miss');
      return result;
    } catch (error) {
      node.destroy();
      throw error;
    } finally {
      if (hasLayerEffects(item.caption) || this.disposed) node.destroy();
      decorations.forEach((c) => {
        c.width = c.height = 0;
      });
    }
  }
  private position(caption: Caption, motif: Motif): ContentRect {
    const block = { width: motif.width, height: motif.height };
    const point = caption.position.custom
      ? customPosition(
          this.dimensions,
          block,
          caption.position.anchor,
          caption.position.custom,
        )
      : anchoredPosition(this.dimensions, block, caption.position.anchor, {
          top: toPixels(
            caption.position.margins.top,
            caption.sizingUnit,
            this.dimensions,
          ),
          right: toPixels(
            caption.position.margins.right,
            caption.sizingUnit,
            this.dimensions,
          ),
          bottom: toPixels(
            caption.position.margins.bottom,
            caption.sizingUnit,
            this.dimensions,
          ),
          left: toPixels(
            caption.position.margins.left,
            caption.sizingUnit,
            this.dimensions,
          ),
        });
    return { ...point, ...block };
  }
  async render(items: readonly RenderedCaption[]) {
    const motifs = new Map<string, Motif>();
    for (const [i, item] of items.entries())
      if (item.caption.visible !== false)
        motifs.set(item.id ?? String(i), await this.motif(item));
    if (this.disposed) throw Error('Preview disposed.');
    this.pool.begin();
    try {
      const context = this.context;
      context.reset();
      context.drawImage(
        this.source,
        0,
        0,
        this.dimensions.width,
        this.dimensions.height,
      );
      const lowerVersions: number[] = [];
      for (const [i, item] of items.entries()) {
        const id = item.id ?? String(i),
          motif = motifs.get(id);
        if (!motif || (!item.text.trim() && !item.caption.logo)) continue;
        const { caption } = item;
        const key = JSON.stringify([
          motif.key,
          caption.position,
          caption.background,
          caption.blending,
          caption.background?.type === 'glass' ? lowerVersions : null,
        ]);
        const cached = this.layers.get(id);
        const composite = (tile: Tile) => {
          context.save();
          context.globalAlpha = caption.blending?.opacity ?? 1;
          context.globalCompositeOperation = blendOperation(
            caption.blending?.mode ?? 'normal',
          );
          context.drawImage(tile.image, tile.x, tile.y);
          context.restore();
        };
        if (cached?.key === key) {
          dragSample('layer-cache-hit');
          composite(cached.tile);
          lowerVersions.push(cached.version);
          continue;
        }
        dragSample('layer-cache-miss');
        const geometry = this.position(caption, motif),
          tiled = caption.position.tiled;
        // One readback per Glass layer, rather than one per rotated copy.
        let backdrop = this.composition;
        if (caption.background?.type === 'glass' && tiled?.enabled) {
          backdrop = this.pool.canvas(
            this.dimensions.width,
            this.dimensions.height,
          );
          backdrop.getContext('2d')!.drawImage(this.composition, 0, 0);
        }
        const background = tiled?.enabled
          ? null
          : renderBackgroundTile(
              geometry,
              caption,
              this.dimensions,
              (sample) => {
                const crop = this.pool.canvas(sample.width, sample.height);
                crop
                  .getContext('2d')!
                  .drawImage(
                    backdrop,
                    sample.x,
                    sample.y,
                    sample.width,
                    sample.height,
                    0,
                    0,
                    sample.width,
                    sample.height,
                  );
                return crop;
              },
              this.dimensions,
              this.pool,
            );
        const content = {
          ...motif.tile,
          x: geometry.x + motif.tile.x,
          y: geometry.y + motif.tile.y,
        };
        const x = Math.max(
          0,
          Math.floor(Math.min(content.x, background?.x ?? content.x)),
        );
        const y = Math.max(
          0,
          Math.floor(Math.min(content.y, background?.y ?? content.y)),
        );
        const bounds = tiled?.enabled
          ? { x: 0, y: 0, ...this.dimensions }
          : {
              x,
              y,
              width: Math.max(
                1,
                Math.min(
                  this.dimensions.width,
                  Math.ceil(
                    Math.max(
                      content.x + content.width,
                      background ? background.x + background.width : 0,
                    ),
                  ),
                ) - x,
              ),
              height: Math.max(
                1,
                Math.min(
                  this.dimensions.height,
                  Math.ceil(
                    Math.max(
                      content.y + content.height,
                      background ? background.y + background.height : 0,
                    ),
                  ),
                ) - y,
              ),
            };
        // Native text clipped by a photo edge must keep the reference canvas's
        // device origin; a translated, smaller canvas can change glyph hinting.
        const nativeClipped =
          motif.native &&
          (content.x < 0 ||
            content.y < 0 ||
            content.x + content.width > this.dimensions.width ||
            content.y + content.height > this.dimensions.height);
        const paintBounds = nativeClipped
          ? { x: 0, y: 0, ...this.dimensions }
          : bounds;
        const canvas = this.measuringLayer.getCanvas();
        if (
          canvas.width !== paintBounds.width ||
          canvas.height !== paintBounds.height
        )
          canvas.setSize(paintBounds.width, paintBounds.height);
        this.layer = this.measuringLayer.getNativeCanvasElement();
        const layer = this.layer.getContext('2d')!;
        layer.reset();
        layer.translate(-paintBounds.x, -paintBounds.y);
        const draw = (tile: Tile) =>
          layer.drawImage(tile.image, tile.x, tile.y, tile.width, tile.height);
        if (tiled?.enabled) {
          const decorated = captionBackgroundRect(
            { x: 0, y: 0, width: motif.width, height: motif.height },
            caption,
            this.dimensions,
          );
          const copies = tiledCopies(
            this.dimensions,
            decorated,
            tiled,
            effectBleed(caption, this.dimensions),
          );
          for (const copy of copies) {
            layer.save();
            layer.translate(copy.x, copy.y);
            layer.rotate((tiled.angle * Math.PI) / 180);
            const tile = tiledBackground(
              this.measuringLayer,
              this.dimensions,
              caption,
              motif,
              copy,
              backdrop,
              this.pool,
            );
            if (tile) draw(tile);
            layer.restore();
          }
          for (const copy of copies) {
            if (motif.native) {
              motif.native.setAttrs({
                x: copy.x,
                y: copy.y,
                rotation: tiled.angle,
                offsetX: motif.width / 2,
                offsetY: motif.height / 2,
              });
              motif.native.drawScene(canvas);
            } else {
              layer.save();
              layer.translate(copy.x, copy.y);
              layer.rotate((tiled.angle * Math.PI) / 180);
              layer.translate(-motif.width / 2, -motif.height / 2);
              draw(motif.tile);
              layer.restore();
            }
          }
        } else {
          if (background) draw(background);
          if (motif.native) {
            motif.native.setAttrs({
              x: geometry.x,
              y: geometry.y,
              rotation: 0,
              offsetX: 0,
              offsetY: 0,
            });
            motif.native.drawScene(canvas);
          } else {
            layer.save();
            layer.translate(geometry.x, geometry.y);
            draw(motif.tile);
            layer.restore();
          }
        }
        const version = ++this.version;
        lowerVersions.push(version);
        if (bounds.width * bounds.height * 4 <= 64 * 1024 * 1024) {
          const image = cached?.tile.image ?? document.createElement('canvas');
          if (image.width !== bounds.width || image.height !== bounds.height) {
            image.width = bounds.width;
            image.height = bounds.height;
          }
          image.getContext('2d')!.reset();
          image
            .getContext('2d')!
            .drawImage(
              this.layer,
              bounds.x - paintBounds.x,
              bounds.y - paintBounds.y,
              bounds.width,
              bounds.height,
              0,
              0,
              bounds.width,
              bounds.height,
            );
          const tile = { ...bounds, image };
          this.layers.delete(id);
          this.layers.set(id, { key, tile, version });
          composite(tile);
        } else composite({ ...paintBounds, image: this.layer });
      }
      const output = this.outputs.pop() ?? document.createElement('canvas');
      if (
        output.width !== this.dimensions.width ||
        output.height !== this.dimensions.height
      ) {
        output.width = this.dimensions.width;
        output.height = this.dimensions.height;
      }
      output.getContext('2d')!.reset();
      output.getContext('2d')!.drawImage(this.composition, 0, 0);
      return output;
    } finally {
      this.pool.end();
      const used = new Set(items.map((item, i) => item.id ?? String(i)));
      let bytes = 0;
      for (const [id, layer] of [...this.layers].reverse()) {
        bytes += layer.tile.width * layer.tile.height * 4;
        if (!used.has(id) || bytes > 64 * 1024 * 1024) {
          layer.tile.image.width = layer.tile.image.height = 0;
          this.layers.delete(id);
        }
      }
      bytes = 0;
      const contentIds = new Set(
        items.map(
          (item) => item.id ?? previewContentKey(item, this.dimensions),
        ),
      );
      for (const [id, motif] of [...this.motifs].reverse()) {
        bytes += motif.tile.image.width * motif.tile.image.height * 4;
        if (!contentIds.has(id) || bytes > 64 * 1024 * 1024) {
          motif.tile.image.width = motif.tile.image.height = 0;
          motif.native?.destroy();
          this.motifs.delete(id);
        }
      }
    }
  }
  release(canvas: HTMLCanvasElement) {
    if (this.disposed || this.outputs.length >= 2)
      canvas.width = canvas.height = 0;
    else this.outputs.push(canvas);
  }
  dispose() {
    this.disposed = true;
    this.pool.dispose();
    this.outputs.forEach((c) => {
      c.width = c.height = 0;
    });
    this.outputs = [];
    this.stage.destroy();
    this.motifs.forEach((m) => {
      m.tile.image.width = m.tile.image.height = 0;
      m.native?.destroy();
    });
    this.motifs.clear();
    this.layers.forEach((entry) => {
      entry.tile.image.width = entry.tile.image.height = 0;
    });
    this.layers.clear();
    this.composition.width =
      this.composition.height =
      this.layer.width =
      this.layer.height =
        0;
  }
}
