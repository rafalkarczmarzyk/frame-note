import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as CanvasImage } from 'react-konva';
import type { LoadedPhoto } from './load-photo';

export function PhotoWorkspace({ photo }: { photo: LoadedPhoto }) {
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [query, setQuery] = useState('');
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
      <div
        ref={host}
        className="min-h-[40vh] min-w-0 flex-1 md:min-h-0"
        role="img"
        aria-label={`Photo preview: ${photo.document.photo.name}`}
      >
        <Stage width={size.width} height={size.height}>
          <Layer>
            <CanvasImage
              image={photo.image}
              x={(size.width - width * scale) / 2}
              y={(size.height - height * scale) / 2}
              width={width * scale}
              height={height * scale}
            />
          </Layer>
        </Stage>
      </div>
      <aside
        className="flex min-h-0 max-h-[50vh] w-full shrink-0 flex-col border-t bg-background md:max-h-none md:w-80 md:border-t-0 md:border-l"
        aria-label="Photo metadata"
      >
        <div className="border-b p-5">
          <h1 className="break-all text-sm font-medium">
            {photo.document.photo.name}
          </h1>
          <p className="mt-2 text-xs text-foreground/70">
            {width} × {height} px
          </p>
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
        <dl className="min-h-0 overflow-y-auto p-5 text-xs">
          {fields.map((field) => (
            <div key={field.key} className="mb-5">
              <dt className="break-all text-foreground/70">{field.key}</dt>
              <dd className="mt-1 whitespace-pre-wrap break-all">
                {field.displayValue}
              </dd>
            </div>
          ))}
          {fields.length === 0 && <p>No matching metadata.</p>}
        </dl>
      </aside>
    </main>
  );
}
