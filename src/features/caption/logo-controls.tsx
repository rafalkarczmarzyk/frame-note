import { useRef } from 'react';
import { Image as ImageIcon, ChevronRight } from 'lucide-react';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import { NumberField } from '@/components/ui/number-field';
import { Field } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { Slider } from '@/components/ui/slider';
import { captionColorLabel } from '@/domain/caption-colors';
import { pixelsPerUnit, sizingLabels } from '@/domain/sizing';
import type { Caption, ImageDimensions } from '@/domain/document';

export function LogoControls({
  caption,
  dimensions,
  onChange,
  onReplace,
  onBrowseColors,
}: {
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  onReplace: (file: File) => void;
  onBrowseColors: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  if (!caption.logo) return null;
  const logo = caption.logo;
  const factor = pixelsPerUnit(caption.sizingUnit, dimensions);
  const opacity = Math.round(caption.style.opacity * 100);
  const setOpacity = (value: number) =>
    onChange({ ...caption, style: { ...caption.style, opacity: value / 100 } });
  return (
    <SidebarSection
      id="logo"
      title="Logo SVG"
      iconTone="caption"
      icon={<ImageIcon />}
    >
      <p className="mb-3 break-all text-xs text-content-secondary">
        {logo.asset.name}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mb-4 w-full"
        onClick={() => file.current?.click()}
      >
        Replace SVG
      </Button>
      <input
        ref={file}
        className="hidden"
        type="file"
        accept=".svg,image/svg+xml"
        aria-label="Replace SVG logo"
        onChange={(event) => {
          const upload = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (upload) onReplace(upload);
        }}
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Logo width"
            unit={sizingLabels[caption.sizingUnit]}
            min={0.01 / factor}
            max={Math.max(dimensions.width, dimensions.height) / factor}
            step="any"
            value={logo.width}
            onValueChange={(width) =>
              onChange({ ...caption, logo: { ...logo, width } })
            }
          />
          <NumberField
            label="Logo height"
            unit={sizingLabels[caption.sizingUnit]}
            min={0.01 / factor}
            max={Math.max(dimensions.width, dimensions.height) / factor}
            step="any"
            value={logo.width / logo.asset.aspect}
            onValueChange={(height) =>
              onChange({
                ...caption,
                logo: { ...logo, width: height * logo.asset.aspect },
              })
            }
          />
        </div>
        <SegmentedControl
          label="Logo colors"
          value={logo.colorMode}
          options={[
            { value: 'original', label: 'Original colors' },
            { value: 'single', label: 'Single color' },
          ]}
          onValueChange={(colorMode) =>
            onChange({ ...caption, logo: { ...logo, colorMode } })
          }
        />
        {logo.colorMode === 'single' && (
          <Field label="Color">
            {(id) => (
              <button
                type="button"
                id={id}
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true });
                  onBrowseColors();
                }}
                className="control-field flex h-9 w-full items-center gap-2 px-3 text-xs"
              >
                <ColorSwatch value={caption.style.color} />
                <span className="flex-1 text-left">
                  {captionColorLabel(caption.style.color)}
                </span>
                <ChevronRight aria-hidden="true" className="size-3.5" />
              </button>
            )}
          </Field>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3">
          <div className="space-y-2">
            <p className="text-xs text-label">Opacity</p>
            <Slider
              label="Logo opacity"
              min={0}
              max={100}
              value={opacity}
              onValueChange={setOpacity}
            />
          </div>
          <NumberField
            label="Logo opacity value"
            hideLabel
            unit="%"
            min={0}
            max={100}
            value={opacity}
            onValueChange={setOpacity}
          />
        </div>
      </div>
    </SidebarSection>
  );
}
