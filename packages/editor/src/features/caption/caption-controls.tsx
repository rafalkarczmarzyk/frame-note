import { BlendingControls } from './blending-controls';
import { useSyncExternalStore } from 'react';
import {
  isFontAvailable,
  fontLabel,
  subscribeFonts,
  fontRevision,
} from '../../../../core/src/fonts';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import type { ColorSelectionSource } from '../../../../core/src/caption-colors';
import {
  supportsBold,
  supportsItalic,
  effectiveFontStyle,
} from '../../../../core/src/font-style';
import { AlignAuto } from '@/components/icons/align-auto';
import { InspectorSection } from '@/components/layout/inspector-section';
import { IconButton } from '@/components/ui/icon-button';
import { ColorControls } from './color-controls';
import { SidebarSection } from '@/components/layout/sidebar-section';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronRight,
  Ruler,
  Bold,
  Italic,
  ArrowDownUp,
  Type,
  ALargeSmall,
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { NumberField } from '@/components/ui/number-field';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { MarginEditor } from '@/components/ui/margin-editor';
import { RangeField } from '@/components/ui/range-field';
import { Blend } from 'lucide-react';
import {
  convertSizing,
  pixelsPerUnit,
  sizingLabels,
  type SizingUnit,
} from '../../../../core/src/sizing';
import type { Caption, ImageDimensions } from '../../../../core/src/document';

type CaptionControlsProps = {
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled: boolean;
};

export function CaptionControls({
  caption,
  dimensions,
  onChange,
  disabled,
  onBrowseFonts,
  onBrowseColors,
  colorSelectionSource,
  onColorSelectionSourceChange,
  scope = 'all',
  hideTypography = false,
  canConvertUnits = true,
}: CaptionControlsProps & {
  scope?: 'all' | 'local' | 'global';
  hideTypography?: boolean;
  canConvertUnits?: boolean;
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled: boolean;
  onBrowseFonts: () => void;
  onBrowseColors: () => void;
  colorSelectionSource?: ColorSelectionSource;
  onColorSelectionSourceChange?: (
    source: ColorSelectionSource,
    color: string,
  ) => void;
}) {
  const style = (patch: Partial<Caption['style']>) =>
    onChange({ ...caption, style: { ...caption.style, ...patch } });
  const position = (patch: Partial<Caption['position']>) =>
    onChange({ ...caption, position: { ...caption.position, ...patch } });
  const unit = sizingLabels[caption.sizingUnit];
  const factor = pixelsPerUnit(caption.sizingUnit, dimensions);
  const opacity = Math.round(caption.style.opacity * 100);

  useSyncExternalStore(subscribeFonts, fontRevision, fontRevision);
  return (
    <>
      {scope !== 'local' && (
        <SidebarSection
          id="sizing"
          title="Units & Margins"
          defaultOpen={false}
          iconTone="sizing"
          icon={<Ruler />}
        >
          <Field
            label="Sizing unit"
            hint={
              !canConvertUnits
                ? 'Open a photo to change document units.'
                : undefined
            }
          >
            {(id, descriptionId) => (
              <Tooltip content="Units for font size, margins and fixed image height">
                <Select
                  id={id}
                  aria-describedby={descriptionId}
                  value={caption.sizingUnit}
                  disabled={disabled || !canConvertUnits}
                  onValueChange={(value) =>
                    onChange(
                      convertSizing(caption, value as SizingUnit, dimensions),
                    )
                  }
                  options={[
                    { value: 'px', label: 'Pixels (px)' },
                    { value: 'short-edge', label: '% of short edge' },
                    { value: 'long-edge', label: '% of long edge' },
                  ]}
                />
              </Tooltip>
            )}
          </Field>
          <fieldset disabled={disabled} className="mt-3 disabled:opacity-70">
            <MarginEditor
              appearance="compact"
              hideLabel
              hideUnitLabel
              key={caption.sizingUnit}
              value={caption.position.margins}
              linkMode={caption.position.marginLinkMode}
              unit={caption.sizingUnit}
              unitLabel={unit}
              dimensions={dimensions}
              disabled={disabled}
              onChange={(margins, marginLinkMode) =>
                position({ margins, marginLinkMode })
              }
            />
          </fieldset>
        </SidebarSection>
      )}
      {scope !== 'global' && (
        <>
          {!hideTypography && (
            <InspectorSection title="Typography">
              <fieldset
                disabled={disabled}
                className="space-y-2 disabled:opacity-70"
              >
                <div className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
                  <Type
                    className="size-4 shrink-0 text-content-secondary"
                    aria-hidden="true"
                  />
                  <Field label="Font" hideLabel>
                    {(id) => (
                      <Tooltip content="Choose a font">
                        <button
                          type="button"
                          id={id}
                          aria-haspopup="dialog"
                          onClick={onBrowseFonts}
                          className="control-field control-height flex w-full items-center justify-between px-3 text-xs"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate">
                              {fontLabel(caption.style.fontFamily)}
                            </span>
                            {!isFontAvailable(caption.style.fontFamily) && (
                              <Badge tone="warning" className="shrink-0">
                                Unavailable
                              </Badge>
                            )}
                          </span>
                          <ChevronRight
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </Tooltip>
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <InlineInputGroup
                    label="Font size"
                    className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)]"
                  >
                    <Tooltip content="Font size">
                      <ALargeSmall
                        className="size-4 shrink-0 text-content-secondary"
                        aria-hidden="true"
                      />
                    </Tooltip>
                    <NumberField
                      key={caption.sizingUnit}
                      label="Font size"
                      tooltip="Font size"
                      hideLabel
                      unit={unit}
                      value={caption.style.fontSize}
                      min={0.01 / factor}
                      max={
                        Math.max(dimensions.width, dimensions.height) / factor
                      }
                      step={0.1}
                      disabled={disabled}
                      onValueChange={(fontSize) => style({ fontSize })}
                    />
                  </InlineInputGroup>
                  <InlineInputGroup
                    label="Line spacing"
                    className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)]"
                  >
                    <Tooltip content="Line spacing · multiple of font size">
                      <ArrowDownUp
                        className="size-4 shrink-0 text-content-secondary"
                        aria-hidden="true"
                      />
                    </Tooltip>
                    <NumberField
                      label="Line spacing"
                      tooltip="Line spacing · multiple of font size"
                      hideLabel
                      unit="×"
                      value={caption.style.lineHeight}
                      step={0.1}
                      min={0.5}
                      max={3}
                      disabled={disabled}
                      onValueChange={(lineHeight) => style({ lineHeight })}
                    />
                  </InlineInputGroup>
                </div>
                <InlineInputGroup
                  label="Text formatting controls"
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2"
                >
                  <SegmentedControl
                    disabled={disabled}
                    label="Text align"
                    value={caption.style.textAlign}
                    onValueChange={(textAlign) => style({ textAlign })}
                    options={[
                      {
                        value: 'auto',
                        label: 'Auto align',
                        tooltip: 'Auto align · follows the layer anchor',
                        content: <AlignAuto />,
                      },
                      {
                        value: 'left',
                        label: 'Align left',
                        tooltip: 'Align left',
                        content: <AlignLeft aria-hidden="true" />,
                      },
                      {
                        value: 'center',
                        label: 'Align center',
                        tooltip: 'Align center',
                        content: <AlignCenter aria-hidden="true" />,
                      },
                      {
                        value: 'right',
                        label: 'Align right',
                        tooltip: 'Align right',
                        content: <AlignRight aria-hidden="true" />,
                      },
                    ]}
                  />
                  <div
                    role="group"
                    aria-label="Font style"
                    className="control-segments grid control-height grid-cols-2 gap-1 px-1"
                  >
                    <Tooltip
                      content={
                        supportsBold(caption.style.fontFamily)
                          ? 'Bold'
                          : 'Bold is unavailable for this font'
                      }
                    >
                      <IconButton
                        label="Bold"
                        aria-pressed={
                          supportsBold(caption.style.fontFamily) &&
                          caption.style.fontWeight === 700
                        }
                        disabled={disabled}
                        aria-disabled={!supportsBold(caption.style.fontFamily)}
                        title=""
                        className={`control-segment h-full w-full aria-disabled:opacity-40 aria-disabled:cursor-default ${supportsBold(caption.style.fontFamily) && caption.style.fontWeight === 700 ? 'control-selected' : ''}`}
                        onClick={() => {
                          if (!supportsBold(caption.style.fontFamily)) return;
                          style({
                            fontWeight:
                              caption.style.fontWeight === 700 ? 400 : 700,
                          });
                        }}
                      >
                        <Bold aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      content={
                        supportsItalic(
                          caption.style.fontFamily,
                          caption.style.fontWeight,
                        )
                          ? 'Italic'
                          : 'Italic is unavailable for this font'
                      }
                    >
                      <IconButton
                        label="Italic"
                        disabled={disabled}
                        aria-disabled={
                          !supportsItalic(
                            caption.style.fontFamily,
                            caption.style.fontWeight,
                          )
                        }
                        title=""
                        aria-pressed={effectiveFontStyle(caption) === 'italic'}
                        className={`control-segment h-full w-full aria-disabled:opacity-40 aria-disabled:cursor-default ${effectiveFontStyle(caption) === 'italic' ? 'control-selected' : ''}`}
                        onClick={() => {
                          if (
                            !supportsItalic(
                              caption.style.fontFamily,
                              caption.style.fontWeight,
                            )
                          )
                            return;
                          style({
                            fontStyle:
                              effectiveFontStyle(caption) === 'italic'
                                ? 'normal'
                                : 'italic',
                          });
                        }}
                      >
                        <Italic aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </InlineInputGroup>
                <ColorControls
                  value={caption.style.color}
                  onChange={(color) => style({ color })}
                  onBrowse={onBrowseColors}
                  selectionSource={colorSelectionSource}
                  onSelectionSourceChange={onColorSelectionSourceChange}
                  disabled={disabled}
                />
                <RangeField
                  label="Opacity"
                  icon={<Blend className="size-4" aria-hidden="true" />}
                  tooltip="Text opacity"
                  value={opacity}
                  onValueChange={(value) => style({ opacity: value / 100 })}
                  unit="%"
                  disabled={disabled}
                />
              </fieldset>
            </InspectorSection>
          )}
          <BlendingControls
            caption={caption}
            onChange={onChange}
            disabled={disabled}
          />
        </>
      )}
    </>
  );
}

export { CaptionPositionControls } from './position-controls';
