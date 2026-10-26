import { supportsItalic, effectiveFontStyle } from '@/domain/font-style';
import { AlignAuto } from '@/components/icons/align-auto';
import { InspectorSection } from '@/components/layout/inspector-section';
import { IconButton } from '@/components/ui/icon-button';
import { ColorControls } from './color-controls';
import { toPixels } from '@/domain/sizing';
import { anchoredPosition, customPoint } from './layout';
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
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AnchorPicker } from '@/components/ui/anchor-picker';
import { MarginEditor } from '@/components/ui/margin-editor';
import { Slider } from '@/components/ui/slider';
import {
  convertSizing,
  pixelsPerUnit,
  sizingLabels,
  type SizingUnit,
} from '@/domain/sizing';
import type { Caption, ImageDimensions } from '../../domain/document';

export function CaptionControls({
  caption,
  dimensions,
  onChange,
  disabled,
  onBrowseFonts,
  onBrowseColors,
  preferenceScope = '',
  persistSections = true,
  scope = 'all',
  hideTypography = false,
}: {
  scope?: 'all' | 'local' | 'global';
  hideTypography?: boolean;
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled: boolean;
  onBrowseFonts: () => void;
  onBrowseColors: () => void;
  preferenceScope?: string;
  persistSections?: boolean;
}) {
  const style = (patch: Partial<Caption['style']>) =>
    onChange({ ...caption, style: { ...caption.style, ...patch } });
  const position = (patch: Partial<Caption['position']>) =>
    onChange({ ...caption, position: { ...caption.position, ...patch } });
  const unit = sizingLabels[caption.sizingUnit];
  const factor = pixelsPerUnit(caption.sizingUnit, dimensions);
  const opacity = Math.round(caption.style.opacity * 100);
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

  return (
    <>
      {scope !== 'local' && (
        <SidebarSection
          id={`${preferenceScope}sizing`}
          persist={persistSections}
          title="Sizing & Margins"
          iconTone="sizing"
          icon={<Ruler />}
        >
          <Field label="Sizing unit">
            {(id, descriptionId) => (
              <Select
                id={id}
                aria-describedby={descriptionId}
                value={caption.sizingUnit}
                disabled={disabled}
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
                <div className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1">
                  <Type
                    className="size-4 shrink-0 text-content-secondary"
                    aria-hidden="true"
                  />
                  <Field label="Font" hideLabel>
                    {(id) => (
                      <button
                        type="button"
                        id={id}
                        aria-haspopup="dialog"
                        onClick={onBrowseFonts}
                        className="control-field flex h-9 w-full items-center justify-between px-3 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {caption.style.fontFamily.replace(' Variable', '')}
                        </span>
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <div
                    className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1"
                    title="Font size"
                  >
                    <ALargeSmall
                      className="size-4 shrink-0 text-content-secondary"
                      aria-hidden="true"
                    />
                    <NumberField
                      key={caption.sizingUnit}
                      label="Font size"
                      hideLabel
                      unit={unit}
                      value={caption.style.fontSize}
                      min={0.01 / factor}
                      max={
                        Math.max(dimensions.width, dimensions.height) / factor
                      }
                      step="any"
                      disabled={disabled}
                      onValueChange={(fontSize) => style({ fontSize })}
                    />
                  </div>
                  <div
                    className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1"
                    title="Line spacing: multiplier of font size"
                  >
                    <ArrowDownUp
                      className="size-4 shrink-0 text-content-secondary"
                      aria-hidden="true"
                    />
                    <NumberField
                      label="Line spacing"
                      hideLabel
                      unit="×"
                      value={caption.style.lineHeight}
                      min={0.5}
                      max={3}
                      disabled={disabled}
                      onValueChange={(lineHeight) => style({ lineHeight })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <SegmentedControl
                    disabled={disabled}
                    label="Text align"
                    value={caption.style.textAlign}
                    onValueChange={(textAlign) => style({ textAlign })}
                    options={[
                      {
                        value: 'auto',
                        label: 'Auto align',
                        title: 'Auto — match alignment to anchor',
                        content: <AlignAuto />,
                      },
                      {
                        value: 'left',
                        label: 'Align left',
                        content: <AlignLeft aria-hidden="true" />,
                      },
                      {
                        value: 'center',
                        label: 'Align center',
                        content: <AlignCenter aria-hidden="true" />,
                      },
                      {
                        value: 'right',
                        label: 'Align right',
                        content: <AlignRight aria-hidden="true" />,
                      },
                    ]}
                  />
                  <div
                    role="group"
                    aria-label="Font style"
                    className="control-segments flex gap-1 p-1"
                  >
                    <IconButton
                      label="Bold"
                      aria-pressed={caption.style.fontWeight === 700}
                      disabled={disabled}
                      className={`control-segment size-7 ${caption.style.fontWeight === 700 ? 'control-selected' : ''}`}
                      onClick={() =>
                        style({
                          fontWeight:
                            caption.style.fontWeight === 700 ? 400 : 700,
                        })
                      }
                    >
                      <Bold aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Italic"
                      title={
                        supportsItalic(caption.style.fontFamily)
                          ? 'Italic'
                          : 'Italic unavailable for this font'
                      }
                      disabled={
                        disabled || !supportsItalic(caption.style.fontFamily)
                      }
                      aria-pressed={effectiveFontStyle(caption) === 'italic'}
                      className={`control-segment size-7 ${effectiveFontStyle(caption) === 'italic' ? 'control-selected' : ''}`}
                      onClick={() =>
                        style({
                          fontStyle:
                            effectiveFontStyle(caption) === 'italic'
                              ? 'normal'
                              : 'italic',
                        })
                      }
                    >
                      <Italic aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
                <ColorControls
                  value={caption.style.color}
                  onChange={(color) => style({ color })}
                  onBrowse={onBrowseColors}
                  disabled={disabled}
                  compact
                />
                <div className="grid grid-cols-[auto_minmax(0,1fr)_5rem] items-center gap-2">
                  <span className="text-xs text-label">Opacity</span>
                  <div className="space-y-2">
                    <Slider
                      label="Opacity"
                      value={opacity}
                      min={0}
                      max={100}
                      disabled={disabled}
                      onValueChange={(value) => style({ opacity: value / 100 })}
                    />
                  </div>
                  <NumberField
                    label="Opacity value"
                    hideLabel
                    unit="%"
                    value={opacity}
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled}
                    onValueChange={(value) => style({ opacity: value / 100 })}
                  />
                </div>
              </fieldset>
            </InspectorSection>
          )}
          <InspectorSection title="Position">
            <fieldset
              disabled={disabled}
              className="space-y-2 disabled:opacity-70"
            >
              <SegmentedControl
                label="Position mode"
                value={caption.position.custom ? 'custom' : 'anchor'}
                disabled={disabled}
                options={[
                  { value: 'anchor', label: 'Anchor' },
                  { value: 'custom', label: 'Manual' },
                ]}
                onValueChange={(mode) => {
                  if (mode === 'anchor') position({ custom: undefined });
                  else position({ custom: anchorCoordinates });
                }}
              />
              <div className="grid grid-cols-2 divide-x divide-border-subtle">
                <fieldset
                  disabled={disabled || !!caption.position.custom}
                  aria-label="Anchor position"
                  className="min-w-0 pr-3 disabled:opacity-50"
                >
                  <AnchorPicker
                    value={caption.position.anchor}
                    onValueChange={(anchor) =>
                      position({ anchor, custom: undefined })
                    }
                    disabled={disabled || !!caption.position.custom}
                  />
                </fieldset>
                <fieldset
                  disabled={disabled || !caption.position.custom}
                  aria-label="Manual position"
                  className="min-w-0 space-y-2 pl-3 disabled:opacity-50"
                >
                  <NumberField
                    label="X position"
                    unit="%"
                    value={coordinates.x}
                    min={0}
                    max={100}
                    step="any"
                    disabled={disabled || !caption.position.custom}
                    onValueChange={(x) =>
                      position({ custom: { ...coordinates, x } })
                    }
                  />
                  <NumberField
                    label="Y position"
                    unit="%"
                    value={coordinates.y}
                    min={0}
                    max={100}
                    step="any"
                    disabled={disabled || !caption.position.custom}
                    onValueChange={(y) =>
                      position({ custom: { ...coordinates, y } })
                    }
                  />
                </fieldset>
              </div>
            </fieldset>
          </InspectorSection>
        </>
      )}
    </>
  );
}
