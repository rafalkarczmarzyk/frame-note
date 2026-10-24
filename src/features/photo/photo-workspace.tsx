import { createPortal } from 'react-dom';
import {
  insertToken,
  usedTokens,
  type TextSelection,
} from '../caption/insert-token';
import { CaptionControls } from '../caption/caption-controls';
import { Button } from '@/components/ui/button';
import { resolveTemplate } from '../caption/template';
import { captionConfig, exportPhoto, exportName } from '../caption/render';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Group, Text, Image as CanvasImage } from 'react-konva';
import type { LoadedPhoto } from './load-photo';

export function PhotoWorkspace({ photo }: { photo: LoadedPhoto }) {
  const host = useRef<HTMLDivElement>(null);
  const templateInput = useRef<HTMLTextAreaElement>(null);
  const selection = useRef<TextSelection>({ start: 0, end: 0 });
  const [tagsOpen, setTagsOpen] = useState(false);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
  const [template, setTemplate] = useState(
    '{exif:Artist}\n{exif:LensModel}\n{exif:ExposureTime} s · {exif:FNumber} · ISO {exif:ISOSpeedRatings}',
  );
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(photo.document.caption);
  const [loadedFont, setLoadedFont] = useState('');
  const fontKey = `${settings.style.fontWeight} 16px "${settings.style.fontFamily}"`;
  const fontReady = loadedFont === fontKey;
  const caption = { ...settings, template };
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
  const download = async () => {
    if (
      (resolved.invalidSyntax || resolved.missing.length) &&
      !window.confirm(
        'Some tokens could not be resolved. Export the current caption anyway?',
      )
    )
      return;
    setExporting(true);
    setError('');
    try {
      const blob = await exportPhoto(
        photo.image,
        photo.document.photo.dimensions,
        caption,
        resolved.text,
        color,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportName(photo.document.photo.name);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
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
    <main className="flex min-h-0 flex-1 flex-col md:flex-row">
      {exportTarget &&
        createPortal(
          <Button
            disabled={!fontReady || exporting}
            onClick={() => void download()}
          >
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
      {tagsOpen && (
        <aside
          id="metadata-panel"
          className="flex min-h-0 max-h-[40vh] w-full shrink-0 flex-col border-t bg-background md:max-h-none md:w-72 md:border-t-0 md:border-l"
          aria-label="Available tags"
        >
          <div className="shrink-0 border-b p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Available tags</h2>
              <button
                type="button"
                onClick={() => setTagsOpen(false)}
                aria-label="Close tags"
                className="text-sm"
              >
                ×
              </button>
            </div>
            <label className="mt-6 block text-xs" htmlFor="metadata-search">
              Search metadata
            </label>
            <input
              id="metadata-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 w-full rounded-sm border bg-background px-3 py-2 text-sm outline-offset-2 focus-visible:outline-primary"
              placeholder="Field or value…"
            />
            <p className="mt-3 text-xs text-foreground/70">
              {fields.length} fields
            </p>
          </div>
          <dl className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-xs">
            {fields.map((field) => (
              <div key={field.key} className="mb-5">
                <dt>
                  <button
                    type="button"
                    className="break-all text-left text-foreground hover:underline aria-pressed:text-primary"
                    title="Insert token"
                    onClick={() => addToken(field.key)}
                    aria-pressed={used.has(field.key)}
                  >
                    {field.key}
                    {used.has(field.key) && (
                      <span className="ml-2 text-[10px]">✓ Used</span>
                    )}
                  </button>
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-all">
                  {field.displayValue}
                </dd>
              </div>
            ))}
            {fields.length === 0 && <p>No matching metadata.</p>}
          </dl>
        </aside>
      )}
      <aside
        className="flex min-h-0 max-h-[50vh] w-full shrink-0 flex-col border-t bg-background md:max-h-none md:w-80 md:border-t-0 md:border-l"
        aria-label="Photo tools"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <h1 className="break-all text-sm font-medium">
            {photo.document.photo.name}
          </h1>
          <p className="mt-2 text-xs text-foreground/70">
            {width} × {height} px
          </p>
          <label className="mt-6 block text-xs" htmlFor="caption-template">
            Caption
          </label>
          <textarea
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
          <CaptionControls
            caption={settings}
            onChange={setSettings}
            disabled={exporting}
          />

          <p className="mt-3 text-xs text-foreground/70">
            Basic export: JPEG 95%, original dimensions. Source metadata is not
            copied; original color profile preservation is not yet supported.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-xs">
              {error}
            </p>
          )}
        </div>
        <div className="shrink-0 border-t p-4">
          <Button
            variant="outline"
            className="w-full"
            aria-expanded={tagsOpen}
            aria-controls="metadata-panel"
            onClick={() => setTagsOpen((value) => !value)}
          >
            {tagsOpen ? 'Hide available tags' : 'Browse available tags'}
          </Button>
        </div>
      </aside>
    </main>
  );
}
