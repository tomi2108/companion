import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Writes = {};
type Reads = { project: Project; deployment: Deployment };
type Options = {};

export class GenerateConfigMap extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { project, deployment }: Reads) {
    const log = ctx.logger;
    const configmaps = await project.getConfigMaps();
    const { name } = deployment;

    if (configmaps.some((c) => c.name === name)) {
      log.warning("Configmap", `'${name}'`, "already exists");
      return {};
    }

    const prefix = ctx.config.envs.generate?.prefix ?? "";
    const env_name = name.split(prefix)[1]?.toUpperCase().replaceAll("-", "_") + "_URL";
    const env_value = `http://${name}.${project.name}.svc.cluster.local:8080`;
    await project.createConfigMap(name, { [env_name]: env_value });
    log.success("Created configmap", `'${name}'`);
    return {};
  }
}
