import { ExecutionContext } from "@lib/ctx";
import { confirm } from "@lib/ui";

import { WorkflowOptions, WorkflowStep } from ".";

type Reads = {};
type Writes = {};
type Options = {
  message: string;
  initial?: boolean;
  onAccept: WorkflowStep;
  onReject?: WorkflowStep;
};

export class Confirm extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const { message, onAccept, onReject, initial } = this.options;
    const sure = await confirm({ message: message, initial });
    if (!sure && onReject) return onReject.run(ctx, reads);
    if (sure) return onAccept.run(ctx, reads);
    return {};
  }
}
