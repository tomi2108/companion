import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { pods: Pod[] };
type Reads = { project: Project };
type Options = {};

export class GetPods extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { project }: Reads) {
    const pods = await project.getPods();
    return { pods };
  }
}
