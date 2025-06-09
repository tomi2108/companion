#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { search, input } = require("../../../lib/ui.cjs");
const path = require("node:path");
const fs = require("node:fs");
const { getApp, prepareYamlForDeploy, ENVS, yamlToString } = require("../../../interface/files.cjs");
const { getTags, stash, createNewBranch, add, commit, switchBranch, pull } = require("../../../interface/git.cjs");
const log = require("../../../lib/log.cjs");
const { readdirs } = require("../../../lib/utils.cjs");
const { createAndMergeMr } = require("../../../interface/glab.cjs");

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific pod version",
  handler: async () => {
    const apps = readdirs(config.paths.despliegues);
    const app_name = await search({ choices: apps });
    const app = getApp(app_name);

    await stash(app.deploy_path, async () => {
      await switchBranch(app.deploy_path, "master");
      await pull(app.deploy_path, "master");

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
      if (app.full_path) {
        const tags = await getTags(app.full_path);
        version = await search({ choices: tags, message: "Choose a version to deploy:" });
      } else {
        log.warning(`Tags for repository ${app.name} not found`);
        version = await input({ message: "Enter version to deploy, starting with a 'v':" });
      }

      await createNewBranch(app.deploy_path, "feature/despliegue");
      for (const env of selectedEnvs) {
        const { file_path, yaml } = app.deployments.find((y) => y.env === env);
        const file_name = path.basename(file_path);

        prepareYamlForDeploy(yaml);
        yaml.image.tag = version;
        const yaml_string = yamlToString(yaml);
        fs.writeFileSync(file_path, yaml_string);
        await add(app.deploy_path, file_name);
      }

      await commit(app.deploy_path, version);
      createAndMergeMr(app.deploy_path, "master");
    });
  }
};
