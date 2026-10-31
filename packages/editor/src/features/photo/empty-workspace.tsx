import {
  Download,
  ExternalLink,
  Layers,
  LockKeyhole,
  Plus,
  Scan,
} from 'lucide-react';
import { PhotoDropOverlay } from './photo-drop-overlay';
import { PhotoLoadingIndicator } from './photo-loading-indicator';
import { appVersion as version } from '@/lib/build-info';
import { PhotoIcon } from '@/components/icons/photo-icon';
import {
  EditorWorkspace,
  ToolSidebar,
} from '@/components/layout/editor-workspace';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';

function EmptyTools() {
  return (
    <ToolSidebar>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarSection
          id="startup-photo"
          title="Photo"
          icon={<PhotoIcon />}
          iconTone="photo"
        >
          <p className="text-xs text-content-muted">No photo open</p>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-xs text-content-muted">
            <dt>Dimensions</dt>
            <dd className="text-right">—</dd>
            <dt>File size</dt>
            <dd className="text-right">—</dd>
          </dl>
        </SidebarSection>
        <SidebarSection
          id="startup-sizing"
          title="Sizing & Margins"
          icon={<Scan />}
          iconTone="sizing"
          defaultOpen={false}
        >
          <p className="text-xs text-content-muted">
            Open a photo to set sizing and margins.
          </p>
        </SidebarSection>
        <SidebarSection
          id="startup-layers"
          title="Layers"
          icon={<Layers />}
          iconTone="caption"
        >
          <p className="mb-4 text-xs text-content-muted">
            Open a photo to start composing.
          </p>
          <Button variant="outline" size="sm" disabled>
            <Plus aria-hidden="true" />
            Add layer
          </Button>
        </SidebarSection>
        <SidebarSection
          id="startup-export"
          title="Export"
          icon={<Download />}
          iconTone="export"
          defaultOpen={false}
        >
          <p className="text-xs text-content-muted">
            A JPG export will be available after opening a photo.
          </p>
        </SidebarSection>
      </div>
    </ToolSidebar>
  );
}

export function EmptyPhotoCanvas({
  loading = false,
  loadingLabel,
  onCancelLoading,
  draggingPhoto = false,
  onChoosePhoto,
}: {
  loading?: boolean;
  loadingLabel?: string;
  onCancelLoading?: () => void;
  draggingPhoto?: boolean;
  onChoosePhoto: () => void;
}) {
  return (
    <div
      data-photo-canvas
      className="relative flex min-h-[40vh] min-w-0 flex-1 flex-col overflow-auto bg-workspace-base md:min-h-0"
    >
      {loadingLabel && (
        <PhotoLoadingIndicator
          label={loadingLabel}
          onCancel={onCancelLoading}
        />
      )}
      {draggingPhoto && <PhotoDropOverlay />}
      <div className="flex flex-1 items-center justify-center p-8">
        <section
          className="flex max-w-sm flex-col items-center text-center"
          aria-labelledby="empty-workspace-title"
        >
          <PhotoIcon
            className="mb-5 size-9 text-content-muted"
            aria-hidden="true"
          />
          <h1 id="empty-workspace-title" className="text-sm font-medium">
            Drop photos here
          </h1>
          <p className="mt-2 text-xs text-content-muted">JPG or PNG</p>
          <Button
            className="mt-6"
            variant="default"
            disabled={loading}
            onClick={onChoosePhoto}
          >
            Choose photos
          </Button>
          <p className="mt-8 flex items-center gap-1.5 text-[11px] text-content-muted">
            <LockKeyhole className="size-3" aria-hidden="true" />
            Photos stay on your device.
          </p>
        </section>
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-4 text-[11px] text-content-muted">
        <span>FrameNote · v{version}</span>
        {[
          ['GitHub', 'https://github.com/rafalkarczmarzyk/frame-note'],
          [
            'Changelog',
            'https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md',
          ],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
          >
            {label}
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
      </footer>
    </div>
  );
}

export function EmptyWorkspace(props: Parameters<typeof EmptyPhotoCanvas>[0]) {
  return (
    <EditorWorkspace>
      <EmptyPhotoCanvas {...props} />
      <EmptyTools />
    </EditorWorkspace>
  );
}
