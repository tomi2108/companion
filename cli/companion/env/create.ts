import path from "node:path";

import { Repo } from "@files/repo";
import { SecretsYaml } from "@files/secrets_yaml";
import { promptForOcResource, promptTmpFile } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { input, search } from "@lib/ui";
import { parseKeyVal } from "@lib/utils";
import { getOcToken, Openshift } from "@oc";

export default {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {
    const vault_path = Config.get().paths.vault;
    if (!vault_path) throw new Error("Vault path not set");

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
    const file = new SecretsYaml(secrets_file);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      if (!file.hasSecret(name)) {
        file.addSecret(name);
        file.save();
        await repo.add(secrets_file);
        await repo.commit(name);
        await repo.push("master");
      }
      await repo.switchBranchIfExists(original_branch);
    });
  }
};
