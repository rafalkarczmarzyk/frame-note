import type { Photo } from '@/domain/document';
import type { SessionDocument } from './session-document';

export interface SessionPhoto {
  id: string;
  file: File;
  photo: Photo;
  thumbnailUrl: string;
  editor: SessionDocument;
}
export interface PhotoSessionState {
  items: SessionPhoto[];
  activeId: string | null;
  empty: { id: string; editor: SessionDocument };
}

export function activeDocument(state: PhotoSessionState) {
  return (
    state.items.find((item) => item.id === state.activeId)?.editor ??
    state.empty.editor
  );
}

export function updateSessionDocument(
  state: PhotoSessionState,
  update: (document: SessionDocument) => SessionDocument,
): PhotoSessionState {
  if (!state.activeId)
    return {
      ...state,
      empty: { ...state.empty, editor: update(state.empty.editor) },
    };
  return {
    ...state,
    items: state.items.map((item) =>
      item.id === state.activeId
        ? { ...item, editor: update(item.editor) }
        : item,
    ),
  };
}

export function removeSessionPhoto(
  state: PhotoSessionState,
  id: string,
): PhotoSessionState {
  const index = state.items.findIndex((item) => item.id === id);
  const removed = state.items[index];
  if (!removed) return state;
  const items = state.items.filter((item) => item.id !== id);
  return {
    ...state,
    items,
    activeId:
      state.activeId === id
        ? (items[Math.min(index, items.length - 1)]?.id ?? null)
        : state.activeId,
    empty: items.length
      ? state.empty
      : { id: removed.id, editor: removed.editor },
  };
}
