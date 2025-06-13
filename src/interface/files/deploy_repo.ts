import fs from "node:fs";
import path from "node:path";
import { Env } from "../../lib/constants";
import { DeployYaml } from "./deploy_yaml";
import { Repo } from "./repo";

export class DeployRepo extends Repo {
  deployments: DeployYaml[];

  constructor(full_path: string) {
    const dir = fs.readdirSync(full_path, { withFileTypes: true });
    const yaml_files = dir
      .filter(DeployYaml.isDeployYamlFile)
      .map((f) => path.join(full_path, f.name));

    super(full_path);

    this.deployments = yaml_files.map((f) => new DeployYaml(f));
  }

  getDeployment(env: Env) {
    return this.deployments.find((d) => d.isEnv(env));
  }

}
