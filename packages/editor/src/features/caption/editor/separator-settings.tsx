import type { ReactNode } from 'react';
import { MoveHorizontal, MoveVertical, Ruler, Type } from 'lucide-react';
import { NumberField } from '@/components/ui/number-field';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { ColorControls } from '../color-controls';
import type { SeparatorReference } from '../../../../../core/src/inline-separator';
import {
  pixelsPerUnit,
  sizingLabels,
  toPixels,
  type SizingUnit,
} from '../../../../../core/src/sizing';
import type { ImageDimensions } from '../../../../../core/src/document';

export function SeparatorSettings({
  value,
  onChange,
  sizingUnit,
  fontSize,
  dimensions,
  onBrowseColors,
}: {
  value: SeparatorReference;
  onChange: (value: SeparatorReference) => void;
  sizingUnit: SizingUnit;
  fontSize: number;
  dimensions: ImageDimensions;
  onBrowseColors?: () => void;
}) {
  const {
    widthMode,
    width,
    unit: heightMode,
    height,
    thickness,
    color,
    opacity,
  } = value;
  const documentUnit = sizingLabels[sizingUnit];
  const documentPixels = pixelsPerUnit(sizingUnit, dimensions);
  const fontPixels = Math.max(0.01, toPixels(fontSize, sizingUnit, dimensions));
  const pixels =
    heightMode === 'font' ? height * fontPixels : height * documentPixels;
  const row = (icon: ReactNode, children: ReactNode) => (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
      {icon}
      {children}
    </div>
  );
  return (
    <>
      {row(
        <MoveHorizontal
          aria-label="Width"
          className="size-4 text-content-secondary"
        />,
        <InlineInputGroup
          label="Separator width controls"
          className="control-segments min-w-0"
        >
          <SegmentedControl
            label="Width mode"
            value={widthMode}
            onValueChange={(widthMode) => onChange({ ...value, widthMode })}
            className="min-w-0 flex-[1.7]"
            options={[
              { value: 'fixed', label: 'Fixed' },
              { value: 'flex', label: 'Flex' },
            ]}
          />
          <NumberField
            label="Separator width"
            hideLabel
            className="min-w-0 flex-1"
            value={width}
            onValueChange={(width) => onChange({ ...value, width })}
            min={documentUnit === 'px' ? 1 : 0.01}
            max={1e7}
            step={documentUnit === 'px' ? 1 : 0.1}
            unit={documentUnit}
            disabled={widthMode === 'flex'}
          />
        </InlineInputGroup>,
      )}
      {row(
        <MoveVertical
          aria-label="Height"
          className="size-4 text-content-secondary"
        />,
        <InlineInputGroup
          label="Separator height controls"
          className="control-segments min-w-0"
        >
          <SegmentedControl
            label="Height mode"
            value={heightMode}
            onValueChange={(next) => {
              onChange({
                ...value,
                unit: next,
                height:
                  next === 'font'
                    ? pixels / fontPixels
                    : pixels / documentPixels,
              });
            }}
            className="min-w-0 flex-[1.7]"
            options={[
              {
                value: 'font',
                label: 'Relative',
                content: (
                  <>
                    <Type aria-hidden="true" />
                    Relative
                  </>
                ),
              },
              {
                value: 'document',
                label: 'Fixed',
                content: (
                  <>
                    <Ruler aria-hidden="true" />
                    Fixed
                  </>
                ),
              },
            ]}
          />
          <NumberField
            label="Separator height"
            hideLabel
            className="min-w-0 flex-1"
            value={height}
            onValueChange={(height) => onChange({ ...value, height })}
            min={
              heightMode === 'font' ? 0.25 : documentUnit === 'px' ? 1 : 0.01
            }
            max={1e7}
            step={heightMode === 'font' || documentUnit !== 'px' ? 0.1 : 1}
            unit={heightMode === 'font' ? '×' : documentUnit}
          />
        </InlineInputGroup>,
      )}
      <NumberField
        label="Thickness"
        value={thickness}
        onValueChange={(thickness) => onChange({ ...value, thickness })}
        min={documentUnit === 'px' ? 0.1 : 0.001}
        max={1e7}
        step={documentUnit === 'px' ? 0.1 : 0.01}
        unit={documentUnit}
      />
      <div className="space-y-2">
        <p className="text-xs text-content-secondary">Color</p>
        <ColorControls
          value={color}
          onChange={(color) => onChange({ ...value, color })}
          onBrowse={() => onBrowseColors?.()}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-content-secondary">Opacity</p>
        <InlineInputGroup label="Separator opacity">
          <Slider
            label="Separator opacity"
            value={opacity * 100}
            onValueChange={(opacity) =>
              onChange({ ...value, opacity: opacity / 100 })
            }
          />
          <NumberField
            label="Separator opacity value"
            hideLabel
            className="w-24 shrink-0"
            value={opacity * 100}
            onValueChange={(opacity) =>
              onChange({ ...value, opacity: opacity / 100 })
            }
            min={0}
            max={100}
            unit="%"
          />
        </InlineInputGroup>
      </div>
    </>
  );
}
