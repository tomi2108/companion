import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";
import { Secret } from "@oc/secret";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { secret: Secret };
type Reads = { project: Project };
type Options<Reads> = {
  filter?: (secret: Secret, reads: Reads) => boolean;
};

export class PromptOcSecret<R extends Reads = Reads> extends WorkflowStep<R, Writes, Options<R>> {

  constructor(override options?: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const deployments = await reads.project.getSecrets();
    const filtered = this.options?.filter
      ? deployments.filter((d) => this.options?.filter!(d, reads))
      : deployments;

    const secret = await ctx.ui.promptChoice(filtered, { message: "Select secret" });
    return { secret };
  }
}
