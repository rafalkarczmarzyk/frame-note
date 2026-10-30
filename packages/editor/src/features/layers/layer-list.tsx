import { Tooltip } from '@/components/ui/tooltip';
import { useMemo, useRef } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Eye,
  EyeOff,
  Move,
  Trash2,
} from 'lucide-react';
import { PickerList } from '@/components/ui/picker-list';
import { IconButton } from '@/components/ui/icon-button';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { ActionMenu } from '@/components/ui/action-menu';
import { AnchorIcon } from '@/components/ui/anchor-picker';
import { captionTags } from '../../../../core/src/caption-tags';
import type { CaptionLayout } from '../../../../core/src/caption-layout';
import type { MetadataField } from '../../../../core/src/metadata';
import type { SvgIcon } from '../caption/svg-icons';
import { parseImageToken } from '../../../../core/src/inline-image';
import { templateInline } from '../caption/editor/template-document';
import { imageSource } from '../caption/image-assets';
import { svgUrl } from '../caption/svg-icons';
import { LayerContentPreview } from './layer-content-preview';
import { layerContentLabel, layerSummary } from './layer-content-label';

export function LayerList({
  layout,
  fields,
  icons,
  onChoose,
  onHover,
  onMove,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  controlsLayout = 'inline',
  appearance = 'preview',
}: {
  appearance?: 'compact' | 'preview';
  controlsLayout?: 'inline' | 'grid';
  layout: CaptionLayout;
  fields: readonly MetadataField[];
  icons: readonly SvgIcon[];
  onChoose: (id: string) => void;
  onHover: (id: string | null) => void;
  onMove: (id: string, index: number) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const moveFromMenu = (id: string, index: number) => {
    onMove(id, index);
    requestAnimationFrame(() => {
      const trigger = root.current?.querySelector<HTMLButtonElement>(
        `[data-picker-row="${index}"] button[aria-haspopup="menu"]`,
      );
      trigger?.focus({ preventScroll: true });
      trigger?.scrollIntoView({ block: 'nearest' });
    });
  };
  const values = useMemo(
    () =>
      Object.fromEntries(
        [...captionTags(fields), ...fields].map((field) => [
          field.key,
          field.displayValue,
        ]),
      ),
    [fields],
  );
  return (
    <div
      ref={root}
      className={
        appearance === 'compact'
          ? 'layer-selector'
          : 'max-h-80 overflow-y-auto overscroll-contain'
      }
    >
      <PickerList
        controlsLayout={controlsLayout}
        appearance={appearance === 'compact' ? 'compact' : 'default'}
        reorderHandle={appearance === 'compact' ? 'row' : 'grip'}
        onMove={onMove}
        onChoose={onChoose}
        onHover={onHover}
        selectionTone="container"
        selectedLabel=""
        emptyText="Add a layer to begin."
        items={[...layout.containers].reverse().map((container, index) => {
          const nodes = templateInline(container.template.trim());
          const reference =
            nodes.length === 1 && nodes[0]?.type === 'captionToken'
              ? parseImageToken(String(nodes[0].attrs?.token))
              : null;
          const image =
            reference &&
            container.images?.find((asset) => asset.id === reference.assetId);
          const thumbnail = container.logo
            ? svgUrl(container.logo.asset.svg)
            : image
              ? imageSource(image)
              : null;
          return {
            id: container.id,
            label:
              appearance === 'compact'
                ? layerSummary(container)
                : layerContentLabel(container),
            leading: (
              <>
                <Tooltip
                  content={
                    container.position.custom
                      ? `Manual position · X ${Number(container.position.custom.x.toFixed(2))}%, Y ${Number(container.position.custom.y.toFixed(2))}%`
                      : `Anchor · ${container.position.anchor.replaceAll('-', ' ')}`
                  }
                >
                  <span
                    className="flex size-6 items-center justify-center text-content-secondary"
                    role="img"
                    aria-label={
                      container.position.custom
                        ? 'Manual position'
                        : `Anchor: ${container.position.anchor.replaceAll('-', ' ')}`
                    }
                  >
                    {container.position.custom ? (
                      <Move aria-hidden="true" className="size-3.5" />
                    ) : (
                      <AnchorIcon
                        value={container.position.anchor}
                        className="size-3.5"
                      />
                    )}
                  </span>
                </Tooltip>
                {appearance === 'compact' && thumbnail && (
                  <img
                    src={thumbnail}
                    alt=""
                    draggable={false}
                    className="h-5 max-w-8 shrink-0 object-contain"
                  />
                )}
              </>
            ),
            content:
              appearance === 'compact' ? undefined : (
                <span className="block min-h-10 rounded-md border border-layer-preview-border bg-layer-preview-base p-2">
                  <LayerContentPreview
                    layer={container}
                    values={values}
                    icons={icons}
                  />
                </span>
              ),
            muted: container.visible === false,
            tooltip: layerContentLabel(container),
            selected: layout.activeId === container.id,
            actions: (
              <InlineInputGroup
                label={`Layer ${index + 1} actions`}
                className="control-segments shrink-0 px-1"
              >
                <IconButton
                  aria-pressed={container.visible !== false}
                  className="control-segment layer-glass-button"
                  label={`${container.visible === false ? 'Show' : 'Hide'} layer ${index + 1}`}
                  onClick={() => onToggleVisibility(container.id)}
                >
                  {container.visible === false ? <EyeOff /> : <Eye />}
                </IconButton>

                <ActionMenu
                  triggerClassName="control-segment layer-glass-button"
                  label={`Layer ${index + 1} actions`}
                  items={[
                    {
                      label: 'Duplicate',
                      icon: <Copy aria-hidden="true" />,
                      onSelect: () => onDuplicate(container.id),
                    },
                    {
                      label: 'Move up',
                      disabledReason: 'This layer is already at the front',
                      icon: <ArrowUp aria-hidden="true" />,
                      disabled: index === 0,
                      separatorBefore: true,
                      onSelect: () => moveFromMenu(container.id, index - 1),
                    },
                    {
                      label: 'Move down',
                      disabledReason: 'This layer is already at the back',
                      icon: <ArrowDown aria-hidden="true" />,
                      disabled: index === layout.containers.length - 1,
                      onSelect: () => moveFromMenu(container.id, index + 1),
                    },
                    {
                      label: 'Bring to front',
                      disabledReason: 'This layer is already at the front',
                      icon: <ArrowUpToLine aria-hidden="true" />,
                      disabled: index === 0,
                      onSelect: () => moveFromMenu(container.id, 0),
                    },
                    {
                      label: 'Send to back',
                      disabledReason: 'This layer is already at the back',
                      icon: <ArrowDownToLine aria-hidden="true" />,
                      disabled: index === layout.containers.length - 1,
                      onSelect: () =>
                        moveFromMenu(
                          container.id,
                          layout.containers.length - 1,
                        ),
                    },
                    {
                      label: 'Delete',
                      separatorBefore: true,
                      icon: <Trash2 aria-hidden="true" />,
                      onSelect: () => {
                        onDelete(container.id);
                        requestAnimationFrame(() => {
                          const target =
                            root.current?.querySelector<HTMLButtonElement>(
                              '[data-picker-choice][aria-pressed="true"]',
                            ) ??
                            root.current?.querySelector<HTMLButtonElement>(
                              '[data-picker-choice]',
                            );
                          if (target) target.focus({ preventScroll: true });
                          else
                            root.current
                              ?.closest('details')
                              ?.querySelector<HTMLButtonElement>(
                                '[data-add-layer]',
                              )
                              ?.focus({ preventScroll: true });
                        });
                      },
                    },
                  ]}
                />
              </InlineInputGroup>
            ),
          };
        })}
      />
    </div>
  );
}
