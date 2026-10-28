import { useGlassPreview } from '../caption/use-glass-preview';
import { BackgroundControls } from '../caption/background-controls';
import { BackgroundPreview } from '../caption/background-preview';
import { captionBackgroundRect } from '../caption/background-render';
import { parseIconToken } from '@/domain/inline-icon';
import { metadataTokenStatus } from '../caption/editor/token-status';
import type { SessionDocument } from './session-document';
import type { RollExportOptions } from './export-roll';
import { SplitButton } from '@/components/ui/split-button';
import { resolveLayout } from '../caption/resolve-layout';
import type { ReactNode, SetStateAction } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import type { ColorSelectionSource } from '@/domain/caption-colors';
import { EmptyPhotoCanvas } from './empty-workspace';
import type { MetadataField } from '@/domain/metadata';
import { PhotoDropOverlay } from './photo-drop-overlay';
import { PhotoLoadingIndicator } from './photo-loading-indicator';
import type { FontSelection } from '@/domain/font-style';
import { CategoryFilter } from '@/components/ui/category-filter';
import { fontCategories } from '@/domain/fonts';
import { supportsBold, supportsItalic } from '../../domain/font-style';
import { Switch } from '@/components/ui/switch';
import {
  defaultExportMetadata,
  metadataGroups as exportMetadataGroups,
} from '../caption/export-metadata';
import { activeImageAssets } from '@/domain/image-retention';
import { moveLayer, toggleLayerVisibility } from '@/domain/caption-layout';
import { migrateLogo } from '@/domain/inline-image';
import { MarginRulers } from './margin-rulers';
import { MarginPreviewProvider } from '@/components/ui/margin-preview-provider';
import { InspectorSection } from '@/components/layout/inspector-section';
import { createId } from '@/lib/create-id';
import { builtinPresets } from '@/domain/builtin-presets';
import { PresetControls } from '../presets/preset-controls';
import { logoLayout } from '../caption/logo-layout';
import { tintedIcon } from '../caption/inline-layout';
import { brandIcons } from '../caption/brand-icons';
import { iconMarker } from '../caption/inline-content';
import { builtinIcons } from '../caption/builtin-icons';
import type { Editor } from '@tiptap/react';
import { CaptionEditor } from '../caption/editor/caption-editor';
import { GraphicsPickerPanel } from '../caption/graphics-picker-panel';
import type { GraphicsEditorActions } from '../caption/editor/caption-editor';
import type { ImageAsset } from '@/domain/inline-image';
import { loadIcon, type SvgIcon } from '../caption/svg-icons';
import { resolveCaptionContent } from '../caption/inline-content';
import { inlineLayout } from '../caption/inline-layout';
import { InlinePreview } from '../caption/inline-preview';
import { customPoint, customPosition } from '../caption/layout';
import { LayerList } from '../layers/layer-list';
import {
  addCaption,
  containerCaption,
  removeCaption,
  updateCaption,
  type CaptionLayout,
} from '@/domain/caption-layout';
import { createCaption, type Caption } from '@/domain/document';
import { MetadataPicker } from '../caption/metadata-picker';
import { metadataGroups } from '@/domain/caption-tags';
import { ColorPickerPanel } from '../caption/color-picker-panel';
import {
  Download,
  LoaderCircle,
  Layers,
  Plus,
  Trash2,
  Tags,
  Shapes,
  Image,
} from 'lucide-react';
import {
  EditorWorkspace,
  ToolSidebar,
} from '@/components/layout/editor-workspace';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { FontPicker } from '../caption/font-picker';
import { ensureCaptionFont } from '../caption/font-loading';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { InlineNotice } from '@/components/ui/inline-notice';
import { formatBytes } from '@/lib/format-bytes';
import { usePreparedExport } from '../caption/use-prepared-export';
import { createPortal } from 'react-dom';
import { usedTokens } from '../caption/insert-token';
import {
  CaptionControls,
  CaptionPositionControls,
} from '../caption/caption-controls';
import { Button } from '@/components/ui/button';
import { captionConfig, exportName } from '../caption/render';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Stage,
  Layer,
  Group,
  Text,
  Rect,
  Image as CanvasImage,
} from 'react-konva';
import type { LoadedPhoto } from './load-photo';

// Only control geometry uses this reference before import; export requires a photo.
const emptyDimensions = { width: 1000, height: 1000 };
const emptyMetadata: readonly MetadataField[] = [];

export function PhotoWorkspace(
  props: Parameters<typeof PhotoWorkspaceContent>[0],
) {
  return (
    <MarginPreviewProvider>
      <PhotoWorkspaceContent {...props} />
    </MarginPreviewProvider>
  );
}

function PhotoWorkspaceContent({
  photo,
  loading = false,
  onChoosePhoto,
  initialLayout,
  initialPresetId,
  initialIcons = [],
  onPreviewReady,
  loadingLabel,
  onCancelLoading,
  draggingPhoto = false,
  sessionDocument,
  onDocumentChange,
  documentKey,
  filmRoll,
  batchBusy = false,
  onExportAll,
}: {
  photo: LoadedPhoto | null;
  loading?: boolean;
  onChoosePhoto?: () => void;
  initialLayout?: CaptionLayout;
  initialPresetId?: string;
  initialIcons?: SvgIcon[];
  onPreviewReady?: (photo: LoadedPhoto) => void;
  loadingLabel?: string;
  onCancelLoading?: () => void;
  draggingPhoto?: boolean;
  sessionDocument?: SessionDocument;
  onDocumentChange?: (
    update: (value: SessionDocument) => SessionDocument,
  ) => void;
  documentKey?: string;
  filmRoll?: ReactNode;
  batchBusy?: boolean;
  onExportAll?: (options: RollExportOptions) => void;
}) {
  const dimensions = photo?.document.photo.dimensions ?? emptyDimensions;
  const fields = photo?.document.photo.metadata ?? emptyMetadata;
  const alphaMatte = useMemo(
    () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-caption-white')
        .trim(),
    [],
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const editorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);
  const [localIcons, setLocalIcons] = useState<SvgIcon[]>(() => [
    ...builtinIcons,
    ...initialIcons.filter(
      (icon) => !builtinIcons.some((builtin) => builtin.name === icon.name),
    ),
  ]);
  const icons = sessionDocument?.icons ?? localIcons;
  const setIcons = (update: SetStateAction<SvgIcon[]>) => {
    if (onDocumentChange)
      onDocumentChange((value) => ({
        ...value,
        icons: typeof update === 'function' ? update(value.icons) : update,
      }));
    else setLocalIcons(update);
  };
  const [iconImages, setIconImages] = useState<
    ReadonlyMap<string, HTMLImageElement>
  >(new Map());
  const [activePanel, setActivePanel] = useState<
    'tags' | 'fonts' | 'colors' | 'graphics' | 'presets' | null
  >(null);
  const [graphicsActions, setGraphicsActions] =
    useState<GraphicsEditorActions | null>(null);
  const registerGraphicsActions = useCallback(
    (actions: GraphicsEditorActions | null) =>
      setGraphicsActions(() => actions),
    [],
  );
  const [colorSelections, setColorSelections] = useState<
    Record<string, { value: string; source: ColorSelectionSource }>
  >({});
  const [presetHost, setPresetHost] = useState<HTMLDivElement | null>(null);
  const tagsOpen = activePanel === 'tags';
  const [fontQuery, setFontQuery] = useState('');
  const [fontCategory, setFontCategory] = useState('all');
  const [tagCategory, setTagCategory] = useState('all');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
  const [localLayout, setLocalLayout] = useState<CaptionLayout>(() =>
    initialLayout
      ? {
          ...initialLayout,
          containers: initialLayout.containers.map(migrateLogo),
        }
      : structuredClone(builtinPresets[0]!.layout),
  );
  const layout = sessionDocument?.layout ?? localLayout;
  const setLayout = (update: SetStateAction<CaptionLayout>) => {
    if (onDocumentChange)
      onDocumentChange((value) => ({
        ...value,
        layout: typeof update === 'function' ? update(value.layout) : update,
      }));
    else setLocalLayout(update);
  };
  const assets = useMemo(() => {
    const visible = layout.containers.filter(
      (container) => container.visible !== false,
    );
    const used = new Set(
      visible.flatMap((container) =>
        [...container.template.matchAll(/\{icon:([^{}]+)\}/gu)].map(
          (match) => parseIconToken(`icon:${match[1]}`)?.name,
        ),
      ),
    );
    return [
      ...icons.filter((icon) => used.has(icon.name)),
      ...(visible.some(
        (container) => !container.template.trim() && !container.logo,
      )
        ? [brandIcons[0]!]
        : []),
      ...visible.flatMap((container) => [
        ...(container.logo ? [container.logo.asset] : []),
        ...activeImageAssets(container.template, container.images ?? []).map(
          (image) => ({
            name: image.name,
            svg: image.source,
            aspect: image.width / image.height,
          }),
        ),
      ]),
    ];
  }, [icons, layout.containers]);
  const [assetFailures, setAssetFailures] = useState<
    ReadonlyMap<string, string>
  >(new Map());
  useEffect(() => {
    let active = true;
    void Promise.all(
      assets.map(async (asset) => {
        try {
          return { source: asset.svg, image: await loadIcon(asset) };
        } catch {
          return {
            source: asset.svg,
            error: `Could not render image: ${asset.name}. Replace it or hide its layer to export.`,
          };
        }
      }),
    ).then((results) => {
      if (!active) return;
      setIconImages(
        new Map(
          results.flatMap((result) =>
            result.image ? [[result.source, result.image] as const] : [],
          ),
        ),
      );
      setAssetFailures(
        new Map(
          results.flatMap((result) =>
            result.error ? [[result.source, result.error] as const] : [],
          ),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [assets]);
  const assetError = assets
    .map((asset) => assetFailures.get(asset.svg))
    .filter(Boolean)
    .join(' ');
  const iconsReady = assets.every((asset) => iconImages.has(asset.svg));
  const activeContainer = layout.containers.find(
    (container) => container.id === layout.activeId,
  );
  const settings = activeContainer
    ? containerCaption(layout, activeContainer)
    : {
        ...createCaption(),
        sizingUnit: layout.sizingUnit,
        position: {
          ...createCaption().position,
          margins: layout.margins,
          marginLinkMode: layout.marginLinkMode,
        },
      };
  const template = settings.template;
  const setSettings = (next: Caption | ((value: Caption) => Caption)) => {
    if (!layout.activeId) return;
    setLayout((value) =>
      updateCaption(
        value,
        layout.activeId!,
        typeof next === 'function' ? next(settings) : next,
        dimensions,
      ),
    );
  };
  const setTemplate = (
    template: string,
    images?: import('@/domain/inline-image').ImageAsset[],
  ) => setSettings({ ...settings, template, ...(images ? { images } : {}) });
  const selectContainer = (id: string) => {
    setEditingId(null);
    if (layout.containers.find((container) => container.id === id)?.logo)
      setActivePanel(null);
    setLayout((value) => ({ ...value, activeId: id }));
  };
  const addContainer = (duplicate = false) => {
    setLayout((value) => addCaption(value, createId(), duplicate, dimensions));
  };
  const [singleExporting, setExporting] = useState(false);
  const exporting = singleExporting || batchBusy;
  const [quality, setQuality] = useState(95);
  const [metadataOptions, setMetadataOptions] = useState(defaultExportMetadata);
  const [loadedFont, setLoadedFont] = useState('');
  const [fontFailure, setFontFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const used = usedTokens(template);
  const exportTarget = document.getElementById('export-actions');
  const addToken = (key: string) => {
    editorRef.current
      ?.chain()
      .focus()
      .insertContent({ type: 'captionToken', attrs: { token: key } })
      .run();
  };
  const resolved = resolveCaptionContent(
    template,
    fields,
    icons,
    settings.images,
  );
  const metadataValues = Object.fromEntries(
    fields.map((field) => [field.key, field.displayValue]),
  );
  const missingGraphics = resolved.missing.filter(
    (key) => key.startsWith('icon:') || key.startsWith('image:'),
  );
  const missingMetadata = resolved.missing.filter(
    (key) => !missingGraphics.includes(key),
  );
  const emptyFields = missingMetadata.filter(
    (key) => metadataTokenStatus(key, metadataValues) === 'empty',
  );
  const unknownFields = missingMetadata.filter(
    (key) => metadataTokenStatus(key, metadataValues) === 'absent',
  );
  const { containers, sizingUnit, margins, marginLinkMode } = layout;
  const composition = useMemo(
    () => ({ containers, sizingUnit, margins, marginLinkMode, activeId: null }),
    [containers, sizingUnit, margins, marginLinkMode],
  );
  const renderedCaptions = useMemo(
    () => resolveLayout(composition, fields, icons),
    [composition, fields, icons],
  );
  const exportCaptions = useMemo(
    () =>
      renderedCaptions.map(({ id, caption, text, color, icons }) => ({
        id,
        caption,
        text,
        color,
        icons,
      })),
    [renderedCaptions],
  );
  const exportRequest = useMemo(
    () =>
      photo
        ? {
            image: photo.image,
            dimensions: photo.document.photo.dimensions,
            captions: exportCaptions,
            quality,
            metadata: photo.document.photo.metadata,
            metadataOptions,
          }
        : null,
    [photo, exportCaptions, quality, metadataOptions],
  );
  const fontKey = JSON.stringify(
    exportCaptions.map(({ caption, text }) => ({
      style: {
        fontFamily: caption.style.fontFamily,
        fontWeight: caption.style.fontWeight,
        fontStyle: caption.style.fontStyle,
      },
      text,
    })),
  );
  const fontReady = loadedFont === fontKey;
  const fontError = fontFailure?.key === fontKey ? fontFailure.message : '';
  const glassPreview = useGlassPreview(
    photo,
    exportCaptions,
    fontReady && iconsReady && !loading,
    Math.max(size.width, size.height),
  );
  const prepared = usePreparedExport(
    exportRequest,
    !!photo && fontReady && iconsReady && !batchBusy && !loading,
  );
  useEffect(() => {
    let active = true;
    void Promise.all(
      (JSON.parse(fontKey) as { style: FontSelection; text: string }[]).map(
        ({ style, text }) => ensureCaptionFont(style, text),
      ),
    )
      .then(() => {
        if (active) setLoadedFont(fontKey);
      })
      .catch((error: unknown) => {
        if (active)
          setFontFailure({
            key: fontKey,
            message:
              error instanceof Error
                ? error.message
                : 'Could not load the caption font.',
          });
      });
    return () => {
      active = false;
    };
  }, [fontKey]);
  const download = () => {
    if (!photo || !prepared.blob) return;
    if (
      renderedCaptions.some(
        (item) => item.invalidSyntax || item.missing.length,
      ) &&
      !window.confirm(
        'Some tokens could not be resolved. Export the current caption anyway?',
      )
    )
      return;
    setExporting(true);
    const url = URL.createObjectURL(prepared.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportName(photo.document.photo.name);
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.setTimeout(() => setExporting(false), 0);
  };
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const previewReady =
    size.width > 1 &&
    size.height > 1 &&
    (fontReady || !!fontError) &&
    (iconsReady || !!assetError);
  useEffect(() => {
    if (!photo || !previewReady || !onPreviewReady) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => onPreviewReady(photo));
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(secondFrame);
    };
  }, [photo, previewReady, onPreviewReady]);
  const { width, height } = dimensions;
  const scale = Math.min(
    Math.max(1, size.width - 56) / width,
    Math.max(1, size.height - 56) / height,
    1,
  );
  const previewY = (size.height - height * scale) / 2;
  const matchingFieldCount = metadataGroups(fields, query)
    .filter((group) => tagCategory === 'all' || group.name === tagCategory)
    .reduce((count, group) => count + group.fields.length, 0);
  const preparingExport =
    !!photo && !prepared.blob && !prepared.error && !fontError && !assetError;
  const exportLabel =
    singleExporting || batchBusy
      ? 'Exporting…'
      : loading
        ? 'Opening photos…'
        : preparingExport
          ? 'Preparing JPG…'
          : 'Export JPG';
  return (
    <EditorWorkspace>
      {exportTarget &&
        createPortal(
          <span data-export-live className="inline-flex">
            <SplitButton
              size="sm"
              aria-label="Export JPG"
              menuLabel="Export actions"
              primaryTooltip={
                !photo ? 'Open a photo to export a JPG' : exportLabel
              }
              primaryDisabled={!photo || !prepared.blob || exporting || loading}
              menuDisabled={!onExportAll || exporting || loading}
              aria-busy={preparingExport || exporting || undefined}
              onClick={download}
              items={[
                {
                  label: 'Export all',
                  icon: <Download />,
                  disabled: !onExportAll || exporting || loading,
                  onSelect: () => onExportAll?.({ quality, metadataOptions }),
                },
              ]}
            >
              {preparingExport || exporting ? (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Download className="md:hidden" aria-hidden="true" />
              )}
              <span className="hidden md:inline">{exportLabel}</span>
            </SplitButton>
          </span>,
          exportTarget,
        )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-workspace-base">
        <div
          ref={host}
          data-photo-canvas
          data-glass-ready={glassPreview.tiles ? 'true' : 'false'}
          className="relative flex min-h-[40vh] min-w-0 flex-1 flex-col bg-workspace-base md:min-h-0"
        >
          {loadingLabel && (
            <PhotoLoadingIndicator
              label={loadingLabel}
              onCancel={onCancelLoading}
            />
          )}
          {draggingPhoto && <PhotoDropOverlay />}
          {photo ? (
            <>
              <div
                role="img"
                inert={exporting || undefined}
                className="transition-opacity duration-200 motion-reduce:transition-none"
                style={{ opacity: previewReady ? 1 : 0 }}
                aria-label={`Photo preview: ${photo.document.photo.name}`}
              >
                <Stage width={size.width} height={size.height}>
                  <Layer>
                    <Group
                      x={(size.width - width * scale) / 2}
                      y={previewY}
                      scaleX={scale}
                      scaleY={scale}
                      clipWidth={width}
                      clipHeight={height}
                    >
                      <Rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill={alphaMatte}
                        listening={false}
                      />
                      <CanvasImage
                        image={photo.previewImage ?? photo.image}
                        width={width}
                        height={height}
                      />
                      {fontReady &&
                        renderedCaptions.map(
                          ({
                            id,
                            caption,
                            text,
                            color,
                            icons: inlineIcons,
                          }) => {
                            if (
                              (caption.logo &&
                                !iconImages.has(caption.logo.asset.svg)) ||
                              inlineIcons.some(
                                (icon) => !iconImages.has(icon.svg),
                              )
                            )
                              return null;
                            const config = captionConfig(
                              { width, height },
                              caption,
                              text,
                              color,
                            );
                            const placeholder =
                              !caption.logo && !caption.template.trim();
                            const visualColor = placeholder
                              ? getComputedStyle(document.documentElement)
                                  .getPropertyValue('--color-porcelain')
                                  .trim()
                              : color;
                            const scene = placeholder
                              ? inlineLayout(
                                  { width, height },
                                  caption,
                                  iconMarker(0),
                                  [brandIcons[0]!],
                                )
                              : inlineIcons.length
                                ? inlineLayout(
                                    { width, height },
                                    caption,
                                    text,
                                    inlineIcons,
                                  )
                                : null;
                            const logoGeometry = caption.logo
                              ? logoLayout({ width, height }, caption)
                              : null;
                            const geometry = logoGeometry ??
                              scene ?? {
                                ...config,
                                height:
                                  text.split('\n').length *
                                  config.fontSize *
                                  config.lineHeight,
                              };
                            const decoration = placeholder
                              ? geometry
                              : captionBackgroundRect(geometry, caption, {
                                  width,
                                  height,
                                });
                            return (
                              <Group key={id}>
                                {!placeholder &&
                                  (text.trim() || caption.logo) &&
                                  caption.background?.type !== 'none' &&
                                  (glassPreview.tiles?.has(id) ? (
                                    <CanvasImage
                                      {...glassPreview.tiles.get(id)!}
                                      listening={false}
                                    />
                                  ) : (
                                    <BackgroundPreview
                                      content={geometry}
                                      caption={caption}
                                      dimensions={{ width, height }}
                                    />
                                  ))}
                                <Group
                                  x={geometry.x}
                                  y={geometry.y}
                                  width={geometry.width}
                                  height={geometry.height}
                                  opacity={
                                    placeholder ? 0.4 : caption.style.opacity
                                  }
                                  listening
                                  draggable={!exporting}
                                  onDragStart={() => {
                                    selectContainer(id);
                                    setDraggingId(id);
                                  }}
                                  onDragMove={(event) => {
                                    const node = event.currentTarget;
                                    const block = {
                                      width: node.width(),
                                      height: node.height(),
                                    };
                                    const point = customPoint(
                                      { width, height },
                                      block,
                                      caption.position.anchor,
                                      node.position(),
                                    );
                                    const custom = {
                                      x: Math.min(100, Math.max(0, point.x)),
                                      y: Math.min(100, Math.max(0, point.y)),
                                    };
                                    node.position(
                                      customPosition(
                                        { width, height },
                                        block,
                                        caption.position.anchor,
                                        custom,
                                      ),
                                    );
                                    setLayout((value) => ({
                                      ...value,
                                      containers: value.containers.map(
                                        (container) =>
                                          container.id === id
                                            ? {
                                                ...container,
                                                position: {
                                                  ...container.position,
                                                  custom,
                                                },
                                              }
                                            : container,
                                      ),
                                    }));
                                  }}
                                  onDragEnd={() => setDraggingId(null)}
                                  onMouseEnter={() => setHoveredId(id)}
                                  onMouseLeave={() => setHoveredId(null)}
                                  onClick={() => selectContainer(id)}
                                  onTap={() => selectContainer(id)}
                                >
                                  <Rect
                                    x={decoration.x - geometry.x}
                                    y={decoration.y - geometry.y}
                                    width={decoration.width}
                                    height={decoration.height}
                                    fill={color}
                                    opacity={0}
                                  />
                                  {caption.logo && logoGeometry ? (
                                    <CanvasImage
                                      listening={false}
                                      width={logoGeometry.width}
                                      height={logoGeometry.height}
                                      image={
                                        caption.logo.colorMode === 'single'
                                          ? tintedIcon(
                                              caption.logo.asset,
                                              iconImages.get(
                                                caption.logo.asset.svg,
                                              )!,
                                              logoGeometry.height,
                                              color,
                                            )
                                          : iconImages.get(
                                              caption.logo.asset.svg,
                                            )
                                      }
                                    />
                                  ) : scene ? (
                                    <InlinePreview
                                      scene={scene}
                                      caption={caption}
                                      color={visualColor}
                                      images={iconImages}
                                    />
                                  ) : (
                                    <Text
                                      {...config}
                                      x={0}
                                      y={0}
                                      opacity={1}
                                      listening={false}
                                    />
                                  )}
                                </Group>
                                {(hoveredId === id ||
                                  editingId === id ||
                                  draggingId === id) &&
                                  (text || placeholder || caption.logo) && (
                                    <Rect
                                      x={decoration.x - 4 / scale}
                                      y={decoration.y - 4 / scale}
                                      width={decoration.width + 8 / scale}
                                      height={decoration.height + 8 / scale}
                                      stroke={getComputedStyle(
                                        document.documentElement,
                                      )
                                        .getPropertyValue('--color-porcelain')
                                        .trim()}
                                      strokeWidth={1 / scale}
                                      dash={[4 / scale, 3 / scale]}
                                      listening={false}
                                    />
                                  )}
                                {hoveredId === id &&
                                  !draggingId &&
                                  (text || placeholder || caption.logo) && (
                                    <Group
                                      listening={false}
                                      x={Math.max(
                                        0,
                                        Math.min(
                                          geometry.x,
                                          width - Math.min(280 / scale, width),
                                        ),
                                      )}
                                      y={
                                        geometry.y >= 52 / scale
                                          ? geometry.y - 52 / scale
                                          : Math.max(
                                              0,
                                              Math.min(
                                                height - 46 / scale,
                                                geometry.y +
                                                  geometry.height +
                                                  10 / scale,
                                              ),
                                            )
                                      }
                                    >
                                      <Rect
                                        width={Math.min(280 / scale, width)}
                                        height={42 / scale}
                                        cornerRadius={6 / scale}
                                        fill={getComputedStyle(
                                          document.documentElement,
                                        )
                                          .getPropertyValue(
                                            '--color-panel-base',
                                          )
                                          .trim()}
                                      />
                                      <Text
                                        listening={false}
                                        width={Math.min(280 / scale, width)}
                                        padding={8 / scale}
                                        fontSize={11 / scale}
                                        lineHeight={1.3}
                                        fontFamily="Montserrat Variable"
                                        fill={getComputedStyle(
                                          document.documentElement,
                                        )
                                          .getPropertyValue(
                                            '--color-content-primary',
                                          )
                                          .trim()}
                                        text={`${caption.position.custom ? `Manual: X ${Number(caption.position.custom.x.toFixed(1))}% · Y ${Number(caption.position.custom.y.toFixed(1))}%` : `Anchor: ${caption.position.anchor.replaceAll('-', ' ')}`}\nDrag to move`}
                                      />
                                    </Group>
                                  )}
                              </Group>
                            );
                          },
                        )}
                    </Group>
                  </Layer>
                </Stage>
              </div>
              <MarginRulers
                disabled={exporting}
                onChange={(margins) =>
                  setLayout((value) => ({ ...value, margins }))
                }
                dimensions={{ width, height }}
                unit={layout.sizingUnit}
                margins={layout.margins}
                linkMode={layout.marginLinkMode}
                scale={scale}
                x={(size.width - width * scale) / 2}
                y={previewY}
              />
            </>
          ) : (
            <EmptyPhotoCanvas
              loading={loading}
              onChoosePhoto={onChoosePhoto ?? (() => {})}
            />
          )}
        </div>
        {filmRoll}
      </div>
      {activePanel === 'presets' && (
        <div
          ref={setPresetHost}
          className="max-h-[40vh] w-full shrink-0 md:max-h-none md:w-80"
        />
      )}
      {activePanel === 'graphics' && (
        <GraphicsPickerPanel
          icons={icons}
          images={settings.images ?? []}
          onChooseIcon={(name) => addToken(`icon:${name}`)}
          onChooseGraphic={(asset: ImageAsset) => {
            graphicsActions?.insert(asset);
            setActivePanel(null);
          }}
          onUploadGraphic={() => graphicsActions?.upload()}
          onClose={() => setActivePanel(null)}
          className="max-h-[40vh] w-full shrink-0 rounded-none shadow-none md:max-h-none md:w-80"
        />
      )}
      {activePanel === 'colors' && (
        <ColorPickerPanel
          value={settings.style.color}
          onChange={(color) => {
            if (activeContainer)
              setColorSelections((entries) => ({
                ...entries,
                [activeContainer.id]: { value: color, source: 'palette' },
              }));
            setSettings((value) => ({
              ...value,
              style: { ...value.style, color },
            }));
          }}
          onClose={() => setActivePanel(null)}
          surface="solid"
          className="max-h-[40vh] w-full shrink-0 rounded-none shadow-none md:max-h-none md:w-80"
        />
      )}
      {activePanel &&
        activePanel !== 'colors' &&
        activePanel !== 'graphics' &&
        activePanel !== 'presets' && (
          <FloatingPanel
            id="auxiliary-panel"
            title={tagsOpen ? 'Available tags' : 'Choose a font'}
            description={
              tagsOpen
                ? 'Click a field to insert it into your caption.'
                : 'Preview a font and apply it to your caption.'
            }
            onClose={() => setActivePanel(null)}
            surface="solid"
            className="max-h-[40vh] w-full shrink-0 rounded-none shadow-none md:max-h-none md:w-80"
            toolbar={
              tagsOpen ? (
                <>
                  <Input
                    aria-label="Search metadata"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search fields or values…"
                    className="bg-preview-placeholder"
                  />
                  <CategoryFilter
                    label="Tag categories"
                    className="mt-2"
                    value={tagCategory}
                    onValueChange={setTagCategory}
                    categories={metadataGroups(fields, '').map((group) => ({
                      value: group.name,
                      label:
                        group.name === 'FrameNote'
                          ? group.name
                          : group.name.toUpperCase(),
                    }))}
                  />
                  <p className="mt-2 text-xs text-content-secondary">
                    {matchingFieldCount} tags
                  </p>
                </>
              ) : (
                <>
                  <Input
                    aria-label="Search fonts"
                    value={fontQuery}
                    onChange={(event) => setFontQuery(event.target.value)}
                    placeholder="Search fonts…"
                    className="bg-preview-placeholder"
                  />
                  <CategoryFilter
                    label="Font categories"
                    className="mt-2 -mb-3"
                    value={fontCategory}
                    onValueChange={setFontCategory}
                    categories={fontCategories.map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </>
              )
            }
          >
            {tagsOpen ? (
              <MetadataPicker
                category={tagCategory}
                fields={fields}
                query={query}
                used={used}
                onChoose={addToken}
              />
            ) : (
              <FontPicker
                category={fontCategory}
                value={settings.style.fontFamily}
                query={fontQuery}
                onChoose={(id) =>
                  setSettings((value) => ({
                    ...value,
                    style: {
                      ...value.style,
                      fontFamily: id,
                      fontWeight: supportsBold(id)
                        ? value.style.fontWeight
                        : 400,
                      fontStyle: supportsItalic(
                        id as typeof value.style.fontFamily,
                      )
                        ? value.style.fontStyle
                        : 'normal',
                    },
                  }))
                }
              />
            )}
          </FloatingPanel>
        )}
      <ToolSidebar aria-label="Photo tools">
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          inert={exporting || undefined}
        >
          <SidebarSection
            id="photo"
            title="Photo info"
            iconTone="photo"
            icon={<Image />}
            defaultOpen={false}
          >
            {photo ? (
              <>
                <h1 className="break-all text-sm font-medium">
                  {photo.document.photo.name}
                </h1>
                <p className="mt-2 text-xs text-content-secondary">
                  {width} × {height} px
                </p>
                <Tooltip
                  content={`${photo.document.photo.byteLength.toLocaleString('en-US')} bytes`}
                >
                  <p className="mt-1 text-xs text-content-secondary">
                    Input: {formatBytes(photo.document.photo.byteLength)}
                  </p>
                </Tooltip>
              </>
            ) : (
              <p className="text-xs text-content-secondary">
                No photo open. Choose a preset or prepare your layout before
                importing.
              </p>
            )}
          </SidebarSection>
          <PresetControls
            panelHost={presetHost}
            toolbarHost={document.getElementById('preset-actions')}
            selectedPresetId={sessionDocument?.presetId}
            onSelectedPresetChange={
              onDocumentChange
                ? (presetId) =>
                    onDocumentChange((value) => ({ ...value, presetId }))
                : undefined
            }
            initialPresetId={
              initialPresetId ?? (initialLayout ? '' : 'builtin-default')
            }
            onBrowse={() => setActivePanel('presets')}
            onClose={() => setActivePanel(null)}
            layout={layout}
            icons={icons}
            disabled={exporting}
            persist={!initialLayout}
            onApply={(preset) => {
              setColorSelections({});
              const nextIcons = [
                ...preset.icons,
                ...builtinIcons.filter(
                  (icon) =>
                    !preset.icons.some((saved) => saved.name === icon.name),
                ),
              ];
              if (onDocumentChange)
                onDocumentChange(() => ({
                  layout: structuredClone(preset.layout),
                  icons: nextIcons,
                  presetId: preset.id,
                }));
              else {
                setLayout(structuredClone(preset.layout));
                setIcons(nextIcons);
              }
              setHoveredId(null);
              setEditingId(null);
            }}
          />
          <section aria-label="Document settings">
            <CaptionControls
              scope="global"
              canConvertUnits={!!photo}
              dimensions={dimensions}
              caption={settings}
              onChange={(caption) =>
                setLayout((value) =>
                  updateCaption(value, '', caption, dimensions),
                )
              }
              disabled={exporting}
              onBrowseColors={() => {}}
              onBrowseFonts={() => {}}
            />
          </section>
          <div className="mx-3 my-3 overflow-hidden rounded-xl bg-accordion-base [&>[data-section]]:m-0 [&>[data-section]]:rounded-none [&>[data-section=selected-container]]:border-x-0 [&>[data-section=selected-container]]:border-b-0">
            <SidebarSection
              id="containers"
              title="Layers"
              contentPadding="none"
              iconTone="caption"
              icon={<Layers />}
            >
              {(assetError || fontError || glassPreview.error) && (
                <p role="alert" className="px-4 pt-2 pb-3 text-xs">
                  {assetError || fontError || glassPreview.error}
                </p>
              )}
              <LayerList
                appearance="compact"
                layout={layout}
                fields={fields}
                icons={icons}
                onMove={(id, index) =>
                  setLayout((value) => moveLayer(value, id, index))
                }
                onToggleVisibility={(id) =>
                  setLayout((value) => toggleLayerVisibility(value, id))
                }
                onChoose={selectContainer}
                onHover={setHoveredId}
                onDuplicate={(id) => {
                  setEditingId(null);
                  setLayout((value) =>
                    addCaption(
                      { ...value, activeId: id },
                      createId(),
                      true,
                      dimensions,
                    ),
                  );
                }}
                onDelete={(id) => {
                  if (layout.activeId === id) setEditingId(null);
                  setHoveredId(null);
                  setLayout((value) => removeCaption(value, id));
                }}
              />
              {activeContainer &&
                activeContainer.visible !== false &&
                layout.containers.some(
                  (container) =>
                    container.id !== activeContainer.id &&
                    container.visible !== false &&
                    !container.position.custom &&
                    !activeContainer.position.custom &&
                    container.position.anchor ===
                      activeContainer.position.anchor,
                ) && (
                  <InlineNotice tone="warning" className="mx-4 mt-3">
                    Multiple layers use this anchor and may overlap. Select each
                    from the list to change its anchor.
                  </InlineNotice>
                )}
              <div className="flex flex-wrap gap-2 px-4 pt-3 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  data-add-layer=""
                  onClick={() => addContainer()}
                >
                  <Plus aria-hidden="true" />
                  Add layer
                </Button>
                <Tooltip content="Remove selected layer">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!activeContainer}
                    onClick={() => {
                      if (!activeContainer) return;
                      setEditingId(null);
                      setHoveredId(null);
                      setLayout((value) =>
                        removeCaption(value, activeContainer.id),
                      );
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    Remove layer
                  </Button>
                </Tooltip>
              </div>
              {activeContainer && (
                <SidebarSection
                  key={activeContainer.id}
                  id="selected-container"
                  title="Selected layer"
                  collapsible={false}
                  hideHeading
                  surface="container"
                >
                  <>
                    <InspectorSection title="Content" imageDrop>
                      <CaptionEditor
                        key={documentKey}
                        value={template}
                        images={settings.images}
                        sizingUnit={settings.sizingUnit}
                        fontSize={settings.style.fontSize}
                        dimensions={dimensions}
                        fields={fields}
                        hasPhoto={!!photo}
                        icons={icons}
                        onChange={setTemplate}
                        onFocus={() => setEditingId(activeContainer.id)}
                        onBlur={() => setEditingId(null)}
                        onReady={editorReady}
                        onGraphicsActionsReady={registerGraphicsActions}
                        actions={
                          <>
                            <Tooltip content="Insert photo metadata at the text cursor">
                              <button
                                type="button"
                                className="control-segment flex h-7 min-w-0 items-center justify-center gap-1 px-2 text-xs whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0"
                                aria-label={
                                  tagsOpen
                                    ? 'Hide available tags'
                                    : 'Browse available tags'
                                }
                                data-state={tagsOpen ? 'on' : 'off'}
                                aria-expanded={tagsOpen}
                                aria-controls="auxiliary-panel"
                                onClick={() =>
                                  setActivePanel((value) =>
                                    value === 'tags' ? null : 'tags',
                                  )
                                }
                              >
                                <Tags aria-hidden="true" />
                                Metadata
                              </button>
                            </Tooltip>
                            <Tooltip content="Insert a built-in icon or SVG / PNG graphic">
                              <button
                                type="button"
                                className="control-segment flex h-7 min-w-0 items-center justify-center gap-1 px-2 text-xs whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0"
                                aria-label="Browse graphics"
                                data-state={
                                  activePanel === 'graphics' ? 'on' : 'off'
                                }
                                aria-expanded={activePanel === 'graphics'}
                                onClick={() =>
                                  setActivePanel((value) =>
                                    value === 'graphics' ? null : 'graphics',
                                  )
                                }
                              >
                                <Shapes aria-hidden="true" />
                                Graphics
                              </button>
                            </Tooltip>
                          </>
                        }
                      />
                      {photo &&
                        (resolved.missing.length > 0 ||
                          resolved.invalidSyntax) && (
                          <div className="mt-2 space-y-2 text-xs" role="status">
                            {emptyFields.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-notice-warning">
                                <span>Empty:</span>
                                {emptyFields.map((field) => (
                                  <span
                                    key={field}
                                    data-value-status="empty"
                                    className="metadata-issue-badge min-w-0 rounded border px-1.5 py-0.5 break-all"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                            {unknownFields.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-notice-error">
                                <span>Unknown:</span>
                                {unknownFields.map((field) => (
                                  <span
                                    key={field}
                                    data-value-status="absent"
                                    className="metadata-issue-badge min-w-0 rounded border px-1.5 py-0.5 break-all"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                            {missingGraphics.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span>Missing images or icons:</span>
                                {missingGraphics.map((field) => (
                                  <span
                                    key={field}
                                    className="control-neutral min-w-0 rounded px-1.5 py-0.5 break-all"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                            {resolved.invalidSyntax && (
                              <p>Check token syntax.</p>
                            )}
                          </div>
                        )}
                    </InspectorSection>
                  </>
                  <CaptionControls
                    colorSelectionSource={
                      colorSelections[activeContainer.id]?.value ===
                      settings.style.color
                        ? colorSelections[activeContainer.id]?.source
                        : undefined
                    }
                    onColorSelectionSourceChange={(source, color) =>
                      setColorSelections((entries) => ({
                        ...entries,
                        [activeContainer.id]: { value: color, source },
                      }))
                    }
                    scope="local"
                    dimensions={dimensions}
                    caption={settings}
                    onChange={setSettings}
                    disabled={exporting}
                    onBrowseColors={() =>
                      setActivePanel((value) =>
                        value === 'colors' ? null : 'colors',
                      )
                    }
                    onBrowseFonts={() =>
                      setActivePanel((value) =>
                        value === 'fonts' ? null : 'fonts',
                      )
                    }
                  />
                  <BackgroundControls
                    caption={settings}
                    dimensions={dimensions}
                    onChange={setSettings}
                    disabled={exporting}
                    glassEnabled
                  />
                  <CaptionPositionControls
                    caption={settings}
                    dimensions={dimensions}
                    onChange={setSettings}
                    disabled={exporting}
                  />
                </SidebarSection>
              )}
            </SidebarSection>
          </div>
          <SidebarSection
            id="export"
            defaultOpen={false}
            title="Export settings"
            iconTone="export"
            icon={<Download />}
          >
            {photo &&
              renderedCaptions.some(
                (item) => item.invalidSyntax || item.missing.length,
              ) && (
                <InlineNotice tone="warning" className="mb-3">
                  Some layers have missing fields or invalid tokens. Select them
                  to review their captions.
                </InlineNotice>
              )}
            <fieldset disabled={exporting}>
              <h3 className="mb-3 text-xs font-semibold">Image quality</h3>
              <label
                className="mt-2 flex items-center justify-between text-xs"
                htmlFor="jpeg-quality"
              >
                JPEG quality <span>{quality}%</span>
              </label>
              <div className="mt-3">
                <SegmentedControl
                  label="JPEG quality presets"
                  value={String(quality)}
                  onValueChange={(value) => setQuality(Number(value))}
                  disabled={exporting}
                  options={[
                    {
                      value: '60',
                      label: 'Small',
                      tooltip: 'JPEG quality · 60%',
                    },
                    {
                      value: '75',
                      label: 'Balanced',
                      tooltip: 'JPEG quality · 75%',
                    },
                    {
                      value: '95',
                      label: 'Best',
                      tooltip: 'JPEG quality · 95%',
                    },
                  ]}
                />
              </div>
              <div className="mt-3">
                <Slider
                  id="jpeg-quality"
                  label="JPEG quality"
                  min={1}
                  max={100}
                  step={1}
                  value={quality}
                  onValueChange={setQuality}
                  disabled={exporting}
                />
              </div>
              <div className="mt-5 space-y-3 border-t border-border-subtle pt-4">
                <h3 className="text-xs font-semibold">Metadata</h3>
                <Switch
                  className="[&_label]:font-medium"
                  label="Remove all metadata"
                  checked={metadataOptions.removeAll}
                  disabled={exporting}
                  onCheckedChange={(removeAll) =>
                    setMetadataOptions((current) => ({ ...current, removeAll }))
                  }
                  description="Only affects the exported file. Visible captions stay on the photo."
                />
                {!metadataOptions.removeAll && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium">Keep in exported file</p>
                    <div className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-input-base">
                      {exportMetadataGroups.map((group) => (
                        <Switch
                          key={group.id}
                          className="px-3 py-3 [&_label]:font-medium"
                          label={group.label}
                          description={group.description}
                          checked={metadataOptions.groups[group.id]}
                          disabled={exporting}
                          onCheckedChange={(checked) =>
                            setMetadataOptions((current) => ({
                              ...current,
                              groups: {
                                ...current.groups,
                                [group.id]: checked,
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs leading-5 text-content-secondary">
                      Saved as XMP. Unrecognized fields, thumbnails and editing
                      history are omitted.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5 border-t border-border-subtle pt-4">
                <h3 className="mb-3 text-xs font-semibold">Output file</h3>
                <Tooltip
                  content={
                    prepared.blob
                      ? `${prepared.blob.size.toLocaleString('en-US')} bytes`
                      : undefined
                  }
                >
                  <p
                    className="text-xs font-medium"
                    role="status"
                    aria-live="polite"
                    data-testid="output-size"
                    data-bytes={prepared.blob?.size}
                  >
                    Output:{' '}
                    {prepared.blob
                      ? formatBytes(prepared.blob.size)
                      : !photo
                        ? 'Open a photo to prepare export.'
                        : prepared.error
                          ? 'Unavailable'
                          : 'Calculating…'}
                  </p>
                </Tooltip>
                {photo &&
                  prepared.blob &&
                  prepared.blob.size > photo.document.photo.byteLength && (
                    <InlineNotice tone="warning" className="mt-2">
                      Output is larger than the original. Try a lower JPEG
                      quality.
                    </InlineNotice>
                  )}
                {prepared.error && (
                  <p role="alert" className="mt-2 text-xs">
                    {prepared.error}
                  </p>
                )}
                <p className="mt-3 text-xs leading-5 text-content-secondary">
                  Original dimensions · sRGB rendering. The original ICC profile
                  is not copied.
                </p>
              </div>
            </fieldset>
          </SidebarSection>
        </div>
      </ToolSidebar>
    </EditorWorkspace>
  );
}
