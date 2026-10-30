import { filterByCategory } from '@/lib/category-filter';
import {
  Layers,
  Camera,
  Aperture,
  Timer,
  Focus,
  Ruler,
  Sun,
  UserRound,
  Copyright,
  CalendarDays,
  SlidersHorizontal,
} from 'lucide-react';
import { PickerList } from '@/components/ui/picker-list';
import { metadataGroups } from '../../../../core/src/caption-tags';
import type { MetadataField } from '../../../../core/src/metadata';

const helperIcons = {
  author: UserRound,
  camera: Camera,
  lens: Focus,
  shutter: Timer,
  shutterDuration: Timer,
  aperture: Aperture,
  iso: Sun,
  focalLength: Ruler,
  date: CalendarDays,
  copyright: Copyright,
  exposure: SlidersHorizontal,
  heliconStack: SlidersHorizontal,
  heliconStackCount: Layers,
};
function helperIcon(key: string) {
  const Icon = helperIcons[key as keyof typeof helperIcons];
  return Icon ? (
    <Icon aria-hidden="true" className="size-4 shrink-0" />
  ) : undefined;
}

export function MetadataPicker({
  fields,
  query,
  used,
  onChoose,
  category = 'all',
}: {
  fields: readonly MetadataField[];
  query: string;
  category?: string;
  used: ReadonlySet<string>;
  onChoose: (key: string) => void;
}) {
  const groups = filterByCategory(
    metadataGroups(fields, query),
    category,
    (group) => [group.name],
  );
  return (
    <div className="space-y-4">
      {groups.length === 0 && (
        <p className="p-3 text-xs text-content-secondary">
          No matching metadata.
        </p>
      )}
      {groups.map((group) => (
        <section
          key={group.name}
          aria-label={
            group.name === 'FrameNote' ? 'FrameNote' : group.name.toUpperCase()
          }
        >
          <h3 className="px-3 py-2 text-xs font-semibold text-label">
            {group.name === 'FrameNote' ? group.name : group.name.toUpperCase()}
          </h3>
          <PickerList
            items={group.fields.map((field) => ({
              id: field.key,
              label: field.key,
              leading:
                group.name === 'FrameNote' ? helperIcon(field.key) : undefined,
              selected: used.has(field.key),
              description: field.displayValue || 'No data in this photo.',
              preview:
                'sources' in field && field.sources.length > 0 ? (
                  <span className="block break-words text-[11px] text-content-muted">
                    Source: {field.sources.join(', ')}
                  </span>
                ) : undefined,
            }))}
            selectedLabel="Used"
            onChoose={onChoose}
          />
        </section>
      ))}
    </div>
  );
}
