import { DeployYaml } from "@files/deploy_yaml";
import { ExecutionContext } from "@lib/ctx";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { WorkflowStep } from "..";

type Reads = { deploy_yaml: DeployYaml };
type Writes = { secrets: Secret[]; configmaps: ConfigMap[]; name: string };

export class PromptDeploymentEnvs extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { deploy_yaml }: Reads) {
    const namespace = deploy_yaml.namespace;
    const ui = ctx.ui;

    const token = await getOcToken();
    const project = await new Openshift(token).getProject(namespace);

    const secrets_available = await project.getSecrets();
    const configmaps_availabie = await project.getConfigMaps();

    const secrets = await ui.confirmAndSearch(
      secrets_available,
      { message: `Secrets? (${namespace})`, initial: false },
      { message: "Select secrets", multiple: true }
    ) ?? [];

    const configmaps = await ui.confirmAndSearch(
      configmaps_availabie,
      { message: `Configmaps? (${namespace})`, initial: false },
      { message: "Select configmaps", multiple: true }
    ) ?? [];

    return { secrets, configmaps, name: namespace };
  }
}
