/** One render in flight, one latest pending request. Superseded callers settle. */
export class LatestPreview<T, R> {
  private pending?: {
    input: T;
    resolve: (result: R | undefined) => void;
    reject: (error: unknown) => void;
  };
  private running = false;
  private disposed = false;
  private render: (input: T) => Promise<R>;
  private release: (result: R) => void;
  constructor(render: (input: T) => Promise<R>, release: (result: R) => void) {
    this.render = render;
    this.release = release;
  }
  request(input: T): Promise<R | undefined> {
    if (this.disposed) return Promise.resolve(undefined);
    this.pending?.resolve(undefined);
    const promise = new Promise<R | undefined>((resolve, reject) => {
      this.pending = { input, resolve, reject };
    });
    void this.drain();
    return promise;
  }
  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.pending && !this.disposed) {
        const task = this.pending;
        this.pending = undefined;
        try {
          const result = await this.render(task.input);
          if (this.disposed) {
            this.release(result);
            task.resolve(undefined);
          } else task.resolve(result);
        } catch (error) {
          task.reject(error);
        }
      }
    } finally {
      this.running = false;
    }
  }
  dispose() {
    this.disposed = true;
    this.pending?.resolve(undefined);
    this.pending = undefined;
  }
}
