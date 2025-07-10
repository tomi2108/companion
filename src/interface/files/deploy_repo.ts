import fs from "node:fs";
import path from "node:path";
import { DeployYaml } from "./deploy_yaml";
import { Repo } from "./repo";

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

}
