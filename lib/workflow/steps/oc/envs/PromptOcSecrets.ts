import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";
import { Secret } from "@oc/secret";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes<Multiple extends boolean> = Multiple extends true ? { secrets: Secret[] } : { secret: Secret };
type Reads = { project: Project };
type Options<Reads, Multiple extends boolean> = {
  filter?: (secret: Secret, reads: Reads) => boolean;
  multiple?: Multiple;
};

export class PromptOcSecrets<
  R extends Reads = Reads,
  Multiple extends boolean = false
> extends WorkflowStep<R, Writes<Multiple>, Options<R, Multiple>> {

  constructor(override options?: WorkflowOptions<Options<Reads, Multiple>, Writes<Multiple>>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const deployments = await reads.project.getSecrets();
    const filtered = this.options?.filter
      ? deployments.filter((d) => this.options?.filter!(d, reads))
      : deployments;

    const multiple = this.options?.multiple;
    const secret = await ctx.ui.promptChoice(filtered, { message: "Select secret", multiple });

    if (Array.isArray(secret)) return { secrets: secret } as Writes<Multiple>;
    return { secret } as Writes<Multiple>;
  }
}
