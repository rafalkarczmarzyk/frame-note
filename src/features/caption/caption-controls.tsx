import { toPixels } from '@/domain/sizing';
import { anchoredPosition, customPoint } from './layout';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { captionColorLabel } from '@/domain/caption-colors';
import { HelperText } from '@/components/ui/helper-text';
import { SidebarSection } from '@/components/layout/sidebar-section';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronRight,
  Ruler,
  Type,
  Move,
} from 'lucide-react';
import { Field } from '@/components/ui/field';
import { NumberField } from '@/components/ui/number-field';
import { Select } from '@/components/ui/select';
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
  return (
    <>
      {scope !== 'local' && (
        <SidebarSection
          id={`${preferenceScope}sizing`}
          persist={persistSections}
          title="Sizing"
          iconTone="sizing"
          icon={<Ruler />}
        >
          <Field
            label="Sizing unit"
            hint={`1 unit = ${Number(factor.toFixed(4))} px on this photo. Changing units preserves the current appearance.`}
          >
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
        </SidebarSection>
      )}
      {scope !== 'global' && (
        <>
          {' '}
          {!hideTypography && (
            <SidebarSection
              id={`${preferenceScope}typography`}
              persist={persistSections}
              title="Typography"
              iconTone="typography"
              icon={<Type />}
            >
              <fieldset
                disabled={disabled}
                className="space-y-4 disabled:opacity-70"
              >
                <Field label="Font">
                  {(id) => (
                    <button
                      type="button"
                      id={id}
                      aria-haspopup="dialog"
                      onClick={onBrowseFonts}
                      className="control-field flex h-9 w-full items-center justify-between px-3 text-xs"
                    >
                      <span>
                        {caption.style.fontFamily.replace(' Variable', '')}
                      </span>
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Weight">
                    {(id) => (
                      <Select
                        id={id}
                        disabled={disabled}
                        value={String(caption.style.fontWeight)}
                        onValueChange={(value) =>
                          style({ fontWeight: Number(value) as 400 | 700 })
                        }
                        options={[
                          { value: '400', label: 'Regular' },
                          { value: '700', label: 'Bold' },
                        ]}
                      />
                    )}
                  </Field>
                  <NumberField
                    key={caption.sizingUnit}
                    label="Font size"
                    unit={unit}
                    value={caption.style.fontSize}
                    min={0.01 / factor}
                    max={Math.max(dimensions.width, dimensions.height) / factor}
                    step="any"
                    disabled={disabled}
                    onValueChange={(fontSize) => style({ fontSize })}
                  />
                </div>
                <Field label="Color">
                  {(id) => (
                    <button
                      type="button"
                      id={id}
                      aria-haspopup="dialog"
                      onClick={(event) => {
                        // Safari does not focus buttons on pointer clicks.
                        event.currentTarget.focus({ preventScroll: true });
                        onBrowseColors();
                      }}
                      className="control-field flex h-9 w-full items-center gap-2 px-3 text-xs"
                    >
                      <ColorSwatch value={caption.style.color} />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {captionColorLabel(caption.style.color)}
                      </span>
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </Field>
                <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3">
                  <div className="space-y-2">
                    <p className="text-xs text-label">Opacity</p>
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
                <NumberField
                  label="Line height"
                  hint="Multiplies the font size. For example, 1.4× with a 20 px font gives a 28 px line height."
                  unit="×"
                  value={caption.style.lineHeight}
                  min={0.5}
                  max={3}
                  disabled={disabled}
                  onValueChange={(lineHeight) => style({ lineHeight })}
                />
                <div className="space-y-2">
                  <p className="text-xs text-label">Text align</p>
                  <SegmentedControl
                    disabled={disabled}
                    label="Text align"
                    value={caption.style.textAlign}
                    onValueChange={(textAlign) => style({ textAlign })}
                    options={[
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
                </div>
              </fieldset>
            </SidebarSection>
          )}
          <SidebarSection
            id={`${preferenceScope}position`}
            persist={persistSections}
            title="Position"
            iconTone="position"
            icon={<Move />}
          >
            <fieldset
              disabled={disabled}
              className="space-y-5 disabled:opacity-70"
            >
              <SegmentedControl
                label="Position mode"
                value={caption.position.custom ? 'custom' : 'anchor'}
                disabled={disabled}
                options={[
                  { value: 'anchor', label: 'Anchor' },
                  { value: 'custom', label: 'Custom' },
                ]}
                onValueChange={(mode) => {
                  if (mode === 'anchor') position({ custom: undefined });
                  else {
                    const margins = {
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
                    };
                    position({
                      custom: customPoint(
                        dimensions,
                        { width: 0, height: 0 },
                        caption.position.anchor,
                        anchoredPosition(
                          dimensions,
                          { width: 0, height: 0 },
                          caption.position.anchor,
                          margins,
                        ),
                      ),
                    });
                  }
                }}
              />
              {caption.position.custom && (
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="X position"
                    unit="%"
                    value={caption.position.custom.x}
                    min={0}
                    max={100}
                    step="any"
                    disabled={disabled}
                    onValueChange={(x) =>
                      position({ custom: { ...caption.position.custom!, x } })
                    }
                  />
                  <NumberField
                    label="Y position"
                    unit="%"
                    value={caption.position.custom.y}
                    min={0}
                    max={100}
                    step="any"
                    disabled={disabled}
                    onValueChange={(y) =>
                      position({ custom: { ...caption.position.custom!, y } })
                    }
                  />
                </div>
              )}
              <HelperText>
                {caption.position.custom
                  ? 'X/Y locate the last anchor point within the full photo. Global margins do not affect Custom position. Switch to Anchor mode to use the anchor grid.'
                  : 'Drag the caption on the photo to set a custom position.'}
              </HelperText>
              {!caption.position.custom && (
                <div className="space-y-2">
                  <p className="text-xs text-label">Anchor</p>
                  <div className="flex justify-center">
                    <AnchorPicker
                      value={caption.position.anchor}
                      onValueChange={(anchor) =>
                        position({ anchor, custom: undefined })
                      }
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}
            </fieldset>
          </SidebarSection>
        </>
      )}
      {scope !== 'local' && (
        <SidebarSection
          id={`${preferenceScope}margins`}
          persist={persistSections}
          title="Margins"
          iconTone="sizing"
          icon={<Ruler />}
        >
          <fieldset
            disabled={disabled}
            className="space-y-4 disabled:opacity-70"
          >
            <MarginEditor
              hideLabel
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
            <HelperText>
              Margins define the inner photo area. The anchor positions the
              caption within it.
            </HelperText>
          </fieldset>
        </SidebarSection>
      )}
    </>
  );
}
