import { ExecutionContext } from "@lib/ctx";

import { ProgressController } from "./progress/types";
import { WorkflowOptions, WorkflowStep } from "./steps";

type Reads = {};
type Writes = {};
type Options = {
  progressController?: ProgressController;
};

export class Workflow extends WorkflowStep<Reads, Writes, Options> {
  private steps: WorkflowStep<any, any>[];
  override options: WorkflowOptions<Options, Writes>;

  constructor(steps: WorkflowStep<any, any>[], options?: WorkflowOptions<Options, Writes>) {
    super();
    this.steps = steps;
    this.options = options ?? {};
  }

  async run(
    ctx: ExecutionContext,
    initialState = {}
  ) {
    let state = initialState;
    const runtime = {
      progress: this.options.progressController?.root()
    };

    for (const step of this.steps) {
      try {
        const output = await step.run(ctx, state, runtime);
        const transformed = await step.options?.transform?.(output) ?? output;
        const newState = { ...state, ...transformed };
        await step.options?.onEnd?.(newState);
        state = newState;
      } catch (err) {
        ctx.logger.error(err as string);
        throw err;
      }
    }
    runtime.progress?.close();
    return state;
  }
}
