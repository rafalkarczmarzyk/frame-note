import { useEffect, useRef, useState } from 'react';
import { PickerList } from '@/components/ui/picker-list';
import {
  captionFont,
  captionFonts,
  type CaptionFont,
  type FontFamily,
} from '@/domain/fonts';
import { createCaption } from '@/domain/document';
import { filterByCategory } from '@/lib/category-filter';
import { ensureCaptionFont } from './font-loading';

function FontPreview({ font }: { font: CaptionFont }) {
  const host = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState('loading');
  const sample = 'Leave your mark.';
  useEffect(() => {
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void ensureCaptionFont(
        { ...createCaption().style, fontFamily: font.id },
        sample,
      )
        .then(() => {
          if (active) setStatus('ready');
        })
        .catch(() => {
          if (active) setStatus('error');
        });
    });
    if (host.current) observer.observe(host.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [font.id, sample]);
  return (
    <span
      ref={host}
      data-font-preview={font.id}
      data-font-preview-status={status}
      className="block h-7 truncate text-xl leading-7"
      style={status === 'ready' ? { fontFamily: `"${font.id}"` } : undefined}
    >
      {status === 'ready' ? (
        sample
      ) : (
        <span className="text-xs text-content-muted">
          {status === 'error'
            ? 'Preview unavailable. Reopen to retry.'
            : 'Loading preview…'}
        </span>
      )}
    </span>
  );
}
export function FontPicker({
  value,
  query,
  onChoose,
  category = 'all',
}: {
  category?: string;
  value: string;
  query: string;
  onChoose: (id: FontFamily) => void;
}) {
  const fonts = filterByCategory(
    captionFonts,
    category,
    (font) => [font.category],
    query,
    (font) => font.label,
  );
  return (
    <div className="space-y-3">
      <PickerList
        density="dense"
        items={fonts.map((font) => ({
          id: font.id,
          label: font.label,
          selected: font.id === value,
          preview: <FontPreview font={font} />,
        }))}
        onChoose={(id) => onChoose(captionFont(id).id)}
        emptyText="No matching fonts."
      />
    </div>
  );
}
