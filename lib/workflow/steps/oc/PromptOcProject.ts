import { promptForOcResource } from "@interface/prompts";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = { project: Project };
type Options = { server: "brc" | "cuyo" };

export class PromptOcProject extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const token = await getOcToken(this.options.server);
    const projects = await new Openshift(token, this.options.server).getProjects();
    const project = await promptForOcResource(projects, { message: "Select project" });
    return { project };
  }
}
