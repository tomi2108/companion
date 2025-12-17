import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};

type Writes = { project: Project };
type Options = { server: "brc" | "cuyo"; projectName: string };

export class FindProject extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const projectName = this.options.projectName;
    const project = await new Openshift(await getOcToken()).getProject(projectName);
    if (!project) throw new Error(`Could not find project ${projectName}`);
    return { project };
  }
}
