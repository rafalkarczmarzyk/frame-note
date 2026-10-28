import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { PickerList } from '@/components/ui/picker-list';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ImageAsset } from '@/domain/inline-image';
import { ImagePlus } from 'lucide-react';
import { builtinIcons } from './builtin-icons';
import { builtinGraphics } from './builtin-graphics';
import { imageSource } from './image-assets';
import { svgUrl, type SvgIcon } from './svg-icons';

export function GraphicsPickerPanel({
  icons,
  images,
  onChooseIcon,
  onChooseGraphic,
  onUploadGraphic,
  onClose,
  className,
}: {
  icons: readonly SvgIcon[];
  images: readonly ImageAsset[];
  onChooseIcon: (name: string) => void;
  onChooseGraphic: (asset: ImageAsset) => void;
  onUploadGraphic: () => void;
  onClose: () => void;
  className?: string;
}) {
  const [tab, setTab] = useState<'icons' | 'graphics'>('icons');
  const assets = [
    ...builtinGraphics,
    ...images.filter(
      (image) => !builtinGraphics.some((builtin) => builtin.id === image.id),
    ),
  ];

  return (
    <FloatingPanel
      id="auxiliary-panel"
      title="Graphics"
      description={
        tab === 'icons'
          ? 'Choose an icon to insert. Icons inherit the caption size and color.'
          : 'Choose a built-in graphic or add an SVG or PNG at the text cursor.'
      }
      onClose={onClose}
      surface="solid"
      className={className}
      toolbar={
        <SegmentedControl
          label="Graphics category"
          value={tab}
          onValueChange={setTab}
          options={[
            { value: 'icons', label: 'Icons' },
            { value: 'graphics', label: 'Graphics' },
          ]}
        />
      }
    >
      {tab === 'icons' ? (
        ['Built-in', 'Your SVGs'].map((group) => {
          const items = icons.filter(
            (icon) =>
              builtinIcons.some((builtin) => builtin.name === icon.name) ===
              (group === 'Built-in'),
          );
          if (!items.length) return null;
          return (
            <section key={group} aria-label={group} className="mb-4">
              <h3 className="px-3 py-2 text-xs text-label">{group}</h3>
              <PickerList
                items={items.map((icon) => ({
                  id: icon.name,
                  label: icon.name,
                  description: `{icon:${icon.name}}`,
                  leading: (
                    <span
                      aria-hidden="true"
                      className="inline-block size-5 shrink-0 bg-current"
                      style={{
                        maskImage: `url("${svgUrl(icon.svg)}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      }}
                    />
                  ),
                }))}
                onChoose={onChooseIcon}
                emptyText="No icons available."
              />
            </section>
          );
        })
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            className="mb-3 w-full"
            onClick={onUploadGraphic}
          >
            <ImagePlus aria-hidden="true" />
            Upload SVG / PNG
          </Button>
          <section aria-label="Available graphics">
            <PickerList
              items={assets.map((asset) => ({
                id: asset.id,
                label: asset.name,
                description: `${asset.format.toUpperCase()} · Insert at text cursor`,
                leading: (
                  <img
                    src={imageSource(asset)}
                    alt=""
                    className="h-6 w-10 shrink-0 object-contain"
                  />
                ),
              }))}
              onChoose={(id) => {
                const asset = assets.find((item) => item.id === id);
                if (asset) onChooseGraphic(asset);
              }}
              emptyText="No graphics available."
            />
          </section>
        </>
      )}
    </FloatingPanel>
  );
}
