import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "./steps";

export class Workflow {
  private steps: WorkflowStep<any, any>[];

  constructor(steps: WorkflowStep<any, any>[]) {
    this.steps = steps;
  }

  async run(
    ctx: ExecutionContext,
    initialState = {}
  ) {
    let state = initialState;

    for (const step of this.steps) {
      try {
        ctx.logger.debug("Running step", step.constructor.name);
        const output = await step.run(ctx, state);
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
    return state;
  }
}
