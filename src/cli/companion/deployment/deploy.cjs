#!/usr/bin/env node

const { search, input } = require("../../../lib/ui.cjs");
const path = require("node:path");
const fs = require("node:fs");
const { prepareYamlForDeploy, yamlToString } = require("../../../interface/files.cjs");
const { Repo, InvalidGitRepo } = require("../../../interface/repo.cjs");
const log = require("../../../lib/log.cjs");
const { ENVS } = require("../../../lib/constants.cjs");
const { promptForApp } = require("../../../interface/prompts.cjs");
const config = require("../../../lib/config.cjs");

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {
    const app = await promptForApp();

    const deploy_repo = new Repo(app.deploy_path);
    await deploy_repo.stash(async () => {
      await deploy_repo.switchBranch("master");
      await deploy_repo.pull("master");

      const versions = app.deployments.map(({ env, version }) => ({ env, version }));
      const choices = ENVS
        .map((e) => {
          const v = versions.find((v) => v.env === e);
          const version = v?.version;
          return {
            disabled: !version,
            hint: version ? `Current: ${version}` : "Missing yaml",
            name: e
          };
        });

      const selectedEnvs = await search({ multiple: true, choices });
      if (selectedEnvs.length === 0) return process.exit(1);

      let version = null;

      try {
        const tags = await new Repo(app.full_path).getTags();
        version = await search({ choices: tags, message: "Choose a version to deploy:" });
      } catch (err) {
        if (err instanceof InvalidGitRepo) {
          log.warning(`Tags for repository ${app.name} not found`);
          version = await input({ message: "Enter version to deploy, starting with a 'v':" });
        }
      }

      await deploy_repo.createNewBranch("feature/despliegue");
      for (const env of selectedEnvs) {
        const { file_path, yaml } = app.deployments.find((y) => y.env === env);
        const file_name = path.basename(file_path);

        if (
          !config.openshift.deployments.exclude?.includes(app.name)
          && !config.openshift.deployments.exclude?.includes(env)
          && !config.openshift.deployments.exclude?.includes(app.type)
        ) prepareYamlForDeploy(yaml, app.type, env);

        yaml.image.tag = version;
        const yaml_string = yamlToString(yaml);
        fs.writeFileSync(file_path, yaml_string);
        await deploy_repo.add(file_name);
      }

      await deploy_repo.commit(version);
      await deploy_repo.createAndMergeMr("master");
    });
  }
};
