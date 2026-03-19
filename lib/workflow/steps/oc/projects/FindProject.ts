import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";
import { OpenshiftServer } from "@oc/server";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { project: Project };
type Options = { projectName: string };
type Reads = {
  server: OpenshiftServer;
};

export class FindProject extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    const projectName = this.options.projectName;
    const project = await reads.server.getProject(projectName);
    if (!project) throw new Error(`Could not find project ${projectName}`);
    return { project };
  }
}
