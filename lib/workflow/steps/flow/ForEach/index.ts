import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "../..";
import { ForEachOptions, ForEachWrites } from "./types";

type Options<Item> = {
  concurrency?: number | true;
  item: string;
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
    ForEachOptions<Reads, Options<Item>, Item, InnerReads, InnerWrites, InnerOptions>
  > {

  constructor(override options: WorkflowOptions<ForEachOptions<Reads, Options<Item>, Item, InnerReads, InnerWrites, InnerOptions>, ForEachWrites<InnerWrites, Key>>) {
    super();
  }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads,
    // TODO: Use this to implement progress bars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _runtime?: WorkflowRuntime
  ): Promise<ForEachWrites<InnerWrites, Key>> {
    const results: InnerWrites[] = [];
    const items = this.options.items(state);
    const concurrency = this.options.concurrency;

    const delta = (() => {
      if (concurrency === true) return items.length;
      if (!concurrency) return 1;
      return concurrency;
    })();

    for (let i = 0; i < items.length; i += delta) {
      const slice = items.slice(i, i + delta);
      await Promise.all(slice.map(async (item) => {
        const output = await this.options.step.run(
          ctx,
          { ...state, [this.options.item]: item }
        );
        if ("collectAs" in this.options && output) results.push(output);
      }));
    }

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;
  }
}
