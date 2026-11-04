import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import { usePlatform } from '@/hooks/use-platform';
import { platformOS, wheelIntent } from '@/lib/platform-os';
import { NavigatorSession, initialNavigatorState } from './navigator-state';
import { minimumScale, type Size, type View } from './navigator-geometry';

function blockedTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest(
      'input, textarea, select, [contenteditable="true"], [role="textbox"], [role="menu"], [role="dialog"], [role="spinbutton"]',
    )
  );
}
export function usePhotoView({
  host,
  photo,
  viewport,
  documentKey,
  disabled,
  liveKeys,
}: {
  host: RefObject<HTMLDivElement | null>;
  photo: Size;
  viewport: Size;
  documentKey: string;
  disabled: boolean;
  liveKeys?: readonly string[];
}) {
  const [session] = useState(() => new NavigatorSession());
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const { platform } = usePlatform();
  const [pixelRatio, setPixelRatio] = useState(() => devicePixelRatio);
  const [space, setSpace] = useState(false);
  const [panning, setPanning] = useState(false);
  const spaceRef = useRef(false);
  const editingDrag = useRef(false);
  const suppressClick = useRef(false);
  const wheelZoom = useRef<{
    raw: number;
    snapshot: ReturnType<NavigatorSession['getSnapshot']>;
  } | null>(null);
  const pan = useRef<{
    x: number;
    y: number;
    view: View;
    pointer: number;
    element: HTMLElement;
  } | null>(null);
  const current = useRef({ disabled, viewport, os: platformOS(platform) });
  useLayoutEffect(() => {
    current.current = { disabled, viewport, os: platformOS(platform) };
  });
  const finishPan = (cancel = false) => {
    const drag = pan.current;
    pan.current = null;
    if (drag && cancel) session.pan(drag.view.x, drag.view.y);
    if (drag?.element.hasPointerCapture(drag.pointer))
      drag.element.releasePointerCapture(drag.pointer);
    setPanning(false);
  };
  const finishPanRef = useRef(finishPan);
  useLayoutEffect(() => {
    finishPanRef.current = finishPan;
  });
  useLayoutEffect(() => {
    finishPanRef.current();
    editingDrag.current = false;
    session.configure(documentKey, photo, viewport);
  }, [session, documentKey, photo, viewport]);
  useEffect(() => {
    session.retain(liveKeys);
  }, [session, liveKeys]);
  useEffect(() => {
    if (disabled) {
      session.finish();
      finishPanRef.current();
      spaceRef.current = false;
      // Blocking application transitions must release the external keyboard gesture.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpace(false);
    }
  }, [disabled, session]);
  useEffect(() => {
    const dialogOpen = () =>
      [
        ...document.querySelectorAll(
          'dialog[open], [role="dialog"], [role="menu"]',
        ),
      ].some(
        (element) =>
          element.getClientRects().length > 0 &&
          getComputedStyle(element).visibility !== 'hidden',
      );
    const down = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        current.current.disabled ||
        blockedTarget(event.target) ||
        dialogOpen()
      )
        return;
      if (
        event.code === 'Space' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        if (editingDrag.current) {
          event.preventDefault();
          return;
        }
        // A focused button keeps its native Space activation.
        if (
          event.target instanceof Element &&
          event.target.closest('button, summary, a')
        )
          return;
        event.preventDefault();
        spaceRef.current = true;
        setSpace(true);
      }
      if (
        event.key.toLowerCase() === 'z' &&
        !event.repeat &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !editingDrag.current &&
        !pan.current
      ) {
        event.preventDefault();
        session.toggle();
      }
      if (event.key === 'Escape' && pan.current) {
        event.preventDefault();
        finishPanRef.current(true);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        spaceRef.current = false;
        setSpace(false);
      }
    };
    const blur = () => {
      session.finish();
      finishPanRef.current();
      editingDrag.current = false;
      spaceRef.current = false;
      setSpace(false);
    };
    const pointerUp = () => {
      editingDrag.current = false;
    };
    const otherTool = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest('[data-photo-view-controls], [data-photo-canvas]')
      )
        return;
      session.finish();
    };
    const focus = (event: FocusEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest('[data-photo-view-controls], [data-photo-canvas]')
      )
        session.finish();
    };
    window.addEventListener('focusin', focus);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', pointerUp);
    window.addEventListener('pointerdown', otherTool, true);
    return () => {
      window.removeEventListener('focusin', focus);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      window.removeEventListener('pointerup', pointerUp);
      window.removeEventListener('pointercancel', pointerUp);
      window.removeEventListener('pointerdown', otherTool, true);
    };
  }, [session]);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (current.current.disabled || editingDrag.current || pan.current)
        return;
      event.preventDefault();
      const intent = wheelIntent(
        event,
        current.current.os,
        current.current.viewport.height,
      );
      const state = session.getSnapshot();
      if (!state) return;
      if (intent.zoom) {
        const rect = node.getBoundingClientRect();
        const prior = wheelZoom.current;
        const raw = Math.max(
          minimumScale(state.photo, state.viewport),
          Math.min(
            8,
            (prior?.snapshot === state ? prior.raw : state.view.scale) *
              Math.exp(-intent.y * 0.002),
          ),
        );
        session.zoom(raw, true, {
          x: event.clientX - rect.left - 28,
          y: event.clientY - rect.top - 28,
        });
        wheelZoom.current = { raw, snapshot: session.getSnapshot() };
      } else {
        wheelZoom.current = null;
        session.pan(state.view.x - intent.x, state.view.y - intent.y);
      }
    };
    const pointerDown = (event: PointerEvent) => {
      if (current.current.disabled || editingDrag.current) return;
      if (event.button === 1 || (event.button === 0 && spaceRef.current)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick.current = true;
        const state = session.getSnapshot();
        if (!state) return;
        session.finish();
        node.focus({ preventScroll: true });
        pan.current = {
          x: event.clientX,
          y: event.clientY,
          view: state.view,
          pointer: event.pointerId,
          element: node,
        };
        node.setPointerCapture(event.pointerId);
        setPanning(true);
      } else if (event.button === 0) {
        suppressClick.current = false;
        session.finish();
        editingDrag.current = true;
        if (!blockedTarget(event.target)) node.focus({ preventScroll: true });
      }
    };
    const mouseDown = (event: MouseEvent) => {
      if (pan.current || event.button === 1) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const move = (event: PointerEvent) => {
      const drag = pan.current;
      if (drag && drag.pointer === event.pointerId) {
        event.preventDefault();
        event.stopImmediatePropagation();
        session.pan(
          drag.view.x + event.clientX - drag.x,
          drag.view.y + event.clientY - drag.y,
        );
      }
    };
    const up = (event: PointerEvent) => {
      if (pan.current) {
        event.stopImmediatePropagation();
        finishPanRef.current();
      }
      editingDrag.current = false;
    };
    const cancel = () => {
      finishPanRef.current(true);
      editingDrag.current = false;
    };
    const click = (event: MouseEvent) => {
      if (suppressClick.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick.current = false;
      }
    };
    node.addEventListener('click', click, true);
    node.addEventListener('auxclick', click, true);
    node.addEventListener('wheel', wheel, { passive: false });
    node.addEventListener('pointerdown', pointerDown, true);
    node.addEventListener('mousedown', mouseDown, true);
    node.addEventListener('pointermove', move, true);
    node.addEventListener('pointerup', up, true);
    node.addEventListener('pointercancel', cancel, true);
    return () => {
      node.removeEventListener('click', click, true);
      node.removeEventListener('auxclick', click, true);
      node.removeEventListener('wheel', wheel);
      node.removeEventListener('pointerdown', pointerDown, true);
      node.removeEventListener('mousedown', mouseDown, true);
      node.removeEventListener('pointermove', move, true);
      node.removeEventListener('pointerup', up, true);
      node.removeEventListener('pointercancel', cancel, true);
    };
  }, [host, session]);
  useEffect(() => {
    let query: MediaQueryList;
    const onDPR = () => {
      finishPanRef.current();
      session.finish();
      editingDrag.current = false;
      setPixelRatio(devicePixelRatio);
      query?.removeEventListener('change', onDPR);
      query = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      query.addEventListener('change', onDPR);
    };
    query = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    query.addEventListener('change', onDPR);
    return () => query.removeEventListener('change', onDPR);
  }, [session]);
  return {
    state: state ?? initialNavigatorState(photo, viewport),
    session,
    pixelRatio,
    cursor: panning ? 'grabbing' : space ? 'grab' : undefined,
    finishPan: finishPanRef,
    editingDrag,
    zoom: (
      setting: Parameters<NavigatorSession['zoom']>[0],
      manual?: boolean,
    ) => {
      wheelZoom.current = null;
      session.zoom(setting, manual);
    },
    beginOverviewPan: () => {
      session.finish();
      editingDrag.current = true;
    },
  };
}
