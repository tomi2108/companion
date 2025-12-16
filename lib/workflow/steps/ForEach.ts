import { ExecutionContext } from "@lib/ctx";
import { progressBar } from "@lib/ui";

import { WorkflowOptions, WorkflowStep } from ".";

type ForEachWrites<
  InnerWrites,
  Key extends string | undefined
> = Key extends string ? InnerWrites extends void ? never : { [K in Key]: InnerWrites[] } : {};

type CommonOptions<Item> = {
  item: string;
  progressBar?: {
    type: "single";
    prefix: string;
    sufix?: (item: Item) => string;
  };
};
type ForEachOptions<
  Reads,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions
> =
  | CommonOptions<Item> & {
    items: (state: Reads) => Item[];
    step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
    collectAs?: undefined;
  }
  | (InnerWrites extends void
    ? never
    : CommonOptions<Item> & {
      items: (state: Reads) => Item[];
      step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
      collectAs: string;
    });

export class ForEachStep<
  Reads,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions,
  Key extends string
> extends WorkflowStep<
  Reads & InnerReads,
    ForEachWrites<InnerWrites, Key>,
    ForEachOptions<Reads, Item, InnerReads, InnerWrites, InnerOptions>
  > {

  constructor(override options: WorkflowOptions<ForEachOptions<Reads, Item, InnerReads, InnerWrites, InnerOptions>, ForEachWrites<InnerWrites, Key>>) {
    super();
  }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads
  ): Promise<ForEachWrites<InnerWrites, Key>> {
    const results: InnerWrites[] = [];

    const items = this.options.items(state);

    let bar;
    if (this.options.progressBar) bar = progressBar(items.length, 0, this.options.progressBar.prefix);
    for (const item of items) {
      bar?.setSufix(this.options.progressBar?.sufix?.(item) ?? "");
      const output = await this.options.step.run(ctx, {
        ...state,
        [this.options.item]: item
      });
      if ("collectAs" in this.options && output) results.push(output);
      bar?.increment(1);
    }
    bar?.stop();

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;

  }
}
