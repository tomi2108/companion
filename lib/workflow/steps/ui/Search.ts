import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = {
  choice: string;
};
type Options = {
  message: string;
  choices: readonly string[];
};

export class Search extends WorkflowStep<Reads, Writes> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    const choice = await ctx.ui.search({
      choices: this.options.choices as string[],
      message: this.options.message
    });
    return { choice };
  }
}
