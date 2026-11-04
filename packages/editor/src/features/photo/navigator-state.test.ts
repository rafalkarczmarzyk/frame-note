import { describe, expect, it } from 'vitest';
import {
  changeZoom,
  finishZoom,
  initialNavigatorState,
  NavigatorSession,
  panView,
  resizeNavigator,
  toggleZoom,
} from './navigator-state';
const photo = { width: 2400, height: 1600 };
const viewport = { width: 600, height: 400 };
const initial = () => initialNavigatorState(photo, viewport);
const at100 = () => changeZoom(initial(), 1);
describe('Navigator zoom history', () => {
  it('keeps fractional Fit, rounds all manual zoom and restores exact Fit through Z', () => {
    const fractional = initialNavigatorState(photo, {
      width: 599,
      height: 399,
    });
    expect(fractional.view.scale * 100).not.toBe(
      Math.round(fractional.view.scale * 100),
    );
    expect(changeZoom(fractional, fractional.view.scale - 0.01, true)).toEqual(
      fractional,
    );
    const manual = changeZoom(fractional, 1.2576, true);
    expect(manual.view.scale).toBe(1.26);
    expect(toggleZoom(manual).view.scale).toBe(fractional.view.scale);
    expect(changeZoom(manual, 0.001, true).view.scale).toBe(0.25);
  });
  it('starts with Fit and 100%, including equal-scale modes', () => {
    expect(toggleZoom(initial()).setting).toBe(1);
    const small = initialNavigatorState({ width: 100, height: 80 }, viewport);
    const numeric = toggleZoom(small);
    expect(numeric.view).toEqual(small.view);
    expect(numeric.setting).toBe(1);
    expect(toggleZoom(numeric).setting).toBe('fit');
  });
  it('groups repeated manual zoom across pauses until a boundary', () => {
    let state = changeZoom(at100(), 1.5, true);
    state = changeZoom(state, 2, true);
    expect(toggleZoom(state).setting).toBe(1);
    expect(toggleZoom(toggleZoom(state)).setting).toBe(2);
  });
  it('pan closes one manual action before the next', () => {
    let state = changeZoom(at100(), 1.5, true);
    state = panView(state, -500, -300);
    state = changeZoom(state, 2, true);
    expect(toggleZoom(state).setting).toBe(1.5);
  });
  it('presets close the manual action and save their own setting', () => {
    let state = changeZoom(at100(), 1.5, true);
    state = changeZoom(state, 2);
    expect(toggleZoom(state).setting).toBe(1.5);
    expect(toggleZoom(changeZoom(at100(), 1.75, true)).setting).toBe(1);
  });
  it('manual return to the initial scale retains the previous pair and Fit mode', () => {
    const start = at100();
    const returned = finishZoom(
      changeZoom(changeZoom(start, 1.5, true), 1, true),
    );
    expect(returned.setting).toBe(start.setting);
    expect(returned.previous).toBe(start.previous);
    const fit = finishZoom(
      changeZoom(changeZoom(initial(), 0.5, true), 0.25, true),
    );
    expect(fit.setting).toBe('fit');
    expect(fit.previous).toBe(1);
  });
  it('does not overwrite history for an active preset or a clamped no-op', () => {
    expect(changeZoom(at100(), 1)).toEqual(at100());
    const max = changeZoom(at100(), 8);
    expect(finishZoom(changeZoom(max, 80, true)).previous).toBe(1);
  });
  it('resize updates Fit dynamically without adding history', () => {
    const state = resizeNavigator(initial(), photo, {
      width: 300,
      height: 200,
    });
    expect(state.view.scale).toBe(0.125);
    expect(state.previous).toBe(1);
    expect(toggleZoom(toggleZoom(state)).setting).toBe('fit');
  });
  it('resize preserves the numeric center then clamps pan', () => {
    const state = panView(at100(), -500, -300);
    const resized = resizeNavigator(state, photo, { width: 800, height: 600 });
    expect(resized.view).toEqual({ scale: 1, x: -400, y: -200 });
  });
  it('finishes an open action before resize and does not restore old pan through Z', () => {
    const state = resizeNavigator(
      changeZoom(at100(), 2, true),
      photo,
      viewport,
    );
    expect(state.manualStart).toBeNull();
    expect(state.previous).toBe(1);
    const panned = panView(state, -900, -700);
    expect(toggleZoom(toggleZoom(panned)).view).toEqual(panned.view);
  });
  it('keeps view and history per photo and closes actions on photo switch', () => {
    const session = new NavigatorSession();
    session.configure('a', photo, viewport);
    session.zoom(2, true);
    session.pan(-500, -600);
    session.configure('b', photo, viewport);
    session.zoom(1.5, true);
    session.configure('a', photo, viewport);
    expect(session.getSnapshot()?.view).toEqual({ scale: 2, x: -500, y: -600 });
    session.configure('b', photo, viewport);
    session.toggle();
    expect(session.getSnapshot()?.setting).toBe('fit');
  });
  it('prunes removed photos and treats a reopened key as a fresh view', () => {
    const session = new NavigatorSession();
    session.configure('a', photo, viewport);
    session.zoom(2);
    session.configure('b', photo, viewport, ['b']);
    session.configure('a', photo, viewport);
    expect(session.getSnapshot()?.setting).toBe('fit');
  });
});
