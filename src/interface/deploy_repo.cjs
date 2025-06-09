const fs = require("node:fs");
const path = require("node:path");
const { Repo } = require("./repo.cjs");
const { DeployYaml } = require("./deploy_yaml.cjs");

class DeployRepo extends Repo {

  constructor(full_path) {
    const dir = fs.readdirSync(full_path, { withFileTypes: true });
    const yaml_files = dir
      .filter(DeployYaml.isDeployYamlFile)
      .map((f) => path.join(full_path, f.name));

    super(full_path);

    this.deployments = yaml_files.map((f) => new DeployYaml(f));
  }

  getDeployment(env) {
    return this.deployments.find((d) => d.isEnv(env));
  }

}

module.exports = { DeployRepo };
