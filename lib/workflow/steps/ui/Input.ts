
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes<K extends string> = {
  [key in K]: string
};
type Options<K, Reads> = {
  message: string | ((state: Reads) => string);
  write: K;
};

export class Input<K extends string, Reads extends {}> extends WorkflowStep<Reads, Writes<K>> {

  constructor(override options: WorkflowOptions<Options<K, Reads>, Writes<K>>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const message = this.options.message;
    const out = await ctx.ui.input({
      message: typeof message === "string" ? message : message?.(reads)
    });
    return { [this.options.write]: out } as Writes<K>;
  }
}
