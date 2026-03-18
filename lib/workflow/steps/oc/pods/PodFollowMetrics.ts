import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { WorkflowStep } from "@workflow/steps";

type Reads = { pods: Pod[] };
type Writes = {};
type Options = {};

export class PodFollowMetrics extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { pods }: Reads) {
    await Promise.all(
      pods.map((p) => p.followMetrics())
    );
    return {};
  }
}
