import { writeFileSync } from "node:fs";
import path from "node:path";

import { getApp } from "@files";
import { createDirIfNotExists } from "@files/utils";
import { Repo } from "@interface/dirs/repo";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log/default";
import { search } from "@lib/ui";
import { toYaml } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

const availabe_methods = ["GET", "POST"];

export default {
  command: "expose",
  aliases: ["e"],
  describe: "Expose app in 3scale",
  handler: async () => {
    const repo = new Repo(repo_path);
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();

    const deployment = await promptForOcResource(deployments);
    const namespace = project.name;

    const repo_path = Config.get().paths.threescale;
    if (!repo_path) throw new ConfigError("paths.threescale");

    const system_name = Config.get().threescale.products?.[namespace];
    if (!system_name) throw new ConfigError(`threescale.products.${namespace}`);

    const { app_repo } = await getApp(deployment.name);

    const dir_name = `${deployment.name}-${namespace}`;
    const file_name = `${dir_name}.yaml`;

    const dir_to_create = path.join(repo.full_path, dir_name);
    const file_to_create = path.join(repo.full_path, dir_name, file_name);

    const methods = await search({ choices: availabe_methods, message: "Select methods for backend", multiple: true });

    const description = app_repo?.description ?? "";
    if (!description) log.warning("Could not find app_repo, using empty description");

    const file_content = {
      kind: "abm-backend",
      metadata: { name: `create-${dir_name}` },
      type: "create",
      specs: {
        backend: {
          "deployment-name": deployment.name,
          "http-methods": methods.join(","),
          pattern: "/",
          environment: namespace,
          path: `/${deployment.name}`,
          description,
          namespace
        },
        product: {
          "system-name": system_name
        }
      }
    };

    const yaml_content = toYaml(file_content);

    await repo.stash(async () => {
      await repo.switchBranchIfExists("create");
      await repo.update();
      const new_branch = `feature/create/${dir_name}`;

      const branches = await repo.getBranches();
      if (branches.includes(new_branch)) await repo.deleteBranch(new_branch);
      await repo.createNewBranch(new_branch);

      createDirIfNotExists(dir_to_create);
      writeFileSync(file_to_create, yaml_content);
      await repo.add(file_to_create);
      await repo.commit(`create ${dir_name}`);
      await repo.createAndMergeMr("create");
      await repo.switchBranchIfExists("create");
      await repo.deleteBranch(new_branch);
    });
  }
};
