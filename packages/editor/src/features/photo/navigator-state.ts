import {
  constrainView,
  roundManualScale,
  fitScale,
  zoomView,
  type Size,
  type View,
} from './navigator-geometry';
export type ZoomSetting = 'fit' | number;
export interface NavigatorState {
  setting: ZoomSetting;
  previous: ZoomSetting;
  manualStart: { setting: ZoomSetting; scale: number } | null;
  view: View;
  photo: Size;
  viewport: Size;
}
const sameScale = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-9 * Math.max(1, a, b);
const resolve = (setting: ZoomSetting, state: NavigatorState) =>
  setting === 'fit' ? fitScale(state.photo, state.viewport) : setting;
export function initialNavigatorState(
  photo: Size,
  viewport: Size,
): NavigatorState {
  return {
    setting: 'fit',
    previous: 1,
    manualStart: null,
    photo,
    viewport,
    view: constrainView(
      { scale: fitScale(photo, viewport), x: 0, y: 0 },
      photo,
      viewport,
    ),
  };
}
export function finishZoom(state: NavigatorState): NavigatorState {
  if (!state.manualStart) return state;
  const unchanged = sameScale(state.view.scale, state.manualStart.scale);
  return {
    ...state,
    manualStart: null,
    setting: unchanged ? state.manualStart.setting : state.view.scale,
    previous: unchanged ? state.previous : state.manualStart.setting,
  };
}
export function changeZoom(
  state: NavigatorState,
  setting: ZoomSetting,
  manual = false,
  anchor?: { x: number; y: number },
): NavigatorState {
  if (!manual) state = finishZoom(state);
  const requested = resolve(setting, state);
  if (
    manual &&
    state.setting === 'fit' &&
    requested <= state.view.scale &&
    state.view.scale <
      roundManualScale(state.view.scale, state.photo, state.viewport)
  )
    return state;
  const view = zoomView(
    state.view,
    manual
      ? roundManualScale(requested, state.photo, state.viewport)
      : requested,
    state.photo,
    state.viewport,
    anchor,
  );
  if (manual) {
    if (sameScale(view.scale, state.view.scale)) return state;
    return {
      ...state,
      view,
      setting: view.scale,
      manualStart: state.manualStart ?? {
        setting: state.setting,
        scale: state.view.scale,
      },
    };
  }
  const next = setting === 'fit' ? 'fit' : view.scale;
  if (state.setting === next) return state;
  return { ...state, setting: next, previous: state.setting, view };
}
export function toggleZoom(state: NavigatorState): NavigatorState {
  state = finishZoom(state);
  const view = zoomView(
    state.view,
    state.previous === 'fit'
      ? resolve(state.previous, state)
      : roundManualScale(state.previous, state.photo, state.viewport),
    state.photo,
    state.viewport,
  );
  return {
    ...state,
    setting: state.previous === 'fit' ? 'fit' : view.scale,
    previous: state.setting,
    view,
  };
}
export function panView(
  state: NavigatorState,
  x: number,
  y: number,
): NavigatorState {
  state = finishZoom(state);
  return {
    ...state,
    view: constrainView({ ...state.view, x, y }, state.photo, state.viewport),
  };
}
export function resizeNavigator(
  state: NavigatorState,
  photo: Size,
  viewport: Size,
): NavigatorState {
  state = finishZoom(state);
  const center = {
    x: (state.viewport.width / 2 - state.view.x) / state.view.scale,
    y: (state.viewport.height / 2 - state.view.y) / state.view.scale,
  };
  const next = { ...state, photo, viewport };
  const view = zoomView(
    state.view,
    next.setting === 'fit'
      ? resolve(next.setting, next)
      : roundManualScale(next.setting, photo, viewport),
    photo,
    viewport,
  );
  const positioned = constrainView(
    {
      ...view,
      x: viewport.width / 2 - center.x * view.scale,
      y: viewport.height / 2 - center.y * view.scale,
    },
    photo,
    viewport,
  );
  return {
    ...next,
    setting: next.setting === 'fit' ? 'fit' : view.scale,
    view:
      next.setting === 'fit'
        ? constrainView({ ...view, x: 0, y: 0 }, photo, viewport)
        : positioned,
  };
}

/** Session-only view state. Never passed to the document, presets or edit history. */
export class NavigatorSession {
  private entries = new Map<string, NavigatorState>();
  private key = '';
  private snapshot: NavigatorState | null = null;
  private listeners = new Set<() => void>();
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.snapshot;
  configure(
    key: string,
    photo: Size,
    viewport: Size,
    liveKeys?: readonly string[],
  ) {
    if (
      key === this.key &&
      this.snapshot &&
      this.snapshot.photo.width === photo.width &&
      this.snapshot.photo.height === photo.height &&
      this.snapshot.viewport.width === viewport.width &&
      this.snapshot.viewport.height === viewport.height
    ) {
      this.prune(liveKeys);
      return;
    }
    this.finish();
    this.key = key;
    const prior = this.entries.get(key);
    this.publish(
      prior
        ? resizeNavigator(prior, photo, viewport)
        : initialNavigatorState(photo, viewport),
    );
    this.prune(liveKeys);
  }
  retain = (keys?: readonly string[]) => this.prune(keys);
  private prune(keys?: readonly string[]) {
    if (keys)
      for (const key of this.entries.keys())
        if (key !== this.key && !keys.includes(key)) this.entries.delete(key);
  }
  private publish(state: NavigatorState) {
    this.entries.set(this.key, state);
    this.snapshot = state;
    this.listeners.forEach((listener) => listener());
  }
  finish = () => {
    if (this.snapshot?.manualStart) this.publish(finishZoom(this.snapshot));
  };
  zoom = (
    setting: ZoomSetting,
    manual = false,
    anchor?: { x: number; y: number },
  ) => {
    if (this.snapshot)
      this.publish(changeZoom(this.snapshot, setting, manual, anchor));
  };
  toggle = () => {
    if (this.snapshot) this.publish(toggleZoom(this.snapshot));
  };
  pan = (x: number, y: number) => {
    if (this.snapshot) this.publish(panView(this.snapshot, x, y));
  };
}
