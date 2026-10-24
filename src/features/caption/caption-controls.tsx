import { SidebarSection } from '@/components/layout/sidebar-section';
import { AlignLeft, AlignCenter, AlignRight, ChevronRight } from 'lucide-react';
import { Field } from '@/components/ui/field';
import { NumberField } from '@/components/ui/number-field';
import { Select } from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AnchorPicker } from '@/components/ui/anchor-picker';
import type { Caption } from '../../domain/document';

export function CaptionControls({
  caption,
  onChange,
  disabled,
  onBrowseFonts,
  preferenceScope = '',
  persistSections = true,
}: {
  caption: Caption;
  onChange: (caption: Caption) => void;
  disabled: boolean;
  onBrowseFonts: () => void;
  preferenceScope?: string;
  persistSections?: boolean;
}) {
  const style = (patch: Partial<Caption['style']>) =>
    onChange({ ...caption, style: { ...caption.style, ...patch } });
  const position = (patch: Partial<Caption['position']>) =>
    onChange({ ...caption, position: { ...caption.position, ...patch } });
  return (
    <>
      <SidebarSection
        id={`${preferenceScope}typography`}
        persist={persistSections}
        title="Typography"
        summary={`${caption.style.fontFamily.replace(' Variable', '')}, ${caption.style.fontSizePercent}%`}
      >
        <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70">
          <Field label="Font">
            {(id) => (
              <button
                type="button"
                id={id}
                aria-haspopup="dialog"
                onClick={onBrowseFonts}
                className="control-field flex h-9 w-full items-center justify-between px-3 text-xs"
              >
                <span>{caption.style.fontFamily.replace(' Variable', '')}</span>
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight">
              {(id) => (
                <Select
                  disabled={disabled}
                  id={id}
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
              label="Size (% short edge)"
              value={caption.style.fontSizePercent}
              min={0.01}
              max={20}
              onValueChange={(fontSizePercent) => style({ fontSizePercent })}
            />
            <Field label="Color">
              {(id) => (
                <Select
                  disabled={disabled}
                  id={id}
                  value={caption.style.color}
                  onValueChange={(color) => style({ color })}
                  options={[
                    { value: 'porcelain', label: 'Porcelain' },
                    { value: 'charcoal', label: 'Charcoal' },
                    { value: 'slate', label: 'Slate' },
                    { value: 'tropical-mint', label: 'Tropical mint' },
                  ]}
                />
              )}
            </Field>
            <NumberField
              label="Opacity (%)"
              value={Math.round(caption.style.opacity * 100)}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => style({ opacity: value / 100 })}
            />
            <NumberField
              label="Line height"
              value={caption.style.lineHeight}
              min={0.5}
              max={3}
              onValueChange={(lineHeight) => style({ lineHeight })}
            />
            <div className="space-y-2">
              <p className="text-xs text-foreground/75">Text align</p>
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
          </div>
        </fieldset>
      </SidebarSection>
      <SidebarSection
        id={`${preferenceScope}position`}
        persist={persistSections}
        title="Position"
        summary={caption.position.anchor.replaceAll('-', ' ')}
      >
        <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70">
          <div className="space-y-2">
            <p className="text-xs text-foreground/75">Anchor</p>
            <AnchorPicker
              value={caption.position.anchor}
              onValueChange={(anchor) => position({ anchor })}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Margin X (%)"
              value={caption.position.marginXPercent}
              min={0}
              max={50}
              onValueChange={(marginXPercent) => position({ marginXPercent })}
            />
            <NumberField
              label="Margin Y (%)"
              value={caption.position.marginYPercent}
              min={0}
              max={50}
              onValueChange={(marginYPercent) => position({ marginYPercent })}
            />
          </div>
          <p className="text-xs leading-5 text-foreground/70">
            Size and margins use the photo’s shorter edge. Anchors move the
            block; text alignment controls lines inside it.
          </p>
        </fieldset>
      </SidebarSection>
    </>
  );
}
