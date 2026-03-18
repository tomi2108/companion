
import { DeployYaml } from "@files/deploy_yaml";
import { Dir } from "@interface/dirs/dir";
import { GitProvider } from "@interface/git/provider";
import { DeployEvent } from "@lib/actions/events";
import { ActionRegistry } from "@lib/actions/registry";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { Repo } from "./repo";
import { RepoWithGitProvider } from "./withProvider";

export class DeployRepo extends RepoWithGitProvider {
  deployments: DeployYaml[] = [];

  constructor(dir: Dir, provider: GitProvider) {
    super(new Repo(dir), provider);
    const files = this.dir.readFiles();
    const yaml_files = files.filter(DeployYaml.isDeployYamlFile);
    this.deployments = yaml_files.map((f) => new DeployYaml(f.path));
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
    const deployment_files = namespaces.map((n) => this.getDeployment(n.name)!);

    await this.switchBranchIfExists(targetBranch);
    await this.createNewBranch(sourceBranch);
    await this.reset();

    await ActionRegistry.dispatch(new DeployEvent({ repo: this, files: deployment_files }));
    for (const namespace of namespaces) {
      const deploymentFile = this.getDeployment(namespace.name) as DeployYaml;
      namespace.secrets.forEach((s) => deploymentFile.setSecret(s.name));
      namespace.configmaps.forEach((cm) => deploymentFile.setConfigMap(cm.name));
      deploymentFile.setVersion(version);
      await this.add(deploymentFile);
    }

    const c = await this.commit(version);
    if (!c) {
      ExecutionContext.get().logger.warning("No changes made");
      return false;
    }
    await this.createAndMergeMr(targetBranch);
    await this.switchBranchIfExists(targetBranch);
    await this.deleteBranch(sourceBranch);
    return true;
  }
}
