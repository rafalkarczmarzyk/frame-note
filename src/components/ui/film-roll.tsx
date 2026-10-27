import { useEffect, useRef, type CSSProperties } from 'react';
import { FilmRollStart } from '@/components/brand/film-roll-start';
import { FilmRollFrame } from '@/components/brand/film-roll-frame';
import { FilmRollEnd } from '@/components/brand/film-roll-end';
import { cn } from '@/lib/utils';
import './film-roll.css';

export interface FilmRollPhoto {
  id: string;
  src: string;
  name: string;
}

export interface FilmRollProps {
  photos: readonly FilmRollPhoto[];
  activePhotoId?: string;
  onSelectPhoto?: (id: string) => void;
  /** Overall height including the cassette; the SVG artwork scales uniformly. */
  height?: number;
  className?: string;
  disabled?: boolean;
}

export function FilmRoll({
  photos,
  activePhotoId,
  onSelectPhoto,
  height = 195,
  className,
  disabled = false,
}: FilmRollProps) {
  const rollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roll = rollRef.current;
    if (!roll) return;

    function scrollFilm(event: WheelEvent) {
      if (
        !roll ||
        event.ctrlKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      )
        return;

      const maxScroll = roll.scrollWidth - roll.clientWidth;
      if (maxScroll <= 0) return;
      const step =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? roll.clientWidth
            : 1;
      const nextScroll = Math.min(
        maxScroll,
        Math.max(0, roll.scrollLeft + event.deltaY * step),
      );
      if (nextScroll === roll.scrollLeft) return;

      event.preventDefault();
      roll.scrollLeft = nextScroll;
    }

    // React wheel handlers are passive; a native listener lets the roll consume
    // vertical wheel movement without also scrolling the surrounding page.
    roll.addEventListener('wheel', scrollFilm, { passive: false });
    return () => roll.removeEventListener('wheel', scrollFilm);
  }, []);

  useEffect(() => {
    const roll = rollRef.current;
    const selected = roll?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!roll || !selected) return;
    const frame = selected.getBoundingClientRect();
    const viewport = roll.getBoundingClientRect();
    if (frame.left < viewport.left)
      roll.scrollLeft -= viewport.left - frame.left;
    else if (frame.right > viewport.right)
      roll.scrollLeft += frame.right - viewport.right;
  }, [activePhotoId]);

  return (
    <div
      ref={rollRef}
      className={cn('film-roll overflow-x-auto', className)}
      style={{ '--film-roll-height': `${height}px` } as CSSProperties}
      role="region"
      aria-label="Photo film roll"
      tabIndex={0}
    >
      <div className="film-roll-strip">
        <FilmRollStart className="film-roll-start" />
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            disabled={disabled}
            className="film-roll-frame"
            aria-label={`Photo ${index + 1}: ${photo.name}`}
            aria-pressed={photo.id === activePhotoId}
            onClick={() => onSelectPhoto?.(photo.id)}
          >
            <span className="film-roll-photo">
              <img src={photo.src} alt="" draggable={false} decoding="async" />
            </span>
            <FilmRollFrame className="film-roll-overlay" />
          </button>
        ))}
        <FilmRollEnd className="film-roll-end" />
      </div>
    </div>
  );
}
