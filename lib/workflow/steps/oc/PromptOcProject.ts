import { promptForOcResource } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = { project: Project };
type Options<Reads> = {
  server: "brc" | "cuyo";
  filter?: (project: Project, reads: Reads) => boolean;
};

export class PromptOcProject<Reads extends {} = {}> extends WorkflowStep<Reads, Writes, Options<Reads>> {

  constructor(override options: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    const token = await getOcToken(this.options.server);
    const projects = await new Openshift(token, this.options.server).getProjects();
    const filtered = this.options.filter
      ? projects.filter((p) => this.options.filter!(p, reads))
      : projects;

    const project = await promptForOcResource(filtered, { message: "Select project" });
    return { project };
  }
}
