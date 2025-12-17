import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Writes = {};
type Options<Reads> = {
  condition: (state: Reads) => boolean | Promise<boolean>;
  then: WorkflowStep;
  else?: WorkflowStep;
};

export class If<
  Reads extends {},
  ThenWrites extends {},
  ElseWrites extends {}
> extends WorkflowStep<Reads, Partial<ThenWrites & ElseWrites>> {

  constructor(override options: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime: WorkflowRuntime) {
    const ok = await this.options.condition(reads);
    if (ok) return this.options.then.run(ctx, reads, runtime);
    if (this.options.else) return this.options.else.run(ctx, reads, runtime);
    return {};
  }
}
