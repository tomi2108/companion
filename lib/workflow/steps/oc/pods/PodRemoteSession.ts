import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { WorkflowStep } from "@workflow/steps";

type Reads = { pod: Pod };
type Writes = {};
type Options = {};

export class PodRemoteSession extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { pod }: Reads) {
    pod.remoteSession();
    return {};
  }
}
