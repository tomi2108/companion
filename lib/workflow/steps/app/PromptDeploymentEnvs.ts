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

    const addsSecrets = await ui.confirm({ message: `Secrets? (${namespace})`, initial: false });
    const token = addsSecrets ? await getOcToken() : null;
    let secrets: Secret[] = [];
    let configmaps: ConfigMap[] = [];

    if (addsSecrets) {
      const project = await new Openshift(token as string).getProject(namespace);
      const secrets_available = await project.getSecrets();
      secrets = await ui.promptChoice(secrets_available, { message: "Select configmaps", multiple: true });
    }

    const addsConfigmaps = await ui.confirm({ message: `Configmaps? (${namespace})`, initial: false });
    if (addsConfigmaps) {
      const tokenn = token ?? await getOcToken();
      const project = await new Openshift(tokenn).getProject(namespace);
      const configmaps_availabie = await project.getConfigMaps();
      configmaps = await ui.promptChoice(configmaps_availabie, { message: "Select secrets", multiple: true });
    }

    return { secrets, configmaps, name: namespace };
  }
}
