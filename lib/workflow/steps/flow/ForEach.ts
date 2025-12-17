import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";
import { ForEachOptions, ForEachReads, ForEachWrites } from "./types";

type Options = {};
export class ForEachStep<
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

    for (const item of items) {
      const output = await this.options.step.run(ctx, { ...state, [this.options.item]: item });
      if ("collectAs" in this.options && output) results.push(output);
    }

    if ("collectAs" in this.options && typeof this.options.collectAs === "string") return { [this.options.collectAs]: results } as ForEachWrites<InnerWrites, Key>;
    return {} as ForEachWrites<InnerWrites, Key>;

  }
}
