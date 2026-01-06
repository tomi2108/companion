import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { pod: Pod };
type Reads = { project: Project };
type Options<Reads> = {
  filter?: (pod: Pod, reads: Reads) => boolean;
};

export class PromptOcPod<R extends Reads = Reads> extends WorkflowStep<R, Writes, Options<R>> {

  constructor(override options?: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const pods = await reads.project.getPods();
    const filtered = this.options?.filter
      ? pods.filter((d) => this.options?.filter!(d, reads))
      : pods;

    const pod = await ctx.ui.promptChoice(filtered, { message: "Select pod" });
    return { pod };
  }
}
