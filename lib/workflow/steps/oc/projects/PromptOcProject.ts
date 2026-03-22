import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";
import { OpenshiftServer } from "@oc/server";

import { WorkflowStep } from "../..";

type Writes = { project: Project };
type Options<Reads> = {
  filter?: (project: Project, reads: Reads) => boolean;
};

type Reads = {
  server: OpenshiftServer;
};

export class PromptOcProject<R extends {}> extends WorkflowStep<Reads & R, Writes, Options<Reads & R>> {

  async run(ctx: ExecutionContext, reads: Reads & R) {
    const projects = await reads.server.getProjects();
    const filtered = this.options?.filter
      ? projects.filter((p) => this.options?.filter!(p, reads))
      : projects;

    const project = await ctx.ui.promptChoice(filtered, { message: "Select project" });
    return { project };
  }
}
