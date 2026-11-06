import { createLayerEffect } from '../../../../core/src/layer-effects';
import { createCaption } from '../../../../core/src/document';
import {
  addCaption,
  moveLayer,
  removeCaption,
} from '../../../../core/src/caption-layout';
import { describe, expect, it } from 'vitest';
import { EditHistorySession } from './edit-history';
import { removeSessionPhoto, type PhotoSessionState } from './session-state';
import { defaultSessionDocument } from './session-document';

function document(text = '') {
  const value = defaultSessionDocument();
  value.layout.containers[0]!.template = text;
  return value;
}

describe('session edit history', () => {
  it('keeps effect stacks detached across undo, redo and photo documents', () => {
    const history = new EditHistorySession();
    const before = document();
    history.reset('a', before);
    history.reset('b', before);
    const after = structuredClone(before);
    after.layout.containers[0]!.effects = [
      createLayerEffect('glow', createCaption(), { width: 1000, height: 600 }),
    ];
    history.record('a', after, 'Add effect');
    after.layout.containers[0]!.effects![0]!.enabled = false;
    expect(history.undo('a')).toEqual(before);
    const redone = history.redo('a');
    expect(redone.layout.containers[0]!.effects![0]!.enabled).toBe(true);
    expect(history.document('b')).toEqual(before);
    redone.layout.containers[0]!.effects![0]!.color = 'caption-black';
    expect(history.document('a').layout.containers[0]!.effects![0]!.color).toBe(
      'caption-muted-gold',
    );
  });

  it('groups live updates and undoes a pending edit as one step', () => {
    const history = new EditHistorySession();
    history.reset('a', document());
    history.begin('a', 'Typing');
    history.update('a', document('a'));
    history.update('a', document('abc'));
    expect(history.status('a')).toMatchObject({
      canUndo: true,
      undoLabel: 'Typing',
    });
    expect(history.undo('a')).toEqual(document());
    expect(history.status('a').canUndo).toBe(false);
    expect(history.redo('a')).toEqual(document('abc'));
  });

  it('does not erase redo for selection changes, no-ops or cancelled edits', () => {
    const history = new EditHistorySession();
    history.reset('a', document());
    history.record('a', document('one'), 'Typing');
    history.undo('a');
    const selected = document();
    selected.layout.activeId = null;
    history.record('a', selected, 'Selection');
    history.begin('a', 'Cancelled');
    history.update('a', document('cancel'));
    history.cancel('a');
    expect(history.status('a')).toMatchObject({
      canUndo: false,
      canRedo: true,
    });
    expect(history.redo('a')).toEqual(document('one'));
    history.undo('a');
    history.record('a', document('new branch'), 'Typing');
    expect(history.status('a').canRedo).toBe(false);
  });

  it('isolates target documents including an empty workspace and resets reused IDs', () => {
    const history = new EditHistorySession();
    for (const id of ['a', 'b', 'empty']) history.reset(id, document());
    history.record('b', document('pasted'), 'Paste settings');
    expect(history.status('a').canUndo).toBe(false);
    expect(history.undo('b')).toEqual(document());
    expect(history.redo('b')).toEqual(document('pasted'));
    history.record('empty', document('draft'), 'Typing');
    history.reset('empty', document('draft'));
    expect(history.status('empty').canUndo).toBe(false);
    history.remove('b');
    expect(() => history.document('b')).toThrow('Unknown history');
  });

  it('detaches snapshots from input and output mutations', () => {
    const history = new EditHistorySession();
    const input = document();
    history.reset('a', input);
    input.layout.containers.length = 0;
    const output = history.document('a');
    output.icons.length = 0;
    expect(history.document('a')).toEqual(document());
  });

  it('restores a removed layer with artwork and shares unique sources across photos', () => {
    const history = new EditHistorySession();
    const withArt = document();
    const asset = { name: 'test', svg: '<svg>unique artwork</svg>', aspect: 1 };
    withArt.layout.containers[0]!.logo = {
      asset,
      width: 10,
      colorMode: 'original',
    };
    history.reset('a', withArt);
    history.reset('b', withArt);
    const before = history.memory().assets;
    const removed = document();
    removed.layout.containers = [];
    history.record('a', removed, 'Delete layer');
    history.record('b', removed, 'Delete layer');
    expect(history.memory().assets).toBe(before);
    expect(history.undo('a')).toEqual(withArt);
    history.retain([withArt]);
    history.remove('a');
    history.remove('b');
    expect(history.memory().assets).toBe(before);
    history.retain([]);
    expect(history.memory().assets).toBe(0);
  });

  it('limits total steps and preserves a contiguous undo/redo path', () => {
    const history = new EditHistorySession({ limit: 2 });
    history.reset('a', document('0'));
    for (const n of [1, 2, 3])
      history.record('a', document(String(n)), 'Typing');
    expect(history.undo('a')).toEqual(document('2'));
    expect(history.undo('a')).toEqual(document('1'));
    expect(history.status('a')).toMatchObject({
      canUndo: false,
      truncated: true,
    });
    expect(history.redo('a')).toEqual(document('2'));
    expect(history.redo('a')).toEqual(document('3'));
  });

  it('applies a session-wide budget without rejecting an oversized current edit', () => {
    const history = new EditHistorySession({ budget: 1 });
    history.reset('a', document());
    history.reset('b', document());
    history.record('a', document('large edit'), 'Typing');
    history.record('b', document('another edit'), 'Typing');
    expect(history.document('a')).toEqual(document('large edit'));
    expect(history.memory().bytes).toBe(0);
    expect(history.status('a')).toMatchObject({
      canUndo: false,
      truncated: true,
    });
    history.clear();
    expect(history.memory()).toEqual({ bytes: 0, assets: 0 });
  });

  it('commits operation boundaries and keeps a pending no-op transparent to redo', () => {
    const history = new EditHistorySession();
    history.reset('a', document());
    history.begin('a', 'Typing');
    history.update('a', document('text'));
    history.record('a', document('text {tag}'), 'Add tag');
    expect(history.undo('a')).toEqual(document('text'));
    expect(history.undo('a')).toEqual(document());
    history.begin('a', 'No-op');
    expect(history.status('a').canRedo).toBe(true);
    expect(history.redo('a')).toEqual(document('text'));
  });
});

describe('history lifecycle', () => {
  it('resets empty/imported documents and keeps surviving photo histories on close', () => {
    const history = new EditHistorySession();
    const empty = { id: 'a', editor: document() };
    const state: PhotoSessionState = { items: [], activeId: null, empty };
    history.reset('a', empty.editor);
    history.record('a', document('before import'), 'Typing');
    const photo = (id: string) => ({
      id,
      editor: document('imported'),
      file: {} as File,
      thumbnailUrl: '',
      photo: {
        name: '',
        mimeType: 'image/jpeg' as const,
        byteLength: 0,
        dimensions: { width: 1, height: 1 },
        metadata: [],
      },
    });
    const imported: PhotoSessionState = {
      ...state,
      activeId: 'a',
      items: [photo('a'), photo('b')],
    };
    history.synchronize(state, imported);
    expect(history.status('a').canUndo).toBe(false);
    history.record('b', document('changed'), 'Paste');
    const closed = removeSessionPhoto(imported, 'a');
    history.synchronize(imported, closed);
    expect(history.undo('b')).toEqual(document('imported'));
    const lastClosed = removeSessionPhoto(closed, 'b');
    history.synchronize(closed, lastClosed);
    expect(history.status('b').canUndo).toBe(false);
    expect(history.status('b').canRedo).toBe(false);
  });
});

describe('mixed layout operations', () => {
  it('undoes and redoes text, tag, position, color, order and deletion in one path', () => {
    const history = new EditHistorySession();
    let value = document();
    value.layout = addCaption(value.layout, 'second', true);
    const states = [structuredClone(value)];
    history.reset('a', value);
    const edit = (label: string, update: () => void) => {
      update();
      history.record('a', value, label);
      states.push(structuredClone(value));
      value = structuredClone(value);
    };
    edit('Typing', () => {
      value.layout.containers[0]!.template = 'Text';
    });
    edit('Add tag', () => {
      value.layout.containers[0]!.template += '{author}';
    });
    edit('Move layer', () => {
      value.layout.containers[0]!.position.custom = { x: 20, y: 30 };
    });
    edit('Change color', () => {
      value.layout.containers[0]!.style.color = '#123456';
    });
    edit('Reorder', () => {
      value.layout = moveLayer(value.layout, 'second', 1);
    });
    edit('Delete layer', () => {
      value.layout = removeCaption(value.layout, 'second');
    });
    for (const expected of states.slice(0, -1).reverse())
      expect(history.undo('a')).toEqual(expected);
    expect(history.status('a').canUndo).toBe(false);
    for (const expected of states.slice(1))
      expect(history.redo('a')).toEqual(expected);
    expect(history.status('a').canRedo).toBe(false);
  });
});

it('applies a lower limit immediately to past and future without restoring pruned steps', () => {
  const history = new EditHistorySession();
  for (const id of ['a', 'b']) {
    history.reset(id, document());
    for (let n = 1; n <= 5; n++)
      history.record(id, document(String(n)), 'Edit');
  }
  history.undo('a');
  history.undo('a');
  history.setLimit(2);
  expect(history.status('a')).toMatchObject({
    canUndo: false,
    canRedo: true,
    truncated: true,
  });
  history.redo('a');
  history.redo('a');
  expect(history.document('a')).toEqual(document('5'));
  history.undo('b');
  history.undo('b');
  expect(history.status('b').canUndo).toBe(false);
  history.setLimit(100);
  expect(history.status('b').canUndo).toBe(false);
  expect(() => history.setLimit(0)).toThrow();
});

it('keeps a tiled drag in one undo step and restores the original single-mark position', () => {
  const history = new EditHistorySession();
  const initial = document('Proof');
  initial.layout.containers[0]!.position.custom = { x: 25, y: 75 };
  initial.layout.containers[0]!.position.tiled = {
    enabled: true,
    pattern: 'grid',
    angle: 45,
    spacing: 12,
    offset: { x: 0, y: 0 },
  };
  history.reset('tiled', initial);
  history.begin('tiled', 'Move pattern');
  for (const x of [1, 2, 10]) {
    const next = structuredClone(initial);
    next.layout.containers[0]!.position.tiled!.offset = { x, y: -x };
    history.update('tiled', next);
  }
  history.commit('tiled');
  expect(history.undo('tiled')).toEqual(initial);
  expect(history.status('tiled').canUndo).toBe(false);
  expect(history.redo('tiled')!.layout.containers[0]!.position).toMatchObject({
    custom: { x: 25, y: 75 },
    tiled: { angle: 45, spacing: 12, offset: { x: 10, y: -10 } },
  });
});
