import fs from "node:fs";
import path from "node:path";

import { DeployYaml } from "@files/deploy_yaml";
import { Repo } from "@files/repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

export class DeployRepo extends Repo {
  deployments: DeployYaml[];

  constructor(full_path: string) {
    super(full_path);
    this.deployments = this.updateDeployments(full_path);
  }

  private updateDeployments(full_path: string) {
    const dir = fs.readdirSync(full_path, { withFileTypes: true });
    const yaml_files = dir
      .filter(DeployYaml.isDeployYamlFile)
      .map((f) => path.join(full_path, f.name));
    return yaml_files.map((f) => new DeployYaml(f));
  }

  override async pull(branch: string) {
    const res = await super.pull(branch);
    this.deployments = this.updateDeployments(this.full_path);
    return res;
  }

  getDeployment(namespace: string) {
    return this.deployments.find((d) => d.namespace === namespace);
  }

  async deploy(namespaces: {
    name: string;
    secrets: Secret[];
    configmaps: ConfigMap[];
  }[], version: string) {
    return await this.stash(async () => {
      await this.update();
      await this.switchBranchIfExists("master");

      const { name, type } = await this.getInfo();

      await this.createNewBranch("feature/despliegue");
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
        log.error("No changes made");
        return false;
      }
      await this.createAndMergeMr("master");
      return true;
    });

  }

}
