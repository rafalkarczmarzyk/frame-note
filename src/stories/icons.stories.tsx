import { AutoAlign } from '../components/icons/auto-align';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType, SVGProps } from 'react';
import {
  ALargeSmall,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Aperture,
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowUpToLine,
  Bold,
  Italic,
  Bookmark,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Copyright,
  Dot,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Focus,
  GripVertical,
  Image,
  ImagePlus,
  Info,
  Layers,
  LockKeyhole,
  Move,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Ruler,
  Save,
  Scan,
  Settings2,
  Shapes,
  SlidersHorizontal,
  Sun,
  Tag,
  Tags,
  Timer,
  Trash2,
  TriangleAlert,
  Type,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { FrameNoteLogo } from '../components/brand/frame-note-logo';
import { FrameNoteIcon } from '../components/brand/frame-note-icon';
import { PhotoIcon } from '../components/icons/photo-icon';
import { AlignAuto } from '../components/icons/align-auto';

const meta = {
  title: 'Design/Icons',
  parameters: {
    docs: {
      description: {
        component:
          'Icons used in FrameNote, documented by their purpose. Lucide and custom artwork are grouped together by the tools where they belong. This is not the full Lucide catalog.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type IconEntry = {
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  usage: string;
};

const customIcons: IconEntry[] = [
  {
    name: 'AutoAlign',
    Icon: AutoAlign,
    usage:
      'Supplied filled artwork for automatic text alignment; available as an alternative to AlignAuto.',
  },
  {
    name: 'FrameNoteLogo',
    Icon: FrameNoteLogo,
    usage: 'Full brand wordmark in the application header.',
  },
  {
    name: 'FrameNoteIcon',
    Icon: FrameNoteIcon,
    usage: 'Standalone brand mark, available for compact brand placements.',
  },
  {
    name: 'PhotoIcon',
    Icon: PhotoIcon,
    usage: 'Photo section symbol and empty workspace photo placeholder.',
  },
  {
    name: 'AlignAuto',
    Icon: AlignAuto,
    usage: 'Text alignment that follows the retained position anchor.',
  },
];

const groups: { title: string; icons: IconEntry[] }[] = [
  {
    title: 'Brand & header',
    icons: customIcons.filter(
      ({ name }) => name === 'FrameNoteLogo' || name === 'FrameNoteIcon',
    ),
  },
  {
    title: 'Photo',
    icons: customIcons.filter(({ name }) => name === 'PhotoIcon'),
  },
  {
    title: 'Workspace',
    icons: [
      {
        name: 'Layers',
        Icon: Layers,
        usage: 'Layers section; layer metadata and stack count',
      },
      { name: 'Plus', Icon: Plus, usage: 'Add a layer' },
      {
        name: 'Type',
        Icon: Type,
        usage: 'Selected text layer inspector; font family picker',
      },
      {
        name: 'Download',
        Icon: Download,
        usage: 'Export JPG; export a preset',
      },
      {
        name: 'SlidersHorizontal',
        Icon: SlidersHorizontal,
        usage: 'Presets section; exposure and Helicon helpers',
      },
      { name: 'Scan', Icon: Scan, usage: 'Sizing & Margins section' },
      {
        name: 'LockKeyhole',
        Icon: LockKeyhole,
        usage: 'Local processing privacy message',
      },
      {
        name: 'ExternalLink',
        Icon: ExternalLink,
        usage: 'Open external project links',
      },
    ],
  },
  {
    title: 'Text and content',
    icons: [
      ...customIcons.filter(
        ({ name }) => name === 'AlignAuto' || name === 'AutoAlign',
      ),
      { name: 'ALargeSmall', Icon: ALargeSmall, usage: 'Font size input' },
      { name: 'AlignLeft', Icon: AlignLeft, usage: 'Align text left' },
      { name: 'AlignCenter', Icon: AlignCenter, usage: 'Center text' },
      { name: 'AlignRight', Icon: AlignRight, usage: 'Align text right' },
      { name: 'Bold', Icon: Bold, usage: 'Toggle bold text' },
      {
        name: 'Italic',
        Icon: Italic,
        usage: 'Toggle true italic for supported fonts',
      },
      { name: 'ArrowDownUp', Icon: ArrowDownUp, usage: 'Line spacing' },
      { name: 'Ruler', Icon: Ruler, usage: 'Sizing unit; focal length helper' },
      { name: 'Palette', Icon: Palette, usage: 'Choose text or artwork color' },
      { name: 'Tags', Icon: Tags, usage: 'Browse metadata tags' },
      {
        name: 'Tag',
        Icon: Tag,
        usage: 'Metadata badge in the editor and layer preview',
      },
      { name: 'Shapes', Icon: Shapes, usage: 'Browse inline icons' },
      {
        name: 'ImagePlus',
        Icon: ImagePlus,
        usage: 'Add an image to layer content',
      },
      {
        name: 'Image',
        Icon: Image,
        usage: 'Image content and artwork controls',
      },
      {
        name: 'Aperture',
        Icon: Aperture,
        usage: 'Aperture metadata; inline icon',
      },
      { name: 'Camera', Icon: Camera, usage: 'Camera metadata; inline icon' },
    ],
  },
  {
    title: 'Layer actions',
    icons: [
      { name: 'Eye', Icon: Eye, usage: 'Visible layer' },
      { name: 'EyeOff', Icon: EyeOff, usage: 'Hidden layer' },
      { name: 'Move', Icon: Move, usage: 'Manual layer position' },
      { name: 'Copy', Icon: Copy, usage: 'Duplicate a layer or preset' },
      { name: 'Trash2', Icon: Trash2, usage: 'Delete a layer or preset' },
      {
        name: 'ArrowUpToLine',
        Icon: ArrowUpToLine,
        usage: 'Bring layer to front',
      },
      {
        name: 'ArrowDownToLine',
        Icon: ArrowDownToLine,
        usage: 'Send layer to back',
      },
      {
        name: 'ArrowUp',
        Icon: ArrowUp,
        usage: 'Move layer up; top-center anchor',
      },
      {
        name: 'ArrowDown',
        Icon: ArrowDown,
        usage: 'Move layer down; bottom-center anchor',
      },
    ],
  },
  {
    title: 'Position anchors',
    icons: [
      { name: 'ArrowUpLeft', Icon: ArrowUpLeft, usage: 'Top-left anchor' },
      { name: 'ArrowUpRight', Icon: ArrowUpRight, usage: 'Top-right anchor' },
      { name: 'ArrowLeft', Icon: ArrowLeft, usage: 'Center-left anchor' },
      { name: 'Dot', Icon: Dot, usage: 'Center anchor' },
      { name: 'ArrowRight', Icon: ArrowRight, usage: 'Center-right anchor' },
      {
        name: 'ArrowDownLeft',
        Icon: ArrowDownLeft,
        usage: 'Bottom-left anchor',
      },
      {
        name: 'ArrowDownRight',
        Icon: ArrowDownRight,
        usage: 'Bottom-right anchor',
      },
    ],
  },
  {
    title: 'Metadata helpers',
    icons: [
      { name: 'UserRound', Icon: UserRound, usage: 'Author' },
      { name: 'Focus', Icon: Focus, usage: 'Lens' },
      { name: 'Timer', Icon: Timer, usage: 'Shutter speed' },
      { name: 'Sun', Icon: Sun, usage: 'ISO' },
      { name: 'CalendarDays', Icon: CalendarDays, usage: 'Capture date' },
      { name: 'Copyright', Icon: Copyright, usage: 'Copyright' },
    ],
  },
  {
    title: 'Presets and shared controls',
    icons: [
      { name: 'Bookmark', Icon: Bookmark, usage: 'Preset picker' },
      { name: 'Upload', Icon: Upload, usage: 'Import presets' },
      { name: 'Save', Icon: Save, usage: 'Save preset changes' },
      { name: 'Settings2', Icon: Settings2, usage: 'Manage presets' },
      { name: 'Pencil', Icon: Pencil, usage: 'Rename preset' },
      { name: 'Ellipsis', Icon: Ellipsis, usage: 'Layer actions menu' },
      {
        name: 'GripVertical',
        Icon: GripVertical,
        usage: 'Drag handle for reorderable lists',
      },
      { name: 'Check', Icon: Check, usage: 'Selected list item or option' },
      {
        name: 'ChevronDown',
        Icon: ChevronDown,
        usage: 'Expand section; open select; decrease number',
      },
      { name: 'ChevronUp', Icon: ChevronUp, usage: 'Increase number' },
      { name: 'ChevronRight', Icon: ChevronRight, usage: 'Open font picker' },
      { name: 'RotateCcw', Icon: RotateCcw, usage: 'Reset margins' },
      { name: 'X', Icon: X, usage: 'Close panel; remove editor item' },
      {
        name: 'Info',
        Icon: Info,
        usage: 'Informational notice and helper text',
      },
      {
        name: 'TriangleAlert',
        Icon: TriangleAlert,
        usage: 'Warning; missing metadata or asset',
      },
    ],
  },
];

function IconRows({
  icons,
  custom = false,
}: {
  icons: IconEntry[];
  custom?: boolean;
}) {
  return (
    <ul className="divide-y rounded-sm border">
      {icons.map(({ name, Icon, usage }) => (
        <li key={name} className="flex items-center gap-4 p-4">
          <div
            className={
              custom || name === 'FrameNoteLogo'
                ? 'flex w-36 shrink-0 justify-center'
                : 'flex w-8 shrink-0 justify-center'
            }
          >
            <Icon
              width={name === 'FrameNoteLogo' ? 132 : 24}
              height={name === 'FrameNoteLogo' ? 32 : 24}
              aria-hidden="true"
              focusable="false"
            />
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold">{name}</p>
            <p className="mt-1 text-xs text-content-secondary">{usage}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export const Usage: Story = {
  render: () => (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Icons in use</h1>
        <p className="mt-2 text-sm text-content-secondary">
          Lucide and custom icons grouped by their tools and applications.
          Available artwork alternatives are explicitly identified.
        </p>
      </header>
      <div className="grid items-start gap-6 md:grid-cols-2">
        {groups.map(({ title, icons }) => (
          <section key={title} aria-label={title} className="space-y-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            <IconRows icons={icons} />
          </section>
        ))}
      </div>
    </div>
  ),
};

export const CustomArtwork: Story = {
  render: () => (
    <section aria-label="Custom artwork" className="max-w-3xl space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Custom artwork</h1>
        <p className="mt-2 text-sm text-content-secondary">
          Complete list of custom icon and brand components. All custom
          components inherit their color from the surrounding text.
        </p>
      </header>
      <IconRows icons={customIcons} custom />
    </section>
  ),
};
