import {
  EditorWorkspace,
  ToolSidebar,
} from '@/components/layout/editor-workspace';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PickerList } from '@/components/ui/picker-list';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { InlineNotice } from '@/components/ui/inline-notice';
import { formatBytes } from '@/lib/format-bytes';
import { usePreparedExport } from '../caption/use-prepared-export';
import { createPortal } from 'react-dom';
import {
  insertToken,
  usedTokens,
  type TextSelection,
} from '../caption/insert-token';
import { CaptionControls } from '../caption/caption-controls';
import { Button } from '@/components/ui/button';
import { resolveTemplate } from '../caption/template';
import { captionConfig, exportName } from '../caption/render';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Group, Text, Image as CanvasImage } from 'react-konva';
import type { LoadedPhoto } from './load-photo';

export function PhotoWorkspace({ photo }: { photo: LoadedPhoto }) {
  const host = useRef<HTMLDivElement>(null);
  const templateInput = useRef<HTMLTextAreaElement>(null);
  const selection = useRef<TextSelection>({ start: 0, end: 0 });
  const [activePanel, setActivePanel] = useState<'tags' | 'fonts' | null>(null);
  const tagsOpen = activePanel === 'tags';
  const [fontQuery, setFontQuery] = useState('');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
  const [template, setTemplate] = useState(
    '{exif:Artist}\n{exif:LensModel}\n{exif:ExposureTime} s · {exif:FNumber} · ISO {exif:ISOSpeedRatings}',
  );
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState(95);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(photo.document.caption);
  const [loadedFont, setLoadedFont] = useState('');
  const fontKey = `${settings.style.fontWeight} 16px "${settings.style.fontFamily}"`;
  const fontReady = loadedFont === fontKey;
  const caption = useMemo(
    () => ({ ...settings, template }),
    [settings, template],
  );
  const used = usedTokens(template);
  const exportTarget = document.getElementById('export-actions');
  const rememberSelection = () => {
    const element = templateInput.current;
    if (element)
      selection.current = {
        start: element.selectionStart,
        end: element.selectionEnd,
      };
  };
  const addToken = (key: string) => {
    const result = insertToken(template, key, selection.current);
    selection.current = { start: result.cursor, end: result.cursor };
    setTemplate(result.template);
    requestAnimationFrame(() => {
      templateInput.current?.focus({ preventScroll: true });
      templateInput.current?.setSelectionRange(result.cursor, result.cursor);
    });
  };
  const resolved = resolveTemplate(template, photo.document.photo.metadata);
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${caption.style.color}`)
    .trim();
  const exportRequest = useMemo(
    () => ({
      image: photo.image,
      dimensions: photo.document.photo.dimensions,
      caption,
      text: resolved.text,
      color,
      quality,
    }),
    [photo, caption, resolved.text, color, quality],
  );
  const prepared = usePreparedExport(exportRequest, fontReady);
  useEffect(() => {
    let active = true;
    void document.fonts
      .load(fontKey)
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
      (resolved.invalidSyntax || resolved.missing.length) &&
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
  const fields = photo.document.photo.metadata.filter((field) =>
    `${field.key} ${field.displayValue}`
      .toLowerCase()
      .includes(query.toLowerCase()),
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
        className="min-h-[40vh] min-w-0 flex-1 md:min-h-0"
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
              {fontReady && (
                <Text
                  {...captionConfig(
                    { width, height },
                    caption,
                    resolved.text,
                    color,
                  )}
                />
              )}
            </Group>
          </Layer>
        </Stage>
      </div>
      {activePanel && (
        <FloatingPanel
          id="auxiliary-panel"
          title={tagsOpen ? 'Available tags' : 'Choose a font'}
          description={
            tagsOpen
              ? 'Click a field to insert it into your caption.'
              : 'Preview a font and apply it to your caption.'
          }
          onClose={() => setActivePanel(null)}
          className="absolute inset-y-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] md:right-[calc(var(--tools-sidebar-width)+1rem)]"
          toolbar={
            tagsOpen ? (
              <>
                <Input
                  aria-label="Search metadata"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fields or values…"
                  className="bg-background/30"
                />
                <p className="mt-2 text-xs text-foreground/70">
                  {fields.length} fields
                </p>
              </>
            ) : (
              <Input
                aria-label="Search fonts"
                value={fontQuery}
                onChange={(event) => setFontQuery(event.target.value)}
                placeholder="Search fonts…"
                className="bg-background/30"
              />
            )
          }
        >
          {tagsOpen ? (
            <PickerList
              items={fields.map((field) => ({
                id: field.key,
                label: field.key,
                description: field.displayValue,
                selected: used.has(field.key),
              }))}
              selectedLabel="Used"
              onChoose={addToken}
              emptyText="No matching metadata."
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
            defaultOpen={false}
            summary={formatBytes(photo.document.photo.byteLength)}
          >
            <h1 className="break-all text-sm font-medium">
              {photo.document.photo.name}
            </h1>
            <p className="mt-2 text-xs text-foreground/70">
              {width} × {height} px
            </p>
            <p
              className="mt-1 text-xs text-foreground/70"
              title={`${photo.document.photo.byteLength.toLocaleString('en-US')} bytes`}
            >
              Input: {formatBytes(photo.document.photo.byteLength)}
            </p>
          </SidebarSection>
          <SidebarSection
            id="caption"
            title="Caption"
            summary={
              resolved.missing.length || resolved.invalidSyntax
                ? 'Check tokens'
                : `${resolved.text ? resolved.text.split('\n').length : 0} lines`
            }
          >
            <label className="sr-only" htmlFor="caption-template">
              Caption
            </label>
            <Textarea
              ref={templateInput}
              id="caption-template"
              value={template}
              onSelect={rememberSelection}
              onBlur={rememberSelection}
              onChange={(event) => {
                setTemplate(event.target.value);
                rememberSelection();
              }}
              rows={6}
              spellCheck={false}
              className="mt-2 w-full resize-y rounded-sm border bg-background p-3 text-xs leading-5 focus-visible:outline-primary"
            />
            {(resolved.missing.length > 0 || resolved.invalidSyntax) && (
              <p className="mt-2 text-xs" role="status">
                {resolved.invalidSyntax ? 'Check token syntax. ' : ''}
                {resolved.missing.length
                  ? `Missing fields: ${resolved.missing.join(', ')}`
                  : ''}
              </p>
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                aria-expanded={tagsOpen}
                aria-controls="auxiliary-panel"
                onClick={() =>
                  setActivePanel((value) => (value === 'tags' ? null : 'tags'))
                }
              >
                {tagsOpen ? 'Hide available tags' : 'Browse available tags'}
              </Button>
            </div>
          </SidebarSection>
          <CaptionControls
            caption={settings}
            onChange={setSettings}
            disabled={exporting}
            onBrowseFonts={() =>
              setActivePanel((value) => (value === 'fonts' ? null : 'fonts'))
            }
          />

          <SidebarSection
            id="export"
            title="Export"
            summary={`${quality === 95 ? 'Best' : quality === 75 ? 'Balanced' : quality === 60 ? 'Small' : `${quality}%`} · ${prepared.blob ? formatBytes(prepared.blob.size) : prepared.error ? 'Unavailable' : 'Calculating…'}`}
          >
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
              <p className="mt-3 text-xs leading-5 text-foreground/70">
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
