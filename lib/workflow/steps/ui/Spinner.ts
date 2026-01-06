import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Options<Reads, Writes> = {
  message: string | ((reads: Reads) => string | Promise<string>);
  step: WorkflowStep<Reads, Writes>;
};

export class Spinner<Reads, Writes> extends WorkflowStep<Reads, Writes> {

  constructor(override options: WorkflowOptions<Options<Reads, Writes>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime: WorkflowRuntime) {
    const spinner = ctx.ui.loading(
      typeof this.options.message === "string"
        ? this.options.message
        : await this.options.message(reads)
    );
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
