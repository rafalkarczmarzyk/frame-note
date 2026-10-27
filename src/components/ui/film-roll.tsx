import {
  useEffect,
  useRef,
  type PointerEvent,
  type CSSProperties,
} from 'react';
import {
  FilmRollStart,
  type FilmRollVariant,
} from '@/components/brand/film-roll-start';
import { FilmRollFrame } from '@/components/brand/film-roll-frame';
import { FilmRollLeader } from '@/components/brand/film-roll-leader';
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
  /** Reference height for film artwork; cassetteScale adjusts the shell independently. */
  height?: number;
  /** Scale the cassette independently while preserving film frame size. */
  cassetteScale?: number;
  className?: string;
  disabled?: boolean;
  variant?: FilmRollVariant;
}

export function FilmRoll({
  photos,
  activePhotoId,
  onSelectPhoto,
  height = 180,
  cassetteScale = 0.9,
  className,
  disabled = false,
  variant = 'emerald',
}: FilmRollProps) {
  const rollRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: number;
    x: number;
    scroll: number;
    max: number;
    moved: boolean;
  } | null>(null);

  const suppressClickRef = useRef(false);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const roll = rollRef.current;
    const strip = stripRef.current;
    if (disabled || !event.isPrimary || event.button !== 0 || !roll || !strip)
      return;
    event.preventDefault();
    strip.setAttribute('data-pointer-input', 'true');
    suppressClickRef.current = false;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      scroll: roll.scrollLeft,
      max: Math.max(0, strip.offsetWidth - roll.clientWidth),
      moved: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const roll = rollRef.current;
    const strip = stripRef.current;
    if (!drag || !roll || !strip || drag.id !== event.pointerId) return;
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      strip.setAttribute('data-dragging', 'true');
    }
    const desired = drag.scroll - distance;
    const clamped = Math.max(0, Math.min(drag.max, desired));
    // The leader repeats at a fixed pitch, so pulling never stretches the holes.
    const pull = clamped - desired;
    strip.style.setProperty(
      '--film-leader-width',
      `${Math.max(0, pull) + 1}px`,
    );
    strip.style.setProperty('--film-pull', `${pull}px`);
    roll.scrollLeft = clamped;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    // Touch starts with implicit capture on the pressed button. Transferring
    // capture to the strip must not cancel the drag when that button loses it.
    if (
      event.type === 'lostpointercapture' &&
      event.target !== event.currentTarget
    )
      return;
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    stripRef.current?.removeAttribute('data-dragging');
    stripRef.current?.style.setProperty('--film-pull', '0px');
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  useEffect(() => {
    function showKeyboardFocus() {
      stripRef.current?.removeAttribute('data-pointer-input');
    }
    document.addEventListener('keydown', showKeyboardFocus, true);
    return () =>
      document.removeEventListener('keydown', showKeyboardFocus, true);
  }, []);

  useEffect(() => {
    dragRef.current = null;
    stripRef.current?.removeAttribute('data-dragging');
    stripRef.current?.style.setProperty('--film-pull', '0px');
  }, [disabled, photos.length]);

  useEffect(() => {
    const roll = rollRef.current;
    const strip = stripRef.current;
    if (!roll || !strip) return;
    function updateOverflow() {
      if (!roll || !strip) return;
      roll.dataset.morePhotos = String(
        strip.offsetWidth - roll.clientWidth - roll.scrollLeft > 1,
      );
      roll.parentElement?.setAttribute(
        'data-more-photos',
        roll.dataset.morePhotos,
      );
    }
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(roll);
    observer.observe(strip);
    roll.addEventListener('scroll', updateOverflow, { passive: true });
    return () => {
      observer.disconnect();
      roll.removeEventListener('scroll', updateOverflow);
    };
  }, []);

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

      const maxScroll = (stripRef.current?.offsetWidth ?? 0) - roll.clientWidth;
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
      className={cn('film-roll', className)}
      style={
        {
          '--film-roll-height': `${height}px`,
          '--film-cassette-height': `${height * Math.max(0.8, Math.min(1, cassetteScale))}px`,
        } as CSSProperties
      }
    >
      <FilmRollStart
        className="film-roll-start"
        variant={variant}
        exposures={photos.length}
      />
      <div
        ref={rollRef}
        className="film-roll-viewport"
        role="region"
        aria-label="Photo film roll"
        tabIndex={-1}
      >
        <span className="sr-only" aria-live="polite">
          {photos.length} photos in roll
        </span>
        <div
          ref={stripRef}
          className="film-roll-strip"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onLostPointerCapture={finishDrag}
          onClickCapture={(event) => {
            if (suppressClickRef.current && event.detail !== 0) {
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
            }
          }}
        >
          <FilmRollLeader scale={height / 78} className="film-roll-leader" />
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
                <img
                  src={photo.src}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
              </span>
              <FilmRollFrame className="film-roll-overlay" />
            </button>
          ))}
          <button
            type="button"
            className="film-roll-handle"
            disabled={disabled}
            aria-label="Drag film to browse photos"
            title="Drag anywhere on the film · Arrow keys to browse"
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
                return;
              event.preventDefault();
              rollRef.current?.scrollBy({
                left:
                  event.key === 'ArrowRight'
                    ? (height * 64) / 78
                    : (-height * 64) / 78,
              });
            }}
          >
            <FilmRollEnd className="film-roll-end" />
          </button>
        </div>
      </div>
    </div>
  );
}
