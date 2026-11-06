import { useEffect, useRef, useState } from 'react';
import { PickerList } from '@/components/ui/picker-list';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { platform } from '@/lib/platform';
import {
  availableFonts,
  isFontAvailable,
  captionRenderFont,
  resolvedFontFamily,
  type CaptionFont,
  type FontFamily,
} from '../../../../core/src/fonts';
import { segmentYearMark } from '../../../../core/src/date-format';
import { createCaption } from '../../../../core/src/document';
import { filterByCategory } from '@/lib/category-filter';
import { ensureCaptionFont } from './font-loading';

function FontPreview({ font }: { font: CaptionFont }) {
  const host = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState('loading');
  const sample =
    font.id === '7-Segment' ? `${segmentYearMark}26 07 06` : 'Leave your mark.';
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
          if (active) setStatus(isFontAvailable(font.id) ? 'ready' : 'error');
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
      style={
        status === 'ready'
          ? { fontFamily: captionRenderFont(font.id) }
          : undefined
      }
    >
      {status === 'ready' ? (
        sample
      ) : (
        <span className="text-xs text-content-muted">
          {status === 'error' ? 'Preview unavailable.' : 'Loading preview…'}
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
  showSources = !!platform().systemFonts,
}: {
  /** Desktop mixes bundled and installed fonts; web keeps the list uncluttered. */
  showSources?: boolean;
  category?: string;
  value: string;
  query: string;
  onChoose: (id: FontFamily) => void;
}) {
  const fonts = filterByCategory(
    availableFonts(),
    category,
    (font) => [font.category],
    query,
    (font) => font.label,
  ).sort((a, b) =>
    a.label.localeCompare(b.label, 'en', {
      sensitivity: 'base',
      numeric: true,
    }),
  );
  return (
    <div className="space-y-3">
      <PickerList
        density="dense"
        selectedLabel=""
        items={fonts.map((font) => ({
          id: font.id,
          label: font.label,
          selected: font.id === resolvedFontFamily(value),
          trailing: showSources ? (
            <Tooltip
              content={
                font.category === 'System'
                  ? 'Installed on this computer. May be unavailable on another device or in the web app.'
                  : 'Included with FrameNote.'
              }
            >
              <Badge>{font.category === 'System' ? 'System' : 'App'}</Badge>
            </Tooltip>
          ) : undefined,
          preview: <FontPreview font={font} />,
        }))}
        onChoose={onChoose}
        emptyText="No matching fonts."
      />
    </div>
  );
}
