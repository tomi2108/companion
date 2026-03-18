import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { WorkflowStep } from "@workflow/steps";

type Reads = { pod: Pod; command: string };
type Writes = {};
type Options = {};

export class PodExec extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { pod, command }: Reads) {
    const output = await pod.exec(command);
    ctx.logger.info(output);
    return {};
  }
}
