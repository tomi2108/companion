import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes = { deployments: Deployment[] };
type Reads = { project: Project };
type Options = {};

export class GetDeployments extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { project }: Reads) {
    const deployments = await project.getDeployments();
    return { deployments };
  }
}
