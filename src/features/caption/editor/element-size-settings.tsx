import {
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  MoveVertical,
  UnfoldVertical,
  Type,
  Ruler,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { NumberField } from '@/components/ui/number-field';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { VerticalAlignment as Alignment } from '@/domain/inline-icon';
export function ElementSizeSettings({
  height,
  unit,
  onHeight,
  onUnit,
  alignment,
  onAlignment,
  documentUnit = 'px',
}: {
  documentUnit?: string;
  height: number;
  alignment: Alignment;
  onAlignment: (alignment: Alignment) => void;
  unit: 'font' | 'document';
  onHeight: (height: number) => void;
  onUnit: (unit: 'font' | 'document') => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
        <Tooltip content="Element height">
          <MoveVertical
            aria-label="Height"
            className="size-4 text-content-secondary"
          />
        </Tooltip>
        <InlineInputGroup
          label="Sizing controls"
          className="control-segments min-w-0"
        >
          <SegmentedControl
            label="Sizing"
            value={unit}
            onValueChange={onUnit}
            className="min-w-0 flex-[1.7]"
            options={[
              {
                value: 'font',
                label: 'Relative to font',
                tooltip: 'Scale the element with the layer’s font size',
                content: (
                  <>
                    <Type aria-hidden="true" /> Relative
                  </>
                ),
              },
              {
                value: 'document',
                label: 'Fixed height',
                tooltip: 'Keep a fixed height in document units',
                content: (
                  <>
                    <Ruler aria-hidden="true" /> Fixed
                  </>
                ),
              },
            ]}
          />
          <NumberField
            className="min-w-0 flex-1"
            label="Image height"
            hideLabel
            tooltip={
              unit === 'font'
                ? 'Element height as a multiple of the layer’s font size'
                : `Element height in ${documentUnit}`
            }
            value={height}
            onValueChange={onHeight}
            min={unit === 'font' ? 0.25 : documentUnit === 'px' ? 1 : 0.1}
            max={1e7}
            step={unit === 'font' ? 0.1 : documentUnit === 'px' ? 1 : 0.1}
            unit={unit === 'font' ? '×' : documentUnit}
          />
        </InlineInputGroup>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1rem minmax(0, 1fr)',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Tooltip content="Vertical alignment within the caption line">
          <UnfoldVertical
            aria-label="Vertical alignment"
            className="size-4 text-content-secondary"
          />
        </Tooltip>
        <SegmentedControl
          label="Vertical alignment"
          value={alignment}
          onValueChange={onAlignment}
          options={[
            {
              value: 'top',
              label: 'Top',
              tooltip: 'Align to the top of the caption line',
              content: (
                <>
                  <AlignVerticalJustifyStart aria-hidden="true" />
                  Top
                </>
              ),
            },
            {
              value: 'center',
              label: 'Center',
              tooltip: 'Center vertically in the caption line',
              content: (
                <>
                  <AlignVerticalJustifyCenter aria-hidden="true" />
                  Center
                </>
              ),
            },
            {
              value: 'bottom',
              label: 'Bottom',
              tooltip: 'Align to the bottom of the caption line',
              content: (
                <>
                  <AlignVerticalJustifyEnd aria-hidden="true" />
                  Bottom
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
