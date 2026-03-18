import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Pod } from "@oc/pod";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { pods: Pod[] };
type Reads = {
  project?: Project;
  deployment?: Deployment;
};
type Options = {};

export class GetPods extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { project, deployment }: Reads) {
    const source = deployment ?? project;
    if (!source) throw new Error("Could not find source for GetPods");
    const pods = await source.getPods();
    return { pods };
  }
}
