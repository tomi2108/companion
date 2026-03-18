import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Options<Reads, Writes> = {
  write: (state: Reads) => Writes;
};

export class Write<
  Reads extends {},
  Writes extends {}
> extends WorkflowStep<Reads, Writes> {

  constructor(override options: WorkflowOptions<Options<Reads, Writes>, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    return this.options.write(reads);
  }
}
