import { ExecutionContext } from "@lib/ctx";
import { ProgressScope } from "@workflow/progress/types";

export type WorkflowOptions<Options, Writes> = Options & {
  transform?: (output: Writes) => Record<string, any>;
  onEnd?: (output: Writes) => void;
};

export type WorkflowRuntime = {
  progress?: ProgressScope;
};

export abstract class WorkflowStep<Reads = {}, Writes = {}, Options = {}> {
  abstract run(ctx: ExecutionContext, reads: Reads, runtime?: WorkflowRuntime): Promise<Writes>;
  options?: WorkflowOptions<Options, Writes>;

  constructor(options?: WorkflowOptions<Options, Writes>) {
    if (options) this.options = options;
  }
}
