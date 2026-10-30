import { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import {
  addCaption,
  moveLayer,
  removeCaption,
  toggleLayerVisibility,
  type CaptionLayout,
} from '../../../../core/src/caption-layout';
import { LayerList } from './layer-list';

/** Review composition using the same compact list and interactions as the app. */
export function CompactLayerListConcept({
  initialLayout,
  width = 360,
}: {
  initialLayout: CaptionLayout;
  width?: number;
}) {
  const [layout, setLayout] = useState(initialLayout);
  return (
    <div style={{ width, maxWidth: '100%' }} className="bg-sidebar-base py-1">
      <SidebarSection
        id="compact-layers-concept"
        title="Layers"
        icon={<Layers />}
        iconTone="caption"
        contentPadding="none"
      >
        <LayerList
          appearance="compact"
          layout={layout}
          fields={[]}
          icons={[]}
          onChoose={(id) => setLayout((value) => ({ ...value, activeId: id }))}
          onHover={() => {}}
          onMove={(id, index) =>
            setLayout((value) => moveLayer(value, id, index))
          }
          onToggleVisibility={(id) =>
            setLayout((value) => toggleLayerVisibility(value, id))
          }
          onDuplicate={(id) =>
            setLayout((value) =>
              addCaption(
                { ...value, activeId: id },
                crypto.randomUUID(),
                true,
                { width: 1200, height: 800 },
              ),
            )
          }
          onDelete={(id) => setLayout((value) => removeCaption(value, id))}
        />
        <div className="flex flex-wrap gap-2 px-4 pt-3 pb-4">
          <Button
            data-add-layer=""
            variant="outline"
            size="sm"
            onClick={() =>
              setLayout((value) =>
                addCaption(value, crypto.randomUUID(), false, {
                  width: 1200,
                  height: 800,
                }),
              )
            }
          >
            <Plus aria-hidden="true" />
            Add layer
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={
              !layout.containers.some((layer) => layer.id === layout.activeId)
            }
            onClick={() =>
              setLayout((value) =>
                value.activeId ? removeCaption(value, value.activeId) : value,
              )
            }
          >
            <Trash2 aria-hidden="true" />
            Remove layer
          </Button>
        </div>
      </SidebarSection>
    </div>
  );
}
