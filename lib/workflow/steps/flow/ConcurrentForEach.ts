
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";
import { ForEachOptions, ForEachReads, ForEachWrites } from "./types";

type Options = {
  concurrency?: number;
};

export class ConcurrentForEach<
  Reads,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions,
  Key extends string
> extends WorkflowStep<
  Reads & InnerReads & ForEachReads,
    ForEachWrites<InnerWrites, Key>,
    ForEachOptions<Reads, Options, Item, InnerReads, InnerWrites, InnerOptions>
  > {

  constructor(override options: WorkflowOptions<ForEachOptions<Reads, Options, Item, InnerReads, InnerWrites, InnerOptions>, ForEachWrites<InnerWrites, Key>>) {
    super();
  }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads & ForEachReads
  ): Promise<ForEachWrites<InnerWrites, Key>> {
    const results: InnerWrites[] = [];
    const items = this.options.items(state);

    const concurrency = this.options.concurrency ?? items.length;
    for (let index = 0; index < items.length; index += concurrency) {
      const concurrent = items.slice(index, index + concurrency);
      await Promise.all(
        concurrent.map(async (item) => {
          const output = await this.options.step.run(ctx, { ...state, [this.options.item]: item });
          if ("collectAs" in this.options && output) results.push(output);
        })
      );
    }

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;

  }
}
