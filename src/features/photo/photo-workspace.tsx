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
  TextQuote,
  Layers,
  Plus,
  Copy,
  Trash2,
  Tags,
  Shapes,
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

export function PhotoWorkspace({
  photo,
  initialLayout,
  initialIcons = [],
}: {
  photo: LoadedPhoto;
  initialLayout?: CaptionLayout;
  initialIcons?: SvgIcon[];
}) {
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
  useEffect(() => {
    let active = true;
    void Promise.all(
      icons.map(async (icon) => [icon.svg, await loadIcon(icon)] as const),
    ).then((entries) => {
      if (active) setIconImages(new Map(entries));
    });
    return () => {
      active = false;
    };
  }, [icons]);
  const iconsReady = icons.every((icon) => iconImages.has(icon.svg));
  const [activePanel, setActivePanel] = useState<
    'tags' | 'fonts' | 'colors' | 'icons' | null
  >(null);
  const tagsOpen = activePanel === 'tags';
  const [fontQuery, setFontQuery] = useState('');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState(
    () =>
      initialLayout ??
      createCaptionLayout({
        ...photo.document.caption,
        template: '{author}\n{lens}\n{exposure}',
      }),
  );
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
  const setTemplate = (template: string) =>
    setSettings({ ...settings, template });
  const selectContainer = (id: string) => {
    setEditingId(null);
    setLayout((value) => ({ ...value, activeId: id }));
  };
  const addContainer = (duplicate = false) => {
    setLayout((value) =>
      addCaption(
        value,
        Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) =>
          part.toString(16).padStart(8, '0'),
        ).join(''),
        duplicate,
        photo.document.photo.dimensions,
      ),
    );
  };
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState(95);
  const [error, setError] = useState('');
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
  );
  const renderedCaptions = useMemo(
    () =>
      layout.containers.map((container) => {
        const caption = containerCaption(layout, container);
        const resolved = resolveCaptionContent(
          caption.template,
          photo.document.photo.metadata,
          icons,
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
    Math.max(1, size.width - 48) / width,
    Math.max(1, size.height - 48) / height,
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
        className="min-h-[40vh] min-w-0 flex-1 bg-workspace-base md:min-h-0"
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
              <CanvasImage image={photo.image} width={width} height={height} />
              {fontReady &&
                iconsReady &&
                renderedCaptions.map(
                  ({ id, caption, text, color, icons: inlineIcons }) => {
                    const config = captionConfig(
                      { width, height },
                      caption,
                      text,
                      color,
                    );
                    const placeholder = !caption.template.trim();
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
                    const geometry = scene ?? {
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
                          {scene ? (
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
                          (text || placeholder) && (
                            <Rect
                              x={geometry.x - 4 / scale}
                              y={geometry.y - 4 / scale}
                              width={geometry.width + 8 / scale}
                              height={geometry.height + 8 / scale}
                              stroke={getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-porcelain')
                                .trim()}
                              strokeWidth={1 / scale}
                              dash={[4 / scale, 3 / scale]}
                              listening={false}
                            />
                          )}
                      </Group>
                    );
                  },
                )}
            </Group>
          </Layer>
        </Stage>
      </div>
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
      {activePanel && activePanel !== 'colors' && activePanel !== 'icons' && (
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
          <section aria-label="Document settings">
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
            <div className="px-7 pt-3">
              <h2 className="text-sm font-semibold">Document</h2>
              <p className="mt-1 text-xs text-content-secondary">
                Applies to all containers
              </p>
            </div>
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
            title="Containers"
            iconTone="caption"
            icon={<Layers />}
          >
            <div className="mb-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContainer()}
              >
                <Plus aria-hidden="true" />
                Add container
              </Button>
            </div>
            <PickerList
              items={layout.containers.map((container, index) => ({
                id: container.id,
                label:
                  container.template
                    .trim()
                    .replace(/\s+/gu, ' ')
                    .slice(0, 70) || 'Empty caption',
                description: (
                  <span className="flex items-center gap-1.5">
                    <span>{index + 1} ·</span>
                    <AnchorIcon
                      value={container.position.anchor}
                      className="size-3.5 shrink-0"
                    />
                    <span>
                      {container.position.custom ? 'Custom · ' : ''}
                      {container.position.anchor.replaceAll('-', ' ')}
                    </span>
                  </span>
                ),
                selected: layout.activeId === container.id,
                actions: (
                  <div className="flex items-center">
                    <IconButton
                      label={`Duplicate container ${index + 1}`}
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
                      label={`Delete container ${index + 1}`}
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
              selectedLabel=""
              onChoose={selectContainer}
              onHover={setHoveredId}
              emptyText="Add a text container to begin."
            />
            {activeContainer &&
              layout.containers.some(
                (container) =>
                  container.id !== activeContainer.id &&
                  !container.position.custom &&
                  !activeContainer.position.custom &&
                  container.position.anchor === activeContainer.position.anchor,
              ) && (
                <InlineNotice tone="warning" className="mt-3">
                  Multiple containers use this anchor and may overlap. Select
                  each from the list to change its anchor.
                </InlineNotice>
              )}
          </SidebarSection>
          {activeContainer && (
            <section
              key={activeContainer.id}
              aria-label="Selected container"
              className="mx-3 my-3 rounded-xl border border-container-settings-border bg-container-settings-base py-1 [&>details]:mx-2 [&>details]:my-2"
            >
              <div className="px-4 pt-3 pb-1">
                <h2 className="text-sm font-semibold">Selected container</h2>
                <p className="mt-1 truncate text-xs text-content-secondary">
                  {template.trim() || 'Empty caption'}
                </p>
              </div>
              <SidebarSection
                id="caption"
                title="Caption"
                iconTone="caption"
                icon={<TextQuote />}
              >
                <CaptionEditor
                  value={template}
                  fields={photo.document.photo.metadata}
                  icons={icons}
                  onChange={setTemplate}
                  onFocus={() => setEditingId(activeContainer.id)}
                  onBlur={() => setEditingId(null)}
                  onReady={editorReady}
                />
                {(resolved.missing.length > 0 || resolved.invalidSyntax) && (
                  <p className="mt-2 text-xs" role="status">
                    {resolved.invalidSyntax ? 'Check token syntax. ' : ''}
                    {resolved.missing.length
                      ? `Missing fields: ${resolved.missing.join(', ')}`
                      : ''}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-w-0 flex-1 basis-28 whitespace-nowrap"
                    aria-label={
                      tagsOpen ? 'Hide available tags' : 'Browse available tags'
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
                    className="min-w-0 flex-1 basis-28 whitespace-nowrap"
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
                </div>
              </SidebarSection>
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
            </section>
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
                Some containers have missing fields or invalid tokens. Select
                them to review their captions.
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
          {error && (
            <p role="alert" className="p-5 text-xs">
              {error}
            </p>
          )}
        </div>
      </ToolSidebar>
    </EditorWorkspace>
  );
}
