import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Options<Reads> = {
  effect: (state: Reads) => void | Promise<void>;
};
type Writes = {};

// Use discretely, do not abuse
export class Effect<Reads extends {}> extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    await this.options.effect(reads);
    return {};
  }
}
