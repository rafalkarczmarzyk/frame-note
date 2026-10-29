import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import {
  addCaption,
  createCaptionLayout,
  moveLayer,
  removeCaption,
  toggleLayerVisibility,
  type CaptionLayout,
} from '@/domain/caption-layout';
import { createCaption } from '@/domain/document';
import { builtinIcons } from '../caption/builtin-icons';
import pngSource from '../../../tests/fixtures/logos/rt.png';
import { LayerList } from './layer-list';
import { CompactLayerListConcept } from './compact-layer-list-concept';

const base = createCaptionLayout(createCaption()).containers[0]!;
const svg = builtinIcons[0]!;
const examples: CaptionLayout = {
  ...createCaptionLayout(),
  activeId: 'tags',
  containers: [
    { ...base, id: 'empty', template: '' },
    { ...base, id: 'hidden', template: 'Hidden signature', visible: false },
    {
      ...base,
      id: 'long',
      template:
        'A very long caption with text and {exif:AnUnusuallyLongMetadataFieldNameThatShouldNeverBreakTheSidebar} and more words to demonstrate truncation.',
    },
    {
      ...base,
      id: 'png',
      template: '{image:png:2:font:original}',
      images: [
        {
          id: 'png',
          name: 'Signature.png',
          format: 'png',
          source: pngSource,
          width: 200,
          height: 100,
        },
      ],
    },
    {
      ...base,
      id: 'mixed',
      template: 'Photo {author} {icon:camera} {image:logo:2:font:single}',
      images: [
        {
          id: 'logo',
          name: 'FrameNote.svg',
          format: 'svg',
          source: svg.svg,
          width: svg.aspect,
          height: 1,
        },
      ],
      position: { anchor: 'center', custom: { x: 50, y: 45 } },
    },
    { ...base, id: 'text', template: 'Made with FrameNote' },
    {
      ...base,
      id: 'similar',
      template: '{author}\n{lens}\n{exposure}',
      position: { anchor: 'top-right' },
    },
    { ...base, id: 'tags', template: '{author}\n{lens}\n{exposure}' },
  ],
};

function Example({
  width = 360,
  initialLayout = examples,
  controlsLayout = 'inline',
  concept = false,
}: {
  concept?: boolean;
  controlsLayout?: 'inline' | 'grid';
  width?: number;
  initialLayout?: CaptionLayout;
}) {
  const [layout, setLayout] = useState(initialLayout);
  if (concept)
    return (
      <CompactLayerListConcept initialLayout={initialLayout} width={width} />
    );
  const fields = [
    {
      key: 'exif:Artist',
      group: 'exif',
      name: 'Artist',
      displayValue: 'Alex Morgan',
      rawValue: 'Alex Morgan',
    },
  ];
  return (
    <div style={{ width, maxWidth: '100%' }} className="bg-sidebar-base py-1">
      <SidebarSection
        id="layer-list-demo"
        title="Layers"
        icon={<Layers />}
        iconTone="caption"
      >
        <LayerList
          controlsLayout={controlsLayout}
          layout={layout}
          fields={fields}
          icons={builtinIcons}
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
        <Button
          className="mt-3"
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
      </SidebarSection>
    </div>
  );
}
const meta = {
  title: 'Layers/LayerList',
  component: Example,
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ContentAndStates: Story = {};
export const Narrow: Story = { args: { width: 300 } };
export const SingleLayer: Story = {
  args: {
    initialLayout: { ...examples, containers: [examples.containers.at(-1)!] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Layer 1 actions' }),
    );
    for (const name of [
      'Move up',
      'Move down',
      'Bring to front',
      'Send to back',
    ]) {
      await expect(body.getByRole('menuitem', { name })).toBeDisabled();
    }
    await userEvent.keyboard('{Escape}');
  },
};
export const Empty: Story = {
  args: { initialLayout: { ...examples, activeId: null, containers: [] } },
};
export const Actions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Layer 1 actions' }),
    );
    await expect(body.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.getByRole('button', { name: 'Layer 1 actions' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(
      canvas.getAllByRole('button', { name: /Layer \d+ actions/u }),
    ).toHaveLength(9);
  },
};

export const OrderActions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Layer 1 actions' }),
    );
    await userEvent.click(body.getByRole('menuitem', { name: 'Send to back' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Layer 8 actions' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Bring to front' }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Layer 1 actions' }),
      ).toHaveFocus(),
    );
  },
};

export const GroupedControls: Story = { args: { controlsLayout: 'grid' } };
export const GroupedControlsNarrow: Story = {
  args: { controlsLayout: 'grid', width: 300 },
};
export const GroupedOrderActions: Story = {
  ...OrderActions,
  args: { controlsLayout: 'grid' },
};
export const ControlsComparison: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <p className="mb-2 text-xs text-content-secondary">
          Previous · content previews
        </p>
        <Example />
      </div>
      <div>
        <p className="mb-2 text-xs text-content-secondary">
          Current · compact list
        </p>
        <Example concept />
      </div>
    </div>
  ),
};

export const CleanList: Story = { args: { concept: true } };
export const CleanListNarrow: Story = { args: { concept: true, width: 300 } };
export const CleanListEmpty: Story = {
  args: {
    concept: true,
    initialLayout: { ...examples, activeId: null, containers: [] },
  },
};
export const CleanListInteractions: Story = {
  args: { concept: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getAllByRole('img', { name: /Anchor:|Manual position/u }),
    ).toHaveLength(8);
    await expect(
      canvas.getByRole('img', { name: 'Manual position' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'author · lens · exposure' })[1]!,
    );
    await expect(
      canvas.getByRole('img', { name: 'Anchor: top right' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Hide layer 2' }));
    await expect(
      canvas.getByRole('button', { name: 'Show layer 2' }),
    ).toBeVisible();
    const mixed = canvas.getByRole('button', {
      name: 'Photo · author · camera · FrameNote.svg',
    });
    await userEvent.click(mixed);
    await expect(
      canvas.getByRole('img', { name: 'Manual position' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Layer 4 actions' }),
    );
    await userEvent.click(body.getByRole('menuitem', { name: 'Move down' }));
    await expect(mixed).toHaveAttribute('aria-pressed', 'true');
    mixed.focus();
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(mixed).toHaveFocus());
    await expect(
      canvas.getAllByRole('button', { name: /Photo · author/u })[0],
    ).toHaveAttribute('aria-pressed', 'true');
  },
};
export const CleanListDeleteLast: Story = {
  args: {
    concept: true,
    initialLayout: { ...examples, containers: [examples.containers.at(-1)!] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Layer 1 actions' }),
    );
    await userEvent.click(body.getByRole('menuitem', { name: 'Delete' }));
    await expect(canvas.getByText('Add a layer to begin.')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Layer 1 actions' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Add layer' })).toHaveFocus(),
    );
  },
};

/** Accepted material, rendered by the same component as the application. */
export const LiquidGlass: Story = {
  args: {
    concept: true,
    width: 384,
    initialLayout: {
      ...examples,
      containers: [
        examples.containers[4]!,
        examples.containers[7]!,
        examples.containers[1]!,
      ],
    },
  },
};

export const LiquidGlassPrimary: Story = {
  render: () => (
    <div className="layer-selector-primary-preview">
      <Example
        concept
        width={384}
        initialLayout={{
          ...examples,
          containers: [
            examples.containers[4]!,
            examples.containers[7]!,
            examples.containers[1]!,
          ],
        }}
      />
    </div>
  ),
};
