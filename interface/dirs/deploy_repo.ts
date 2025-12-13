import fs from "node:fs";
import path from "node:path";

import { DeployYaml } from "@files/deploy_yaml";
import { Repo } from "@interface/dirs/repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

export class DeployRepo extends Repo {
  deployments: DeployYaml[] = [];

  override async updateState() {
    const dir = fs.readdirSync(this.full_path, { withFileTypes: true });
    const yaml_files = dir
      .filter(DeployYaml.isDeployYamlFile)
      .map((f) => path.join(this.full_path, f.name));
    this.deployments = yaml_files.map((f) => new DeployYaml(f));
  }

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
    const { name, type } = await this.getInfo();
    await this.createNewBranch(sourceBranch);
    await this.reset();

    for (const namespace of namespaces) {
      const deploymentFile = this.getDeployment(namespace.name) as DeployYaml;

      if (!Config.get().openshift.deployments?.exclude?.includes(name)
        && !Config.get().openshift.deployments?.exclude?.includes(namespace.name)
        && !Config.get().openshift.deployments?.exclude?.includes(type)
      ) deploymentFile.prepareDeploy(type);

      namespace.secrets.forEach((s) => deploymentFile.setSecret(s.name));
      namespace.configmaps.forEach((cm) => deploymentFile.setConfigMap(cm.name));
      deploymentFile.setVersion(version);
      deploymentFile.save();
    }

    for (const namespace of namespaces) {
      const deploymentFile = this.getDeployment(namespace.name) as DeployYaml;
      await this.add(deploymentFile.file_path);
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
