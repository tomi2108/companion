#!/usr/bin/env node

const { search, input } = require("../../../lib/ui.cjs");
const log = require("../../../lib/log.cjs");
const { ENVS } = require("../../../lib/constants.cjs");
const { promptForApp } = require("../../../interface/prompts.cjs");
const config = require("../../../lib/config.cjs");

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {

    const { app_repo, deploy_repo } = await promptForApp();

    await deploy_repo.stash(async () => {
      await deploy_repo.update();
      await deploy_repo.checkout("master");

      const choices = ENVS
        .map((e) => {
          const version = deploy_repo.getDeployment(e).getVersion();
          return {
            disabled: !version,
            hint: version ? `Current: ${version}` : "Missing yaml",
            name: e
          };
        });

      const selectedEnvs = await search({ multiple: true, choices });
      if (selectedEnvs.length === 0) return process.exit(1);

      let version = null;
      const name = await deploy_repo.getName();
      const type = await deploy_repo.getType();

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

        if (
          !config.openshift.deployments.exclude?.includes(name)
          && !config.openshift.deployments.exclude?.includes(env)
          && !config.openshift.deployments.exclude?.includes(type)
        ) deploymentFile.prepareDeploy(type);

        deploymentFile.setVersion(version);
        deploymentFile.save();
      }

      await deploy_repo.commit(version);
      await deploy_repo.createAndMergeMr("master");
    });
  }
};
