import { useRef, useState, type ReactNode } from 'react';
import { Group, Rect, Shape, Image as CanvasImage } from 'react-konva';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import type { ContentRect } from '../../../../core/src/layer-background';
import { offsetTiled, tiledCopies } from '../../../../core/src/tiled-watermark';
import { captionBackgroundRect } from './background-render';
import type { renderBackgroundTile } from './background-render';

type Tile = NonNullable<ReturnType<typeof renderBackgroundTile>>;
export function TiledPreview({
  caption,
  geometry,
  dimensions,
  decoration,
  children,
  draggable,
  hideVisuals = false,
  layerHovered,
  offsetHovered,
  onSelect,
  onDragState,
  onChange,
  stroke,
  scale,
}: {
  caption: Caption;
  geometry: ContentRect;
  dimensions: ImageDimensions;
  decoration?: Tile;
  children: ReactNode;
  draggable: boolean;
  hideVisuals?: boolean;
  layerHovered: boolean;
  offsetHovered: boolean;
  onSelect: () => void;
  onDragState: (active: boolean) => void;
  onChange: (tiled: NonNullable<Caption['position']['tiled']>) => void;
  stroke: string;
  scale: number;
}) {
  const [hovered, setHovered] = useState(false);
  const start = useRef(caption.position.tiled!);
  const bounds = captionBackgroundRect(
    { x: 0, y: 0, width: geometry.width, height: geometry.height },
    caption,
    dimensions,
  );
  let copies: ReturnType<typeof tiledCopies>;
  try {
    copies = tiledCopies(dimensions, bounds, caption.position.tiled!);
  } catch {
    return null;
  }
  if (!caption.template.trim() && !caption.logo) return null;
  const unit = Math.min(dimensions.width, dimensions.height) / 100;
  const origin = {
    x: dimensions.width / 2 + caption.position.tiled!.offset.x * unit,
    y: dimensions.height / 2 + caption.position.tiled!.offset.y * unit,
  };
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent-color')
    .trim();
  return (
    <Group
      name="tiled-watermark"
      x={0}
      y={0}
      draggable={draggable}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => {
        start.current = structuredClone(caption.position.tiled!);
        onSelect();
        onDragState(true);
      }}
      onDragMove={(event) => {
        // React keeps the root at zero; copies move through normalized document offsets.
        const node = event.currentTarget;
        const tiled = offsetTiled(start.current, node.position(), dimensions);
        node.position({ x: 0, y: 0 });
        onChange(tiled);
      }}
      onDragEnd={(event) => {
        event.currentTarget.position({ x: 0, y: 0 });
        onDragState(false);
      }}
    >
      {!hideVisuals && decoration && (
        <CanvasImage {...decoration} listening={false} />
      )}
      {copies.map((copy) => (
        <Group
          name="tiled-motif"
          key={`${copy.row}:${copy.column}`}
          x={copy.x}
          y={copy.y}
          rotation={caption.position.tiled!.angle}
        >
          <Rect
            x={bounds.x - geometry.width / 2}
            y={bounds.y - geometry.height / 2}
            width={bounds.width}
            height={bounds.height}
            opacity={0}
            fill={stroke}
          />
          <Group
            x={-geometry.width / 2}
            y={-geometry.height / 2}
            opacity={hideVisuals ? 0 : caption.style.opacity}
            listening={false}
          >
            {children}
          </Group>
        </Group>
      ))}
      {(hovered || layerHovered) && draggable && (
        <Shape
          name="navigator-decoration"
          listening={false}
          stroke={stroke}
          strokeWidth={1 / scale}
          dash={[4 / scale, 3 / scale]}
          sceneFunc={(context, shape) => {
            context.beginPath();
            for (const copy of copies) {
              if (copy.row === 0 && copy.column === 0) continue;
              context.save();
              context.translate(copy.x, copy.y);
              context.rotate((caption.position.tiled!.angle * Math.PI) / 180);
              context.rect(
                bounds.x - geometry.width / 2,
                bounds.y - geometry.height / 2,
                bounds.width,
                bounds.height,
              );
              context.restore();
            }
            context.strokeShape(shape);
          }}
        />
      )}
      {(hovered || layerHovered || offsetHovered) && draggable && (
        <Group
          name="navigator-decoration tiled-origin-frame"
          x={origin.x}
          y={origin.y}
          rotation={caption.position.tiled!.angle}
          listening={false}
        >
          <Rect
            x={bounds.x - geometry.width / 2}
            y={bounds.y - geometry.height / 2}
            width={bounds.width}
            height={bounds.height}
            stroke={accent}
            strokeWidth={2 / scale}
          />
        </Group>
      )}
    </Group>
  );
}
