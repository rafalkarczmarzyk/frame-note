import { describe, expect, it } from 'vitest';
import { defaultSessionDocument } from './session-document';
import {
  activeDocument,
  removeSessionPhoto,
  updateSessionDocument,
  type PhotoSessionState,
} from './session-state';

function session(): PhotoSessionState {
  return {
    activeId: 'a',
    empty: { id: 'empty', editor: defaultSessionDocument() },
    items: ['a', 'b', 'c'].map((id) => ({
      id,
      editor: defaultSessionDocument(),
      file: {} as File,
      thumbnailUrl: `blob:${id}`,
      photo: {
        name: `${id}.jpg`,
        mimeType: 'image/jpeg',
        byteLength: 10,
        dimensions: { width: 600, height: 400 },
        metadata: [],
      },
    })),
  };
}

describe('photo session documents', () => {
  it('starts each photo with an independent default layout and updates only the active photo', () => {
    const state = session();
    const next = updateSessionDocument(state, (editor) => ({
      ...editor,
      presetId: 'custom',
      layout: { ...editor.layout, containers: [] },
    }));
    expect(activeDocument(next).layout.containers).toHaveLength(0);
    expect(next.items[1]!.editor.layout.containers.length).toBeGreaterThan(0);
    expect(state.items[0]!.editor.layout.containers.length).toBeGreaterThan(0);
    expect(next.items[0]!.editor.presetId).toBe('custom');
    expect(next.items[1]!.editor.presetId).toBe('builtin-default');
    expect(state.items[0]!.editor.layout).not.toBe(
      state.items[1]!.editor.layout,
    );
  });
  it('selects the neighbor on close, hides an empty roll and retains the last layout', () => {
    let state = { ...session(), activeId: 'b' as string | null };
    state = removeSessionPhoto(state, 'b');
    expect(state.activeId).toBe('c');
    state = removeSessionPhoto(state, 'c');
    expect(state.activeId).toBe('a');
    const lastEditor = activeDocument(state);
    state = removeSessionPhoto(state, 'a');
    expect(state.items).toHaveLength(0);
    expect(state.activeId).toBeNull();
    expect(state.empty.id).toBe('a');
    expect(activeDocument(state)).toBe(lastEditor);
  });
  it('retains active selection when another photo is removed and edits the empty document before import', () => {
    const state = session();
    expect(removeSessionPhoto(state, 'b').activeId).toBe('a');
    expect(removeSessionPhoto(state, 'missing')).toBe(state);
    const empty = { ...state, items: [], activeId: null };
    const next = updateSessionDocument(empty, (editor) => ({
      ...editor,
      presetId: 'before-import',
    }));
    expect(activeDocument(next).presetId).toBe('before-import');
  });
});
