import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "../..";
import { TimesOptions, TimesWrites } from "./types";

type Options = {
  times: number;
};
export class Times<
  Reads,
  InnerReads,
  InnerWrites,
  InnerOptions,
  Keys extends string[]
> extends WorkflowStep<
  Reads & InnerReads,
    TimesWrites<InnerWrites, Keys>,
    TimesOptions<Options, Keys, InnerReads, InnerWrites, InnerOptions>
  > {

  constructor(
    override options: WorkflowOptions<
      TimesOptions<Options, Keys, InnerReads, InnerWrites, InnerOptions>,
      TimesWrites<InnerWrites, Keys>
    >
  ) {
    super();
  }

  async run(
    ctx: ExecutionContext,
    state: Reads & InnerReads
  ): Promise<TimesWrites<InnerWrites, Keys>> {
    const results: Record<string, InnerWrites> = {};
    const times = this.options.times;

    for (let i = 0; i < times; i++) {
      const output = await this.options.step.run(ctx, state);
      const collectAs = this.options.collectAs?.[i];
      if ("collectAs" in this.options && output && collectAs) results[collectAs] = output;
    }

    return results as TimesWrites<InnerWrites, Keys>;
  }
}
