import type { PhotoSessionState } from './session-state';
import type { SessionDocument } from './session-document';

export const DEFAULT_HISTORY_LIMIT = 100;
export const DEFAULT_HISTORY_BUDGET = 64 * 1024 * 1024;

type Snapshot = { json: string; assets: string[] };
type Step = { before: Snapshot; after: Snapshot; label: string; order: number };
type History = {
  current: Snapshot;
  past: Step[];
  future: Step[];
  pending?: { before: Snapshot; label: string };
  truncated: boolean;
};

/** Session-owned store. Artwork is interned once; snapshots contain references.
 * Returned documents are detached so React/editor callers may safely mutate them.
 * IDs belong to documents (including the empty workspace), never mounted layers.
 */
export class EditHistorySession {
  private histories = new Map<string, History>();
  private assets = new Map<string, string>();
  private assetIds = new Map<string, string>();
  private sequence = 0;
  private assetSequence = 0;
  private retained: Snapshot[] = [];
  limit: number;
  readonly budget: number;

  constructor(options: { limit?: number; budget?: number } = {}) {
    this.limit = options.limit ?? DEFAULT_HISTORY_LIMIT;
    this.budget = options.budget ?? DEFAULT_HISTORY_BUDGET;
    if (!Number.isSafeInteger(this.limit) || this.limit < 0)
      throw Error('History limit must be a non-negative integer.');
    if (!Number.isFinite(this.budget) || this.budget < 0)
      throw Error('History budget must be non-negative.');
  }

  setLimit(limit: number) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
      throw Error('History limit must be from 1 to 1000.');
    this.limit = limit;
    this.prune();
  }

  private snapshot(document: SessionDocument): Snapshot {
    const assets = new Set<string>();
    const json = JSON.stringify(document, (key, value) => {
      if ((key === 'source' || key === 'svg') && typeof value === 'string') {
        let id = this.assetIds.get(value);
        if (!id) {
          id = String(++this.assetSequence);
          this.assetIds.set(value, id);
          this.assets.set(id, value);
        }
        assets.add(id);
        return { historyAsset: id };
      }
      return value;
    });
    return { json, assets: [...assets] };
  }

  private restore(snapshot: Snapshot): SessionDocument {
    return JSON.parse(snapshot.json, (_key, value) =>
      value && typeof value === 'object' && 'historyAsset' in value
        ? this.assets.get(value.historyAsset)
        : value,
    );
  }

  private equal(a: Snapshot, b: Snapshot) {
    const content = (snapshot: Snapshot) => {
      const document = JSON.parse(snapshot.json);
      delete document.layout.activeId;
      delete document.selection;
      delete document.presetId;
      return JSON.stringify(document);
    };
    return content(a) === content(b);
  }

  private history(id: string) {
    const history = this.histories.get(id);
    if (!history) throw Error(`Unknown history document: ${id}`);
    return history;
  }

  /** Import/reset starts a fresh history even when an ID is reused. */
  reset(id: string, document: SessionDocument) {
    this.histories.set(id, {
      current: this.snapshot(document),
      past: [],
      future: [],
      truncated: false,
    });
    this.prune();
  }

  /** Reconcile import/close/reset while preserving histories of surviving photos. */
  synchronize(previous: PhotoSessionState, next: PhotoSessionState) {
    const before = previous.items.length ? previous.items : [previous.empty];
    const after = next.items.length ? next.items : [next.empty];
    const ids = new Set(after.map((item) => item.id));
    for (const item of before) if (!ids.has(item.id)) this.remove(item.id);
    for (const item of after) {
      if (
        !this.histories.has(item.id) ||
        !!previous.items.length !== !!next.items.length
      )
        this.reset(item.id, item.editor);
    }
  }

  remove(id: string) {
    this.histories.delete(id);
    this.prune();
  }

  /** Protect resources referenced by settings clipboard or external documents. */
  retain(documents: readonly SessionDocument[]) {
    this.retained = documents.map((document) => this.snapshot(document));
    this.prune();
  }

  clear() {
    this.histories.clear();
    this.retained = [];
    this.prune();
  }

  document(id: string) {
    return this.restore(this.history(id).current);
  }

  observe(id: string, document: SessionDocument) {
    const history = this.history(id);
    const next = this.snapshot(document);
    if (!this.equal(next, history.current))
      throw Error('View update changed document content.');
    history.current = next;
    this.prune();
  }

  begin(id: string, label: string) {
    this.commit(id);
    const history = this.history(id);
    history.pending = { before: history.current, label };
  }

  /** Live updates within a gesture/typing group do not consume steps. */
  update(id: string, document: SessionDocument) {
    const history = this.history(id);
    if (!history.pending) throw Error('Begin an edit before updating it.');
    history.current = this.snapshot(document);
    this.prune();
  }

  commit(id: string) {
    const history = this.history(id);
    const pending = history.pending;
    if (!pending) return;
    delete history.pending;
    if (!this.equal(pending.before, history.current)) {
      history.past.push({
        ...pending,
        after: history.current,
        order: ++this.sequence,
      });
      history.future = [];
    }
    this.prune();
  }

  cancel(id: string) {
    const history = this.history(id);
    if (!history.pending) return;
    history.current = history.pending.before;
    delete history.pending;
    this.prune();
  }

  record(id: string, document: SessionDocument, label: string) {
    this.begin(id, label);
    this.update(id, document);
    this.commit(id);
  }

  undo(id: string) {
    this.commit(id);
    const history = this.history(id);
    const step = history.past.pop();
    if (step) {
      history.future.unshift(step);
      history.current = step.before;
    }
    this.prune();
    return this.document(id);
  }

  redo(id: string) {
    this.commit(id);
    const history = this.history(id);
    const step = history.future.shift();
    if (step) {
      history.past.push(step);
      history.current = step.after;
    }
    this.prune();
    return this.document(id);
  }

  status(id: string) {
    const history = this.history(id);
    const changed =
      !!history.pending && !this.equal(history.pending.before, history.current);
    return {
      canUndo: changed || !!history.past.length,
      canRedo: !changed && !!history.future.length,
      undoLabel: changed ? history.pending!.label : history.past.at(-1)?.label,
      redoLabel: changed ? undefined : history.future[0]?.label,
      truncated: history.truncated,
    };
  }

  private snapshots() {
    return [...this.histories.values()]
      .flatMap((history) => [
        history.current,
        ...(history.pending ? [history.pending.before] : []),
        ...[...history.past, ...history.future].flatMap((step) => [
          step.before,
          step.after,
        ]),
      ])
      .concat(this.retained);
  }

  /** Estimated serialized bytes; current documents, clipboard and pending edits
   * are protected. Count unique history-only artwork once across the session.
   */
  memory() {
    const protectedSnapshots = [...this.histories.values()]
      .flatMap((history) => [
        history.current,
        ...(history.pending ? [history.pending.before] : []),
      ])
      .concat(this.retained);
    const protectedAssets = new Set(
      protectedSnapshots.flatMap((snapshot) => snapshot.assets),
    );
    const snapshots = new Set(
      [...this.histories.values()].flatMap((history) =>
        [...history.past, ...history.future].flatMap((step) => [
          step.before,
          step.after,
        ]),
      ),
    );
    const assets = new Set(
      [...snapshots].flatMap((snapshot) => snapshot.assets),
    );
    const bytes = (text: string) => new TextEncoder().encode(text).byteLength;
    return {
      bytes:
        [...snapshots].reduce(
          (sum, snapshot) => sum + bytes(snapshot.json),
          0,
        ) +
        [...assets].reduce(
          (sum, id) =>
            sum + (protectedAssets.has(id) ? 0 : bytes(this.assets.get(id)!)),
          0,
        ),
      assets: this.assets.size,
    };
  }

  private prune() {
    for (const history of this.histories.values()) {
      while (history.past.length + history.future.length > this.limit) {
        if (history.past.length) history.past.shift();
        else history.future.pop();
        history.truncated = true;
      }
    }
    while (this.memory().bytes > this.budget) {
      // Remove only outer edges, preserving a contiguous path from current.
      const candidates = [...this.histories.values()]
        .flatMap((history) => [
          ...(history.past.length
            ? [{ history, side: 'past' as const, step: history.past[0]! }]
            : []),
          ...(history.future.length
            ? [
                {
                  history,
                  side: 'future' as const,
                  step: history.future.at(-1)!,
                },
              ]
            : []),
        ])
        .sort((a, b) => a.step.order - b.step.order);
      const candidate = candidates[0];
      if (!candidate) break;
      if (candidate.side === 'past') candidate.history.past.shift();
      else candidate.history.future.pop();
      candidate.history.truncated = true;
    }
    const used = new Set(
      this.snapshots().flatMap((snapshot) => snapshot.assets),
    );
    for (const [id, source] of this.assets) {
      if (used.has(id)) continue;
      this.assets.delete(id);
      this.assetIds.delete(source);
    }
  }
}
