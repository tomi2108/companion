import { ExecutionContext } from "@lib/ctx";

export type WorkflowOptions<Options, Writes> = Options & {
  transform?: (output: Writes) => Record<string, any>;
};

export abstract class WorkflowStep<Reads = {}, Writes = {}, Options = {}> {
  abstract run(ctx: ExecutionContext, reads: Reads): Promise<Writes>;
  options?: WorkflowOptions<Options, Writes>;

  constructor(options?: WorkflowOptions<Options, Writes>) {
    if (options) this.options = options;
  }
}
