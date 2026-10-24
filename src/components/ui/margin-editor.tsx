import { useState } from 'react';
import { NumberField } from './number-field';
import { PhotoIcon } from '../icons/photo-icon';
import { SegmentedControl } from './segmented-control';
import { cn } from '@/lib/utils';
import {
  changeMargin,
  setMarginLinkMode,
  oppositeMargin,
  type MarginLinkMode,
  marginLimits,
  marginSides,
  type Margins,
  type SizingUnit,
} from '@/domain/sizing';
import type { ImageDimensions } from '@/domain/document';

export interface MarginEditorProps {
  value: Margins;
  linkMode: MarginLinkMode;
  unit: SizingUnit;
  unitLabel: string;
  dimensions: ImageDimensions;
  disabled?: boolean;
  hideLabel?: boolean;
  onChange: (value: Margins, linkMode: MarginLinkMode) => void;
}

export function MarginEditor({
  value,
  linkMode,
  unit,
  unitLabel,
  dimensions,
  disabled = false,
  hideLabel = false,
  onChange,
}: MarginEditorProps) {
  const [active, setActive] = useState<keyof Margins | null>(null);
  const limits = marginLimits(value, unit, dimensions, linkMode);
  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 space-y-3"
      aria-label="Margins"
    >
      <div className="space-y-2">
        {!hideLabel && (
          <span className="text-xs text-label">
            Margins <span className="text-content-muted">({unitLabel})</span>
          </span>
        )}
        <p className="text-xs text-label">Link margins</p>
        <SegmentedControl
          label="Margin linking"
          value={linkMode}
          disabled={disabled}
          className="w-full"
          onValueChange={(mode) =>
            onChange(setMarginLinkMode(value, mode, unit, dimensions), mode)
          }
          options={[
            {
              value: 'none',
              label: 'None',
              title: 'Edit each margin independently',
            },
            {
              value: 'pairs',
              label: 'Pairs',
              title: 'Link top/bottom and left/right',
            },
            { value: 'all', label: 'All', title: 'Link all four margins' },
          ]}
        />
      </div>
      <div className="margin-editor-grid">
        {marginSides.map((side) => (
          <div
            key={side}
            style={{ gridArea: side }}
            onMouseEnter={() => setActive(side)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement))
                setActive(null);
            }}
            onFocusCapture={() => setActive(side)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setActive(null);
            }}
          >
            <NumberField
              label={side.charAt(0).toUpperCase() + side.slice(1)}
              unit={unitLabel}
              value={value[side]}
              min={0}
              max={limits[side]}
              step="any"
              disabled={disabled}
              onValueChange={(next) =>
                onChange(changeMargin(value, side, next, linkMode), linkMode)
              }
            />
          </div>
        ))}
        <div
          className="margin-diagram"
          aria-label="Margin edges"
          style={{ gridArea: 'center' }}
        >
          <div className="margin-photo" aria-hidden="true">
            <PhotoIcon
              width={60}
              height={59}
              className="text-icon-muted"
              aria-hidden="true"
              focusable="false"
            />
            {marginSides.map((side) => (
              <span
                key={side}
                className={cn(
                  `margin-edge margin-edge-${side}`,
                  active &&
                    (linkMode === 'all' ||
                      active === side ||
                      (linkMode === 'pairs' &&
                        oppositeMargin[active] === side)) &&
                    'margin-edge-active',
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] leading-4 text-content-muted">
        {linkMode === 'all'
          ? 'All edges linked. Top is used when linking.'
          : linkMode === 'pairs'
            ? 'Top/bottom and left/right linked. Top and left are used when linking.'
            : 'Each edge is independent.'}
      </p>
    </fieldset>
  );
}
