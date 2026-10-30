/** Debounce expensive jobs, serialize execution and discard obsolete results.
 * Running work cannot be interrupted, but never overlaps with another job. */
export class LatestJob<Input, Output> {
  private revision = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private chain: Promise<void> = Promise.resolve();

  private readonly run: (input: Input) => Promise<Output>;
  private readonly delay: number;
  constructor(run: (input: Input) => Promise<Output>, delay: number) {
    this.run = run;
    this.delay = delay;
  }

  schedule(
    input: Input,
    success: (output: Output) => void,
    failure: (error: unknown) => void,
  ) {
    this.cancel();
    const revision = this.revision;
    this.timer = setTimeout(() => {
      this.chain = this.chain.then(async () => {
        if (revision !== this.revision) return;
        try {
          const output = await this.run(input);
          if (revision === this.revision) success(output);
        } catch (error) {
          if (revision === this.revision) failure(error);
        }
      });
    }, this.delay);
  }

  cancel() {
    this.revision += 1;
    clearTimeout(this.timer);
  }
}
