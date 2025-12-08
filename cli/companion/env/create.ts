import path from "node:path";

import { SecretsYaml } from "@files/secrets_yaml";
import { Repo } from "@interface/dirs/repo";
import { promptForOcResource, promptTmpFile } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { input, search } from "@lib/ui";
import { parseKeyVal } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {
    const vault_path = Config.get().paths.vault;
    if (!vault_path) throw new ConfigError("paths.vault");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const choices = ["configmap", "secret"];
    const resource = await search({ message: "Choose type of resource to create", choices });
    if (!resource) process.exit(1);

    const name = await input({ message: `Enter a name for the new ${resource}` });
    if (!name) process.exit(1);

    const { changed, new_content } = await promptTmpFile(`${name}-${resource}`, "KEY=VALUE");

    if (!changed) {
      log.info("Create canceled, no changes made");
      process.exit(0);
    }
    const data = parseKeyVal(new_content);

    if (resource === "configmap") {
      const cm = await project.createConfigMap(name, data);
      log.success(`${cm.name} created`);
      return;
    }

    await project.createSecret(name, data);
    const repo_path = path.join(vault_path, project.name);
    const secrets_file = path.join(repo_path, "values.yaml");
    const repo = new Repo(repo_path);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const master_file = new SecretsYaml(secrets_file);
      if (!master_file.hasSecret(name)) {
        const temp_branch = `feature/add-secret-${name}`;
        await repo.createNewBranch(temp_branch);
        const file = new SecretsYaml(secrets_file);
        file.addSecret(name);
        file.save();
        await repo.add(secrets_file);
        await repo.commit(name);
        await repo.createAndMergeMr("master");
        await repo.switchBranchIfExists("master");
        await repo.deleteBranch(temp_branch);
      }
      await repo.switchBranchIfExists(original_branch);
    });
  }
};
