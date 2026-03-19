import { DeployYaml } from "@files/deploy_yaml";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Project } from "@oc/project";
import { Secret } from "@oc/secret";
import { OpenshiftServer } from "@oc/server";

import { WorkflowStep } from "..";

type Reads = {
  deploy_yaml?: DeployYaml;
  project?: Project;
};
type Writes = { secrets: Secret[]; configmaps: ConfigMap[]; name: string };

export class PromptDeploymentEnvs extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { deploy_yaml, project }: Reads) {
    const namespace = deploy_yaml?.namespace ?? project?.name;
    if (!namespace) throw new Error("Missing namespace in PromptDeploymentEnvs");
    const ui = ctx.ui;

    const oc = await new OpenshiftServer("cuyo").authenticate();
    const oc_project = project ?? await oc.getProject(namespace);

    const secrets_available = await oc_project.getSecrets();
    const configmaps_availabie = await oc_project.getConfigMaps();

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
