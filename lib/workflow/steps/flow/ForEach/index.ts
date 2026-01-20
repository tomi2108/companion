import { ExecutionContext } from "@lib/ctx";
import { ProgressScope } from "@workflow/progress/types";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "../..";
import { ForEachOptions, ForEachWrites } from "./types";

type Options<Item, Reads, InnerReads, InnerWrites, InnerOptions> = {
  concurrency?: number | true;
  item: string;
  items: (state: Reads) => Item[];
  step:
    | WorkflowStep<InnerReads, InnerWrites, InnerOptions>
    | ((index: number) => WorkflowStep<InnerReads, InnerWrites, InnerOptions>);
  progress?: {
    prefix: string;
    suffix?: (i: Item) => string;
  };
};

export class ForEach<
  Reads,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions,
  Key extends string
> extends WorkflowStep<
  Reads & InnerReads,
    ForEachWrites<InnerWrites, Key>,
    ForEachOptions<Key, Options<Item, Reads, InnerReads, InnerWrites, InnerOptions>, InnerWrites>
  > {

  constructor(override options: WorkflowOptions<ForEachOptions<Key, Options<Item, Reads, InnerReads, InnerWrites, InnerOptions>, InnerWrites>, ForEachWrites<InnerWrites, Key>>) {
    super();
  }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads,
    runtime?: WorkflowRuntime
  ): Promise<ForEachWrites<InnerWrites, Key>> {
    const results: InnerWrites[] = [];
    const items = this.options.items(state);
    const concurrency = this.options.concurrency;

    const delta = (() => {
      if (concurrency === true) return items.length;
      if (!concurrency) return 1;
      return concurrency;
    })();

    let scope: ProgressScope | undefined;
    if (this.options.progress) scope = runtime?.progress?.child(this.options.progress?.prefix, items.length);

    for (let i = 0; i < items.length; i += delta) {
      const slice = items.slice(i, i + delta);
      await Promise.all(slice.map(async (item) => {
        const step = this.options.step;
        const run = typeof step === "function" ? step(i) : step;
        const output = await run.run(
          ctx,
          { ...state, [this.options.item]: item },
          runtime
        );
        scope?.increment(1, this.options.progress?.suffix?.(item));
        if ("collectAs" in this.options && output) results.push(output);
      }));
    }
    scope?.close();

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;
  }
}
