
import { DeployYaml } from "@files/deploy_yaml";
import { Repo } from "@interface/dirs/repo";
import log from "@lib/log/default";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { RepoAction } from "./actions";
import { LintDeploymentFilesAction } from "./actions/lint_deployment_files";

export class DeployRepo extends Repo {
  deployments: DeployYaml[] = [];
  override actions: RepoAction[] = [new LintDeploymentFilesAction()];

  getDeployment(namespace: string) {
    return this.deployments.find((d) => d.namespace === namespace);
  }

  async deploy(namespaces: {
    name: string;
    secrets: Secret[];
    configmaps: ConfigMap[];
  }[], version: string) {
    const targetBranch = "master";
    const sourceBranch = "feature/despliegue";
    await this.switchBranchIfExists(targetBranch);
    await this.createNewBranch(sourceBranch);
    await this.reset();

    for (const namespace of namespaces) {
      const deploymentFile = this.getDeployment(namespace.name) as DeployYaml;
      namespace.secrets.forEach((s) => deploymentFile.setSecret(s.name));
      namespace.configmaps.forEach((cm) => deploymentFile.setConfigMap(cm.name));
      deploymentFile.setVersion(version);
      await this.add(deploymentFile);
    }

    const c = await this.commit(version);
    if (!c) {
      log.warning("No changes made");
      return false;
    }
    await this.createAndMergeMr(targetBranch);
    await this.switchBranchIfExists(targetBranch);
    await this.deleteBranch(sourceBranch);
    return true;
  }
}
