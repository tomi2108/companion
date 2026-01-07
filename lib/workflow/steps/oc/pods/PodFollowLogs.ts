import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { WorkflowStep } from "@workflow/steps";

type Reads = { pods: Pod[] };
type Writes = {};
type Options = {
  raw?: boolean;
};

export class PodFollowLogs extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { pods }: Reads) {
    pods.map((p) => p.followLogs({ raw: this.options?.raw }));
    return {};
  }
}
