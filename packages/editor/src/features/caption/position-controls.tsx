import type { Caption, ImageDimensions } from '../../../../core/src/document';
import {
  defaultTiledPosition,
  type TiledPosition,
} from '../../../../core/src/tiled-watermark';
import {
  Anchor as AnchorIcon,
  BrickWall,
  Grid2X2,
  Grid3X3,
  Move,
  RotateCcw,
} from 'lucide-react';
import { InspectorSection } from '@/components/layout/inspector-section';
import { AnchorPicker } from '@/components/ui/anchor-picker';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { HelperText } from '@/components/ui/helper-text';
import { NumberField } from '@/components/ui/number-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { anchoredPosition, customPoint } from './layout';
import { toPixels } from '../../../../core/src/sizing';

const modes = [
  {
    value: 'anchor',
    label: 'Anchor',
    content: (
      <>
        <AnchorIcon className="size-4" aria-hidden="true" />
        Anchor
      </>
    ),
  },
  {
    value: 'manual',
    label: 'Manual',
    content: (
      <>
        <Move className="size-4" aria-hidden="true" />
        Manual
      </>
    ),
  },
  {
    value: 'tiled',
    label: 'Tiled',
    content: (
      <>
        <Grid2X2 className="size-4" aria-hidden="true" />
        Tiled
      </>
    ),
  },
] as const;

export function CaptionPositionControls({
  caption,
  dimensions,
  onChange,
  disabled,
  onOffsetHover,
}: {
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled: boolean;
  onOffsetHover?: (hovered: boolean) => void;
}) {
  const position = (patch: Partial<Caption['position']>) =>
    onChange({ ...caption, position: { ...caption.position, ...patch } });
  const anchorCoordinates = customPoint(
    dimensions,
    { width: 0, height: 0 },
    caption.position.anchor,
    anchoredPosition(
      dimensions,
      { width: 0, height: 0 },
      caption.position.anchor,
      {
        top: toPixels(
          caption.position.margins.top,
          caption.sizingUnit,
          dimensions,
        ),
        right: toPixels(
          caption.position.margins.right,
          caption.sizingUnit,
          dimensions,
        ),
        bottom: toPixels(
          caption.position.margins.bottom,
          caption.sizingUnit,
          dimensions,
        ),
        left: toPixels(
          caption.position.margins.left,
          caption.sizingUnit,
          dimensions,
        ),
      },
    ),
  );
  const coordinates = caption.position.custom ?? anchorCoordinates;

  const tiled = caption.position.tiled ?? defaultTiledPosition();
  const mode = caption.position.tiled?.enabled
    ? 'tiled'
    : caption.position.custom
      ? 'manual'
      : 'anchor';
  const tile = (patch: Partial<TiledPosition>) =>
    position({ tiled: { ...tiled, ...patch } });

  return (
    <InspectorSection title="Position">
      <fieldset disabled={disabled} className="space-y-3 disabled:opacity-70">
        <SegmentedControl
          label="Position mode"
          value={mode}
          disabled={disabled}
          onValueChange={(next) =>
            position({
              tiled: { ...tiled, enabled: next === 'tiled' },
              ...(next === 'anchor'
                ? { custom: undefined }
                : next === 'manual'
                  ? { custom: caption.position.custom ?? anchorCoordinates }
                  : {}),
            })
          }
          options={modes}
        />
        {mode === 'anchor' && (
          <div className="flex justify-center">
            <AnchorPicker
              value={caption.position.anchor}
              onValueChange={(anchor) => position({ anchor })}
              disabled={disabled}
            />
          </div>
        )}
        {mode === 'manual' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="X position"
                value={coordinates.x}
                onValueChange={(x) =>
                  position({ custom: { ...coordinates, x } })
                }
                min={0}
                max={100}
                step={0.1}
                unit="%"
              />
              <NumberField
                label="Y position"
                value={coordinates.y}
                onValueChange={(y) =>
                  position({ custom: { ...coordinates, y } })
                }
                min={0}
                max={100}
                step={0.1}
                unit="%"
              />
            </div>
            <HelperText>X: % of photo width · Y: % of photo height</HelperText>
          </>
        )}
        {mode === 'tiled' && (
          <>
            <Field label="Pattern">
              {() => (
                <SegmentedControl
                  label="Pattern"
                  value={tiled.pattern}
                  disabled={disabled}
                  onValueChange={(pattern) =>
                    tile({ pattern: pattern as typeof tiled.pattern })
                  }
                  options={[
                    {
                      value: 'grid',
                      label: 'Grid',
                      content: (
                        <>
                          <Grid3X3 className="size-4" aria-hidden="true" />
                          Grid
                        </>
                      ),
                    },
                    {
                      value: 'staggered',
                      label: 'Staggered',
                      content: (
                        <>
                          <BrickWall className="size-4" aria-hidden="true" />
                          Staggered
                        </>
                      ),
                    },
                  ]}
                />
              )}
            </Field>
            <div className="space-y-3">
              <div className="min-w-0 space-y-2">
                <NumberField
                  label="Angle"
                  value={tiled.angle}
                  onValueChange={(angle) => tile({ angle })}
                  min={-180}
                  max={180}
                  step={0.1}
                  unit="°"
                />
                <SegmentedControl
                  label="Angle presets"
                  disabled={disabled}
                  value={String(tiled.angle)}
                  onValueChange={(value) => tile({ angle: Number(value) })}
                  options={[
                    { value: '-45', label: '−45°' },
                    { value: '-30', label: '−30°' },
                    { value: '0', label: '0°' },
                    { value: '30', label: '30°' },
                    { value: '45', label: '45°' },
                  ]}
                />
              </div>
              <NumberField
                label="Spacing"
                tooltip="Gap between motif edges · % of shorter photo side"
                value={tiled.spacing}
                onValueChange={(spacing) => tile({ spacing })}
                min={0}
                max={100}
                step={0.1}
                unit="%"
              />
            </div>
            <div
              className="grid grid-cols-2 gap-2"
              onMouseEnter={() => onOffsetHover?.(true)}
              onMouseLeave={() => onOffsetHover?.(false)}
            >
              <NumberField
                label="Offset X"
                tooltip="Horizontal pattern offset · % of shorter photo side; positive moves right"
                value={tiled.offset.x}
                onValueChange={(x) => tile({ offset: { ...tiled.offset, x } })}
                min={-100}
                max={100}
                step={0.1}
                unit="%"
              />
              <NumberField
                label="Offset Y"
                tooltip="Vertical pattern offset · % of shorter photo side; positive moves down"
                value={tiled.offset.y}
                onValueChange={(y) => tile({ offset: { ...tiled.offset, y } })}
                min={-100}
                max={100}
                step={0.1}
                unit="%"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="size-4" aria-hidden="true" />}
              onClick={() => tile({ offset: { x: 0, y: 0 } })}
            >
              Reset offset
            </Button>
          </>
        )}
      </fieldset>
    </InspectorSection>
  );
}
