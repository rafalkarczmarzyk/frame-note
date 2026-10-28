import { Tooltip } from './tooltip';
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
  purpose?: 'margins' | 'padding';
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
  purpose = 'margins',
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
  const isPadding = purpose === 'padding';
  const name = isPadding ? 'Padding' : 'Margins';
  const edgeName = isPadding ? 'padding' : 'margin';
  const compact = appearance === 'compact';
  const limits = marginLimits(value, unit, dimensions, linkMode);
  const resetButton = (
    <Tooltip
      content={
        isPadding
          ? 'Reset padding to zero'
          : 'Reset all margins to 3% of the short edge'
      }
    >
      <Button
        variant="outline"
        size="sm"
        className={
          compact
            ? 'absolute right-2 bottom-2 z-10 h-6 gap-1 px-1.5 text-xs'
            : 'h-6 gap-1 px-1.5 text-xs'
        }
        aria-label={`Reset ${purpose}`}
        title=""
        disabled={disabled}
        onClick={() => {
          if (isPadding) {
            onChange({ top: 0, right: 0, bottom: 0, left: 0 }, linkMode);
            return;
          }
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
    </Tooltip>
  );
  const linking = (
    <div className="space-y-2">
      {!compact && <p className="text-xs text-label">Link {purpose}</p>}
      <SegmentedControl
        label={`${name} linking`}
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
            tooltip: `Edit each ${edgeName} independently`,
          },
          {
            value: 'pairs',
            label: compact ? 'Paired' : 'Pairs',
            tooltip: 'Link top/bottom and left/right',
          },
          {
            value: 'all',
            label: compact ? 'Linked' : 'All',
            tooltip: `Link all four ${edgeName} values`,
          },
        ]}
      />
    </div>
  );
  return (
    <fieldset
      disabled={disabled}
      className={cn('min-w-0', compact ? 'space-y-2' : 'space-y-3')}
      aria-label={name}
    >
      {compact && linking}
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <div className="margin-model-label text-xs text-label">
            {isPadding ? 'Padding' : hideLabel ? 'Photo margins' : 'Margins'}{' '}
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
                aria-label={`${name} unit: ${unitLabel}`}
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
              tooltip={`${side.charAt(0).toUpperCase() + side.slice(1)} ${edgeName}`}
              label={side.charAt(0).toUpperCase() + side.slice(1)}
              hideLabel
              unit={unitLabel}
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
          aria-label={`${name} edges`}
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
                  {isPadding ? 'Content area' : 'Caption area'}
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
