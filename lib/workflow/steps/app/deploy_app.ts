import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { WorkflowStep } from "..";

type Reads = {
  deploy_repo: DeployRepo;
  version: string;
  namespaces: {
    name: string;
    secrets: Secret[];
    configmaps: ConfigMap[];
  }[];
};

export class DeployApp extends WorkflowStep<Reads> {

  async run(_: ExecutionContext, { deploy_repo, namespaces, version }: Reads) {
    await deploy_repo.deploy(namespaces, version);
    return {};
  }
}
