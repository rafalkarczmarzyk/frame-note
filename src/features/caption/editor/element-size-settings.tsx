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
      <div className="space-y-2">
        <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
          <Tooltip content="Element height">
            <MoveVertical
              aria-label="Height"
              className="size-4 text-content-secondary"
            />
          </Tooltip>
          <div className="control-field flex min-w-0 items-center gap-1 p-1">
            <div
              role="group"
              aria-label="Sizing"
              className="flex min-w-0 flex-[1.1] items-center gap-1"
            >
              <Tooltip content="Scale the element with the layer’s font size">
                <button
                  type="button"
                  aria-label="Relative to font"
                  aria-pressed={unit === 'font'}
                  onClick={() => onUnit('font')}
                  className={`control-segment flex h-9 min-w-0 flex-1 items-center justify-center gap-1 px-1 text-xs [&_svg]:size-4 ${unit === 'font' ? 'control-selected' : ''}`}
                >
                  <Type aria-hidden="true" />
                  Relative
                </button>
              </Tooltip>
              <Tooltip content="Keep a fixed height in document units">
                <button
                  type="button"
                  aria-label="Fixed height"
                  aria-pressed={unit === 'document'}
                  onClick={() => onUnit('document')}
                  className={`control-segment flex h-9 min-w-0 flex-1 items-center justify-center gap-1 px-1 text-xs [&_svg]:size-4 ${unit === 'document' ? 'control-selected' : ''}`}
                >
                  <Ruler aria-hidden="true" />
                  Fixed
                </button>
              </Tooltip>
            </div>
            <div className="min-w-0 flex-1">
              <NumberField
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
            </div>
          </div>
        </div>
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
