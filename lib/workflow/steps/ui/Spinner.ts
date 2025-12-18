import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Options<Reads, Writes> = {
  message: (reads: Reads) => string | Promise<string>;
  step: WorkflowStep<Reads, Writes>;
};

export class Spinner<Reads, Writes> extends WorkflowStep<Reads, Writes> {

  constructor(override options: WorkflowOptions<Options<Reads, Writes>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime: WorkflowRuntime) {
    const spinner = loading(await this.options.message(reads));
    try {
      const output = await this.options.step.run(ctx, reads, runtime);
      spinner.succeed();
      return output;
    } catch (err) {
      spinner.fail();
      throw err;
    }
  }
}
