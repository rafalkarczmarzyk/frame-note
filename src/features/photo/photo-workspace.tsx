import { activeImageAssets } from '@/domain/image-retention';
import { moveLayer, toggleLayerVisibility } from '@/domain/caption-layout';
import { Eye, EyeOff } from 'lucide-react';
import { migrateLogo, parseImageToken } from '@/domain/inline-image';
import { MarginRulers } from './margin-rulers';
import { MarginPreviewProvider } from '@/components/ui/margin-preview-provider';
import { InspectorSection } from '@/components/layout/inspector-section';
import { createId } from '@/lib/create-id';
import { defaultTemplate } from '@/domain/builtin-presets';
import { PresetControls } from '../presets/preset-controls';
import { logoLayout } from '../caption/logo-layout';
import { tintedIcon } from '../caption/inline-layout';
import { svgUrl } from '../caption/svg-icons';
import { brandIcons } from '../caption/brand-icons';
import { iconMarker } from '../caption/inline-content';
import { builtinIcons } from '../caption/builtin-icons';
import type { Editor } from '@tiptap/react';
import { CaptionEditor } from '../caption/editor/caption-editor';
import { IconPickerPanel } from '../caption/icon-picker-panel';
import { loadIcon, type SvgIcon } from '../caption/svg-icons';
import { resolveCaptionContent } from '../caption/inline-content';
import { inlineLayout } from '../caption/inline-layout';
import { InlinePreview } from '../caption/inline-preview';
import { customPoint, customPosition } from '../caption/layout';
import { AnchorIcon } from '@/components/ui/anchor-picker';
import {
  addCaption,
  containerCaption,
  createCaptionLayout,
  removeCaption,
  updateCaption,
  type CaptionLayout,
} from '@/domain/caption-layout';
import { createCaption, type Caption } from '@/domain/document';
import { IconButton } from '@/components/ui/icon-button';
import { MetadataPicker } from '../caption/metadata-picker';
import { metadataGroups } from '@/domain/caption-tags';
import { ColorPickerPanel } from '../caption/color-picker-panel';
import { resolveCaptionColor } from '@/domain/caption-colors';
import {
  Download,
  Layers,
  Plus,
  Copy,
  Trash2,
  Tags,
  Shapes,
  Type,
} from 'lucide-react';
import { PhotoIcon } from '@/components/icons/photo-icon';
import {
  EditorWorkspace,
  ToolSidebar,
} from '@/components/layout/editor-workspace';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PickerList } from '@/components/ui/picker-list';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { InlineNotice } from '@/components/ui/inline-notice';
import { formatBytes } from '@/lib/format-bytes';
import { usePreparedExport } from '../caption/use-prepared-export';
import { createPortal } from 'react-dom';
import { usedTokens } from '../caption/insert-token';
import { CaptionControls } from '../caption/caption-controls';
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
  initialLayout,
  initialIcons = [],
}: {
  photo: LoadedPhoto;
  initialLayout?: CaptionLayout;
  initialIcons?: SvgIcon[];
}) {
  const [error, setError] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const editorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);
  const [icons, setIcons] = useState<SvgIcon[]>(() => [
    ...builtinIcons,
    ...initialIcons.filter(
      (icon) => !builtinIcons.some((builtin) => builtin.name === icon.name),
    ),
  ]);
  const [iconImages, setIconImages] = useState<
    ReadonlyMap<string, HTMLImageElement>
  >(new Map());
  const [activePanel, setActivePanel] = useState<
    'tags' | 'fonts' | 'colors' | 'icons' | 'presets' | null
  >(null);
  const [presetHost, setPresetHost] = useState<HTMLDivElement | null>(null);
  const tagsOpen = activePanel === 'tags';
  const [fontQuery, setFontQuery] = useState('');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState(() =>
    initialLayout
      ? {
          ...initialLayout,
          containers: initialLayout.containers.map(migrateLogo),
        }
      : createCaptionLayout({
          ...photo.document.caption,
          template: defaultTemplate,
        }),
  );
  const assets = useMemo(() => {
    const visible = layout.containers.filter(
      (container) => container.visible !== false,
    );
    const used = new Set(
      visible.flatMap((container) =>
        [...container.template.matchAll(/\{icon:([^{}]+)\}/gu)].map(
          (match) => match[1],
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
        photo.document.photo.dimensions,
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
    setLayout((value) =>
      addCaption(value, createId(), duplicate, photo.document.photo.dimensions),
    );
  };
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState(95);
  const [loadedFont, setLoadedFont] = useState('');
  const fontKey = [
    ...new Set(
      layout.containers.map(
        (container) =>
          `${container.style.fontWeight} 16px "${container.style.fontFamily}"`,
      ),
    ),
  ]
    .sort()
    .join('|');
  const fontReady = loadedFont === fontKey;
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
    photo.document.photo.metadata,
    icons,
    settings.images,
  );
  const renderedCaptions = useMemo(
    () =>
      layout.containers
        .filter((container) => container.visible !== false)
        .map((container) => {
          const caption = containerCaption(layout, container);
          const resolved = resolveCaptionContent(
            caption.template,
            photo.document.photo.metadata,
            icons,
            caption.images,
          );
          const color = resolveCaptionColor(caption.style.color, (name) =>
            getComputedStyle(document.documentElement).getPropertyValue(
              `--color-${name}`,
            ),
          );
          return { id: container.id, caption, ...resolved, color };
        }),
    [layout, photo, icons],
  );
  const exportCaptions = useMemo(
    () =>
      renderedCaptions.map(({ caption, text, color, icons }) => ({
        caption,
        text,
        color,
        icons,
      })),
    [renderedCaptions],
  );
  const exportRequest = useMemo(
    () => ({
      image: photo.image,
      dimensions: photo.document.photo.dimensions,
      captions: exportCaptions,
      quality,
    }),
    [photo, exportCaptions, quality],
  );
  const prepared = usePreparedExport(exportRequest, fontReady && iconsReady);
  useEffect(() => {
    let active = true;
    void Promise.all(
      fontKey
        ? fontKey.split('|').map((font) => document.fonts.load(font))
        : [],
    )
      .then(() => {
        if (active) setLoadedFont(fontKey);
      })
      .catch(() => {
        if (active) setError('Could not load the caption font.');
      });
    return () => {
      active = false;
    };
  }, [fontKey]);
  const download = () => {
    if (!prepared.blob) return;
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
  const { width, height } = photo.document.photo.dimensions;
  const scale = Math.min(
    Math.max(1, size.width - 80) / width,
    Math.max(1, size.height - 80) / height,
    1,
  );
  const fields = photo.document.photo.metadata;
  const matchingFieldCount = metadataGroups(fields, query).reduce(
    (count, group) => count + group.fields.length,
    0,
  );
  return (
    <EditorWorkspace>
      {exportTarget &&
        createPortal(
          <Button disabled={!prepared.blob || exporting} onClick={download}>
            {exporting ? 'Exporting…' : 'Export JPG'}
          </Button>,
          exportTarget,
        )}
      <div
        ref={host}
        className="relative min-h-[40vh] min-w-0 flex-1 bg-workspace-base md:min-h-0"
      >
        <div
          role="img"
          aria-label={`Photo preview: ${photo.document.photo.name}`}
        >
          <Stage width={size.width} height={size.height}>
            <Layer>
              <Group
                x={(size.width - width * scale) / 2}
                y={(size.height - height * scale) / 2}
                scaleX={scale}
                scaleY={scale}
                clipWidth={width}
                clipHeight={height}
              >
                <CanvasImage
                  image={photo.image}
                  width={width}
                  height={height}
                />
                {fontReady &&
                  renderedCaptions.map(
                    ({ id, caption, text, color, icons: inlineIcons }) => {
                      if (
                        (caption.logo &&
                          !iconImages.has(caption.logo.asset.svg)) ||
                        inlineIcons.some((icon) => !iconImages.has(icon.svg))
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
                      return (
                        <Group key={id}>
                          <Group
                            x={geometry.x}
                            y={geometry.y}
                            width={geometry.width}
                            height={geometry.height}
                            opacity={placeholder ? 0.4 : caption.style.opacity}
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
                                containers: value.containers.map((container) =>
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
                              width={geometry.width}
                              height={geometry.height}
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
                                        iconImages.get(caption.logo.asset.svg)!,
                                        logoGeometry.height,
                                        color,
                                      )
                                    : iconImages.get(caption.logo.asset.svg)
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
                                x={geometry.x - 4 / scale}
                                y={geometry.y - 4 / scale}
                                width={geometry.width + 8 / scale}
                                height={geometry.height + 8 / scale}
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
                                    .getPropertyValue('--color-panel-base')
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
                                    .getPropertyValue('--color-content-primary')
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
          onChange={(margins) => setLayout((value) => ({ ...value, margins }))}
          dimensions={{ width, height }}
          unit={layout.sizingUnit}
          margins={layout.margins}
          linkMode={layout.marginLinkMode}
          scale={scale}
          x={(size.width - width * scale) / 2}
          y={(size.height - height * scale) / 2}
        />
      </div>
      {activePanel === 'presets' && (
        <div
          ref={setPresetHost}
          className="max-h-[40vh] w-full shrink-0 md:max-h-none md:w-80"
        />
      )}
      {activePanel === 'icons' && (
        <IconPickerPanel
          icons={icons}
          onUpload={(icon) => setIcons((value) => [...value, icon])}
          onChoose={(name) => addToken(`icon:${name}`)}
          onClose={() => setActivePanel(null)}
          className="max-h-[40vh] w-full shrink-0 rounded-none shadow-none md:max-h-none md:w-80"
        />
      )}
      {activePanel === 'colors' && (
        <ColorPickerPanel
          value={settings.style.color}
          onChange={(color) =>
            setSettings((value) => ({
              ...value,
              style: { ...value.style, color },
            }))
          }
          onClose={() => setActivePanel(null)}
          surface="solid"
          className="max-h-[40vh] w-full shrink-0 rounded-none shadow-none md:max-h-none md:w-80"
        />
      )}
      {activePanel &&
        activePanel !== 'colors' &&
        activePanel !== 'icons' &&
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
                  <p className="mt-2 text-xs text-content-secondary">
                    {matchingFieldCount} tags
                  </p>
                </>
              ) : (
                <Input
                  aria-label="Search fonts"
                  value={fontQuery}
                  onChange={(event) => setFontQuery(event.target.value)}
                  placeholder="Search fonts…"
                  className="bg-preview-placeholder"
                />
              )
            }
          >
            {tagsOpen ? (
              <MetadataPicker
                fields={fields}
                query={query}
                used={used}
                onChoose={addToken}
              />
            ) : (
              <PickerList
                items={[
                  {
                    id: 'Montserrat Variable',
                    label: 'Montserrat',
                    description: 'Sans serif · Regular / Bold',
                    preview: (
                      <span className="font-sans text-xl">
                        Every frame has a story.
                      </span>
                    ),
                  },
                  {
                    id: 'Advercase',
                    label: 'Advercase',
                    description: 'Display serif · Regular / Bold',
                    preview: (
                      <span className="font-display text-2xl">
                        Every frame has a story.
                      </span>
                    ),
                  },
                ]
                  .filter((font) =>
                    font.label.toLowerCase().includes(fontQuery.toLowerCase()),
                  )
                  .map((font) => ({
                    ...font,
                    selected: settings.style.fontFamily === font.id,
                  }))}
                onChoose={(id) =>
                  setSettings((value) => ({
                    ...value,
                    style: {
                      ...value.style,
                      fontFamily: id as typeof value.style.fontFamily,
                    },
                  }))
                }
                emptyText="No matching fonts."
              />
            )}
          </FloatingPanel>
        )}
      <ToolSidebar aria-label="Photo tools">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarSection
            id="photo"
            title="Photo"
            iconTone="photo"
            icon={<PhotoIcon />}
            defaultOpen={false}
          >
            <h1 className="break-all text-sm font-medium">
              {photo.document.photo.name}
            </h1>
            <p className="mt-2 text-xs text-content-secondary">
              {width} × {height} px
            </p>
            <p
              className="mt-1 text-xs text-content-secondary"
              title={`${photo.document.photo.byteLength.toLocaleString('en-US')} bytes`}
            >
              Input: {formatBytes(photo.document.photo.byteLength)}
            </p>
          </SidebarSection>
          <PresetControls
            panelHost={presetHost}
            onBrowse={() => setActivePanel('presets')}
            onClose={() => setActivePanel(null)}
            layout={layout}
            icons={icons}
            disabled={exporting}
            persist={!initialLayout}
            onApply={(preset) => {
              setLayout(structuredClone(preset.layout));
              setIcons([
                ...preset.icons,
                ...builtinIcons.filter(
                  (icon) =>
                    !preset.icons.some((saved) => saved.name === icon.name),
                ),
              ]);
              setHoveredId(null);
              setEditingId(null);
            }}
          />
          <section aria-label="Document settings">
            <CaptionControls
              scope="global"
              dimensions={photo.document.photo.dimensions}
              caption={settings}
              onChange={(caption) =>
                setLayout((value) =>
                  updateCaption(
                    value,
                    '',
                    caption,
                    photo.document.photo.dimensions,
                  ),
                )
              }
              disabled={exporting}
              onBrowseColors={() => {}}
              onBrowseFonts={() => {}}
            />
          </section>
          <SidebarSection
            id="containers"
            title="Layers"
            iconTone="caption"
            icon={<Layers />}
          >
            {(error || assetError) && (
              <p role="alert" className="mb-3 text-xs">
                {error || assetError}
              </p>
            )}
            <PickerList
              onMove={(id, index) =>
                setLayout((value) => moveLayer(value, id, index))
              }
              items={[...layout.containers]
                .reverse()
                .map((container, index) => ({
                  muted: container.visible === false,
                  controlsLeft: (
                    <IconButton
                      aria-pressed={container.visible !== false}
                      label={`${container.visible === false ? 'Show' : 'Hide'} layer ${index + 1}`}
                      onClick={() =>
                        setLayout((value) =>
                          toggleLayerVisibility(value, container.id),
                        )
                      }
                    >
                      {container.visible === false ? <EyeOff /> : <Eye />}
                    </IconButton>
                  ),
                  id: container.id,
                  leading: container.logo ? (
                    <img
                      src={svgUrl(container.logo.asset.svg)}
                      alt=""
                      className="size-6 shrink-0 rounded bg-content-primary p-0.5"
                    />
                  ) : undefined,
                  label:
                    container.logo?.asset.name ||
                    container.template
                      .replace(/\{(image:[^{}]*)\}/gu, (_, token: string) => {
                        const reference = parseImageToken(token);
                        return (
                          container.images?.find(
                            (image) => image.id === reference?.assetId,
                          )?.name ?? 'Missing image'
                        );
                      })
                      .trim()
                      .replace(/\s+/gu, ' ')
                      .slice(0, 70) ||
                    'Empty caption',
                  description: (
                    <span className="flex items-center gap-1.5">
                      <span>{index + 1} ·</span>
                      <AnchorIcon
                        value={container.position.anchor}
                        className="size-3.5 shrink-0"
                      />
                      <span>
                        {container.position.custom ? 'Manual · ' : ''}
                        {container.position.anchor.replaceAll('-', ' ')}
                      </span>
                    </span>
                  ),
                  selected: layout.activeId === container.id,
                  actions: (
                    <div className="flex items-center">
                      <IconButton
                        label={`Duplicate layer ${index + 1}`}
                        onClick={() => {
                          setEditingId(null);
                          setLayout((value) =>
                            addCaption(
                              { ...value, activeId: container.id },
                              Array.from(
                                crypto.getRandomValues(new Uint32Array(4)),
                                (part) => part.toString(16).padStart(8, '0'),
                              ).join(''),
                              true,
                              photo.document.photo.dimensions,
                            ),
                          );
                        }}
                      >
                        <Copy />
                      </IconButton>
                      <IconButton
                        label={`Delete layer ${index + 1}`}
                        onClick={() => {
                          if (layout.activeId === container.id) {
                            setEditingId(null);
                          }
                          setHoveredId(null);
                          setLayout((value) =>
                            removeCaption(value, container.id),
                          );
                        }}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  ),
                }))}
              selectionTone="container"
              selectedLabel=""
              onChoose={selectContainer}
              onHover={setHoveredId}
              emptyText="Add a layer to begin."
            />
            {activeContainer &&
              activeContainer.visible !== false &&
              layout.containers.some(
                (container) =>
                  container.id !== activeContainer.id &&
                  container.visible !== false &&
                  !container.position.custom &&
                  !activeContainer.position.custom &&
                  container.position.anchor === activeContainer.position.anchor,
              ) && (
                <InlineNotice tone="warning" className="mt-3">
                  Multiple layers use this anchor and may overlap. Select each
                  from the list to change its anchor.
                </InlineNotice>
              )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContainer()}
              >
                <Plus aria-hidden="true" />
                Add layer
              </Button>
            </div>
          </SidebarSection>
          {activeContainer && (
            <SidebarSection
              key={activeContainer.id}
              id="selected-container"
              title="Layer"
              icon={<Type />}
              iconTone="typography"
              surface="container"
            >
              <>
                <InspectorSection title="Content">
                  <CaptionEditor
                    value={template}
                    images={settings.images}
                    sizingUnit={settings.sizingUnit}
                    fontSize={settings.style.fontSize}
                    dimensions={photo.document.photo.dimensions}
                    fields={photo.document.photo.metadata}
                    icons={icons}
                    onChange={setTemplate}
                    onFocus={() => setEditingId(activeContainer.id)}
                    onBlur={() => setEditingId(null)}
                    onReady={editorReady}
                    actions={
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={
                            tagsOpen
                              ? 'Hide available tags'
                              : 'Browse available tags'
                          }
                          aria-expanded={tagsOpen}
                          aria-controls="auxiliary-panel"
                          onClick={() =>
                            setActivePanel((value) =>
                              value === 'tags' ? null : 'tags',
                            )
                          }
                        >
                          <Tags aria-hidden="true" />
                          Tags
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Browse icons"
                          aria-expanded={activePanel === 'icons'}
                          onClick={() =>
                            setActivePanel((value) =>
                              value === 'icons' ? null : 'icons',
                            )
                          }
                        >
                          <Shapes aria-hidden="true" />
                          Icons
                        </Button>
                      </>
                    }
                  />
                  {settings.visible !== false &&
                    (resolved.missing.length > 0 || resolved.invalidSyntax) && (
                      <p className="mt-2 text-xs" role="status">
                        {resolved.invalidSyntax ? 'Check token syntax. ' : ''}
                        {resolved.missing.length
                          ? `Missing fields: ${resolved.missing.join(', ')}`
                          : ''}
                      </p>
                    )}
                </InspectorSection>
              </>
              <CaptionControls
                scope="local"
                dimensions={photo.document.photo.dimensions}
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
            </SidebarSection>
          )}
          <SidebarSection
            id="export"
            title="Export"
            iconTone="export"
            icon={<Download />}
          >
            {renderedCaptions.some(
              (item) => item.invalidSyntax || item.missing.length,
            ) && (
              <InlineNotice tone="warning" className="mb-3">
                Some layers have missing fields or invalid tokens. Select them
                to review their captions.
              </InlineNotice>
            )}
            <fieldset disabled={exporting}>
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
                    { value: '60', label: 'Small', title: '60%' },
                    { value: '75', label: 'Balanced', title: '75%' },
                    { value: '95', label: 'Best', title: '95%' },
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
              <p
                className="mt-3 text-xs"
                role="status"
                aria-live="polite"
                data-testid="output-size"
                data-bytes={prepared.blob?.size}
                title={
                  prepared.blob
                    ? `${prepared.blob.size.toLocaleString('en-US')} bytes`
                    : undefined
                }
              >
                Output:{' '}
                {prepared.blob
                  ? formatBytes(prepared.blob.size)
                  : prepared.error
                    ? 'Unavailable'
                    : 'Calculating…'}
              </p>
              {prepared.blob &&
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
                Original dimensions · sRGB rendering. EXIF, GPS and other source
                metadata are removed. The original ICC profile is not copied.
              </p>
            </fieldset>
          </SidebarSection>
        </div>
      </ToolSidebar>
    </EditorWorkspace>
  );
}
