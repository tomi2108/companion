import { ExecutionContext } from "@lib/ctx";

import { ProgressController } from "./progress/types";
import { WorkflowStep } from "./steps";

type WorkflowOptions = {
  progressController?: ProgressController;
};

export class Workflow {
  private steps: WorkflowStep<any, any>[];
  options: WorkflowOptions;

  constructor(steps: WorkflowStep<any, any>[], options?: WorkflowOptions) {
    this.steps = steps;
    this.options = options ?? {};
  }

  async run(
    ctx: ExecutionContext,
    initialState = {}
  ) {
    let state = initialState;
    const runtime = { progress: this.options.progressController?.root() };

    for (const step of this.steps) {
      try {
        ctx.logger.debug("Running step", step.constructor.name);
        const output = await step.run(ctx, state, runtime);
        ctx.logger.debug("Exited with", output);
        const transformed = step.options?.transform?.(output) ?? output;
        const newState = { ...state, ...transformed };
        state = newState;
        ctx.logger.debug("New state", newState);
      } catch (err) {
        ctx.logger.error(err as string);
        throw err;
      }
    }
    runtime.progress?.close();
    return state;
  }
}
