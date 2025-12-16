import { promptForOcResource } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes = { deployment: Deployment };
type Reads = { project: Project };
type Options<Reads> = {
  filter?: (project: Deployment, reads: Reads) => boolean;
};

export class PromptOcDeployment<R extends Reads = Reads> extends WorkflowStep<R, Writes, Options<R>> {

  constructor(override options?: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    const deployments = await reads.project.getDeployments();
    const filtered = this.options?.filter
      ? deployments.filter((d) => this.options?.filter!(d, reads))
      : deployments;

    const deployment = await promptForOcResource(filtered, { message: "Select deployment" });
    return { deployment };
  }
}
