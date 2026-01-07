import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";

import { WorkflowStep } from "../..";

type Writes = {};
type Reads = { deployment: Deployment };
type Options = {};

export class DeploymentRestart extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { deployment }: Reads) {
    await deployment.restart();
    return {};
  }
}
