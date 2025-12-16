import { ExecutionContext } from "@lib/ctx";
import { confirm } from "@lib/ui";

import { WorkflowOptions, WorkflowStep } from ".";

type Reads = {};
type Writes = {};
type Options = {
  message: string;
  step: WorkflowStep;
};

export class Confirm extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const sure = await confirm({ message: this.options.message });
    if (!sure) return {};
    return this.options.step.run(ctx, reads);
  }
}
