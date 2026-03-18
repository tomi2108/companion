import axios from "axios";

import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { kebabToCamel } from "@lib/utils";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = { deployment: Deployment; project: Project };
type Writes = {};
type Options = {};

export class GenerateFrontendRoutes extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { deployment, project }: Reads) {
    await new ValidateConfig({ keys: ["openshift.mf_host_template"] }).run();
    const log = ctx.logger;
    const host_template = Config.getView().get("openshift.mf_host_template");
    const port = 8080;
    const env = deployment.env as string;
    const host = host_template.replaceAll("{{env}}", env);
    const serviceName = deployment.name;

    const camelCaseName = kebabToCamel(serviceName.slice(4));
    const pathname = `/app/${camelCaseName}`;
    const insecurePolicy = "Redirect";
    const termination = "edge";
    try {
      await project.createRoute({ serviceName, port, insecurePolicy, pathname, host, termination });
      log.success(`Created route '${serviceName}'`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.reason === "AlreadyExists") {
        log.warning(`Route '${serviceName}' already exists`);
      }
    }
    return {};
  }
}
