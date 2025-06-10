#!/usr/bin/env node

import { search, input } from "../../../lib/ui";
import log from "../../../lib/log";
import { Env, ENVS } from "../../../lib/constants";
import { promptForApp } from "../../../interface/prompts";
import { Config } from "../../../lib/config";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {

    const { app_repo, deploy_repo } = await promptForApp();
    if (!deploy_repo) throw new Error("Could not find deploy repo");

    await deploy_repo.stash(async () => {
      await deploy_repo.update();
      await deploy_repo.checkout("master");

      const choices = ENVS
        .map((e) => {
          const version = deploy_repo.getDeployment(e)?.getVersion();
          return {
            disabled: !version,
            hint: version ? `Current: ${version}` : "Missing yaml",
            name: e
          };
        });

      const selectedEnvs = await search({ message: "Select environment", multiple: true, choices }) as Env[];
      if (selectedEnvs.length === 0) return process.exit(1);

      let version = null;
      const { name } = await deploy_repo.getInfo();
      const { type } = await deploy_repo.getInfo();

      if (app_repo) {
        const tags = await app_repo.getTags();
        version = await search({ choices: tags, message: "Choose a version to deploy:" });
      } else {
        log.warning(`Tags for repository ${name} not found`);

        version = await input({ message: "Enter version to deploy, starting with a 'v':" });
      }

      await deploy_repo.createNewBranch("feature/despliegue");
      for (const env of selectedEnvs) {
        const deploymentFile = deploy_repo.getDeployment(env);
        if (!deploymentFile) throw new Error(`Could not find deployment file for env ${env}`);

        if (!Config.get().openshift.deployments?.exclude?.includes(name)
          && !Config.get().openshift.deployments?.exclude?.includes(env)
          && !Config.get().openshift.deployments?.exclude?.includes(type)
        ) deploymentFile.prepareDeploy(type);

        deploymentFile.setVersion(version);
        deploymentFile.save();
        await deploy_repo.add(deploymentFile.file_path);
      }

      await deploy_repo.commit(version);
      await deploy_repo.createAndMergeMr("master");
    });
  }
};
