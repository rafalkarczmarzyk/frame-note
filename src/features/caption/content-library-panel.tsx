import { useState } from 'react';
import {
  Tags,
  Aperture,
  Shapes,
  SeparatorHorizontal,
  Plus,
} from 'lucide-react';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { CategoryFilter } from '@/components/ui/category-filter';
import { PickerList } from '@/components/ui/picker-list';
import { metadataGroups } from '@/domain/caption-tags';
import type { MetadataField } from '@/domain/metadata';
import type { ImageAsset } from '@/domain/inline-image';
import type { SvgIcon } from './svg-icons';
import { MetadataPicker } from './metadata-picker';
import { GraphicsPickerContent } from './graphics-picker-panel';

export type ContentCategory = 'metadata' | 'icons' | 'graphics' | 'separators';
const categories = [
  { value: 'metadata' as const, label: 'Metadata', Icon: Tags },
  { value: 'icons' as const, label: 'Icons', Icon: Aperture },
  { value: 'graphics' as const, label: 'Graphics', Icon: Shapes },
  {
    value: 'separators' as const,
    label: 'Separators',
    Icon: SeparatorHorizontal,
  },
];
export function ContentLibraryPanel({
  category,
  onCategory,
  fields,
  used,
  icons,
  images,
  onChooseToken,
  onChooseGraphic,
  onUploadGraphic,
  onSeparator,
  onClose,
  className,
}: {
  category: ContentCategory;
  onCategory: (category: ContentCategory) => void;
  fields: readonly MetadataField[];
  used: ReadonlySet<string>;
  icons: readonly SvgIcon[];
  images: readonly ImageAsset[];
  onChooseToken: (token: string) => void;
  onChooseGraphic: (asset: ImageAsset) => void;
  onUploadGraphic: () => void;
  onSeparator: () => void;
  onClose: () => void;
  className?: string;
}) {
  const [queries, setQueries] = useState({
    metadata: '',
    icons: '',
    graphics: '',
    separators: '',
  });
  const [metadataCategory, setMetadataCategory] = useState('all');
  const query = queries[category];
  const groups = metadataGroups(fields, query);
  const count = groups
    .filter(
      (group) => metadataCategory === 'all' || group.name === metadataCategory,
    )
    .reduce((sum, group) => sum + group.fields.length, 0);
  return (
    <FloatingPanel
      id="auxiliary-panel"
      title="Add content"
      description="Insert at the text cursor."
      surface="solid"
      onClose={onClose}
      className={className}
      toolbar={
        <div className="space-y-3">
          <div
            role="group"
            aria-label="Content categories"
            className="control-segments grid !h-auto grid-cols-2 gap-1"
          >
            {categories.map(({ value, label, Icon }) => (
              <Tooltip key={value} content={`Browse ${label.toLowerCase()}`}>
                <button
                  type="button"
                  aria-pressed={category === value}
                  data-state={category === value ? 'on' : 'off'}
                  onClick={() => onCategory(value)}
                  className="control-segment flex h-9 items-center justify-center gap-2 px-2 text-xs"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </button>
              </Tooltip>
            ))}
          </div>
          {category !== 'separators' && (
            <Input
              aria-label={`Search ${category}`}
              placeholder={
                category === 'metadata'
                  ? 'Search fields or values…'
                  : `Search ${category}…`
              }
              value={query}
              onChange={(event) =>
                setQueries({ ...queries, [category]: event.target.value })
              }
            />
          )}
          {category === 'metadata' && (
            <>
              <CategoryFilter
                label="Tag categories"
                value={metadataCategory}
                onValueChange={setMetadataCategory}
                categories={metadataGroups(fields, '').map((group) => ({
                  value: group.name,
                  label:
                    group.name === 'FrameNote'
                      ? group.name
                      : group.name.toUpperCase(),
                }))}
              />
              <p className="text-xs text-content-secondary">{count} tags</p>
            </>
          )}
        </div>
      }
    >
      {category === 'metadata' && (
        <MetadataPicker
          fields={fields}
          used={used}
          category={metadataCategory}
          query={query}
          onChoose={onChooseToken}
        />
      )}
      {(category === 'icons' || category === 'graphics') && (
        <GraphicsPickerContent
          tab={category}
          query={query}
          icons={icons}
          images={images}
          onChooseIcon={(name) => onChooseToken(`icon:${name}`)}
          onChooseGraphic={onChooseGraphic}
          onUploadGraphic={onUploadGraphic}
        />
      )}
      {category === 'separators' && (
        <div className="space-y-3">
          <PickerList
            items={[
              {
                id: 'horizontal',
                label: 'Horizontal separator',
                description: 'Solid line · Flex width',
                leading: (
                  <SeparatorHorizontal aria-hidden="true" className="size-6" />
                ),
                trailing: <Plus aria-hidden="true" className="size-4" />,
              },
            ]}
            onChoose={onSeparator}
          />
          <p className="text-xs text-content-secondary">
            Insert with default settings. Select it in the editor to change its
            appearance.
          </p>
        </div>
      )}
    </FloatingPanel>
  );
}
