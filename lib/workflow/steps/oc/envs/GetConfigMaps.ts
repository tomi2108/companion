import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = { configmaps: ConfigMap[] };
type Reads = { project: Project };
type Options = {};

export class GetConfigMaps extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { project }: Reads) {
    const configmaps = await project.getConfigMaps();
    return { configmaps };
  }
}
