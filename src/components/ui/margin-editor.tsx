import { RotateCcw } from 'lucide-react';
import { Button } from './button';
import { HelperText } from '@/components/ui/helper-text';
import { useEffect, useState } from 'react';
import { useMarginPreview } from './margin-preview-context';
import { NumberField } from './number-field';
import { PhotoIcon } from '../icons/photo-icon';
import { SegmentedControl } from './segmented-control';
import { cn } from '@/lib/utils';
import {
  changeMargin,
  convertSizing,
  setMarginLinkMode,
  oppositeMargin,
  type MarginLinkMode,
  marginLimits,
  marginSides,
  type Margins,
  type SizingUnit,
} from '@/domain/sizing';
import { createCaption, type ImageDimensions } from '@/domain/document';

export interface MarginEditorProps {
  value: Margins;
  linkMode: MarginLinkMode;
  unit: SizingUnit;
  unitLabel: string;
  dimensions: ImageDimensions;
  disabled?: boolean;
  hideLabel?: boolean;
  hideUnitLabel?: boolean;
  appearance?: 'default' | 'compact';
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
  hideUnitLabel = false,
  appearance = 'default',
  onChange,
}: MarginEditorProps) {
  const [hovered, setHovered] = useState<keyof Margins | null>(null);
  const [focused, setFocused] = useState<keyof Margins | null>(null);
  const preview = useMarginPreview();
  const active = preview ? preview.active : (focused ?? hovered);
  const clearHover = preview?.hover;
  const clearFocus = preview?.focus;
  useEffect(
    () => () => {
      clearHover?.(null);
      clearFocus?.(null);
    },
    [clearHover, clearFocus],
  );
  const compact = appearance === 'compact';
  const limits = marginLimits(value, unit, dimensions, linkMode);
  const resetButton = (
    <Button
      variant="outline"
      size="sm"
      className={
        compact
          ? 'absolute right-2 bottom-2 z-10 h-6 gap-1 px-1.5 text-xs'
          : 'h-6 gap-1 px-1.5 text-xs'
      }
      aria-label="Reset margins"
      title={compact ? undefined : 'Reset all margins to 3% of the short edge'}
      disabled={disabled}
      onClick={() => {
        const defaults = convertSizing(createCaption(), unit, dimensions)
          .position.margins;
        onChange(
          setMarginLinkMode(defaults, 'all', unit, dimensions),
          linkMode,
        );
      }}
    >
      <RotateCcw aria-hidden="true" />
      Reset
    </Button>
  );
  const linking = (
    <div className="space-y-2">
      {!compact && <p className="text-xs text-label">Link margins</p>}
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
            label: compact ? 'Individual' : 'None',
            title: compact ? '' : 'Edit each margin independently',
          },
          {
            value: 'pairs',
            label: compact ? 'Paired' : 'Pairs',
            title: compact ? '' : 'Link top/bottom and left/right',
          },
          {
            value: 'all',
            label: compact ? 'Linked' : 'All',
            title: compact ? '' : 'Link all four margins',
          },
        ]}
      />
    </div>
  );
  return (
    <fieldset
      disabled={disabled}
      className={cn('min-w-0', compact ? 'space-y-2' : 'space-y-3')}
      aria-label="Margins"
    >
      {compact && linking}
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <div className="margin-model-label text-xs text-label">
            {hideLabel ? 'Photo margins' : 'Margins'}{' '}
            <span className="text-content-muted">({unitLabel})</span>
          </div>
          {resetButton}
        </div>
      )}
      <div
        className={cn('margin-editor-grid', compact && 'margin-editor-compact')}
      >
        {compact && (
          <>
            {!hideUnitLabel && (
              <span
                className="absolute top-2 left-2 text-[10px] text-content-muted"
                aria-label={`Margin unit: ${unitLabel}`}
              >
                {unitLabel}
              </span>
            )}
            {resetButton}
          </>
        )}
        {marginSides.map((side) => (
          <div
            key={side}
            className="margin-model-value"
            title={
              compact ? undefined : side.charAt(0).toUpperCase() + side.slice(1)
            }
            style={{ gridArea: side }}
            onMouseEnter={() => {
              if (disabled) return;
              setHovered(side);
              preview?.hover(side);
            }}
            onMouseLeave={() => {
              setHovered(null);
              preview?.hover(null);
            }}
            onFocusCapture={() => {
              setFocused(side);
              preview?.focus(side);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setFocused(null);
                preview?.focus(null);
              }
            }}
          >
            <NumberField
              title={compact ? '' : undefined}
              label={side.charAt(0).toUpperCase() + side.slice(1)}
              hideLabel
              unit={unitLabel}
              showSteppers
              value={value[side]}
              min={0}
              max={limits[side]}
              step={unit === 'px' ? 1 : 0.1}
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
            {!compact && (
              <>
                <PhotoIcon
                  width={24}
                  height={24}
                  className="text-icon-muted"
                  aria-hidden="true"
                  focusable="false"
                />
                <span className="text-[10px] text-content-secondary">
                  Caption area
                </span>
              </>
            )}
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
      {!compact && linking}
      {!compact && (
        <HelperText>
          {linkMode === 'all'
            ? 'All edges linked. Top is used when linking.'
            : linkMode === 'pairs'
              ? 'Top/bottom and left/right linked. Top and left are used when linking.'
              : 'Click a value to edit. Each edge is independent.'}
        </HelperText>
      )}
    </fieldset>
  );
}
