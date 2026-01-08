import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Writes = {};
type Options<Reads, ThenReads, ElseReads, ThenWrites, ElseWrites> = {
  condition: (state: Reads) => boolean | Promise<boolean>;
  then: WorkflowStep<ThenReads, ThenWrites>;
  else?: WorkflowStep<ElseReads, ElseWrites>;
};

export class If<
  Reads extends {},
  ThenReads extends {},
  ElseReads extends {},
  ThenWrites extends {},
  ElseWrites extends {}
> extends WorkflowStep<Reads & ThenReads & ElseReads, Partial<ThenWrites & ElseWrites>> {

  constructor(override options: WorkflowOptions<Options<Reads, ThenReads, ElseReads, ThenWrites, ElseWrites>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads & ThenReads & ElseReads, runtime: WorkflowRuntime) {
    const ok = await this.options.condition(reads);
    if (ok) return this.options.then.run(ctx, reads, runtime);
    if (this.options.else) return this.options.else.run(ctx, reads, runtime);
    return {};
  }
}
