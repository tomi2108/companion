import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from ".";

type ForEachWrites<
  InnerWrites,
  Key extends string | undefined
> = Key extends string ? InnerWrites extends void ? never : { [K in Key]: InnerWrites[] } : {};

type ForEachOptions<
  Reads,
  Item,
  InnerReads,
  InnerWrites
> =
  | {
    items: (state: Reads) => Item[];
    item: string;
    step: WorkflowStep<InnerReads, InnerWrites>;
    collectAs?: undefined;
  }
  | (InnerWrites extends void
    ? never
    : {
      items: (state: Reads) => Item[];
      item: string;
      step: WorkflowStep<InnerReads, InnerWrites>;
      collectAs: string;
    });

export class ForEachStep<
  Reads,
  Item,
  InnerReads,
  InnerWrites,
  Key extends string
> implements WorkflowStep<
  Reads & InnerReads,
  ForEachWrites<InnerWrites, Key>
> {

  constructor(
    private options: ForEachOptions<Reads, Item, InnerReads, InnerWrites>
  ) { }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads
  ): Promise<ForEachWrites<InnerWrites, Key>> {
    const results: InnerWrites[] = [];

    for (const item of this.options.items(state)) {
      const output = await this.options.step.run(ctx, {
        ...state,
        [this.options.item]: item
      });

      if ("collectAs" in this.options && output) {
        results.push(output);
      }
    }

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;

  }
}
