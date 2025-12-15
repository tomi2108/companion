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
      const output = await step.run(ctx, state);
      state = { ...state, ...output };
    }

    return state;
  }
}
