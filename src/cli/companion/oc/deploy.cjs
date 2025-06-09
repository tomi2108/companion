#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { search, input } = require("../../../lib/ui.cjs");
const path = require("node:path");
const { getRepo, getOcYaml, searchAndReplace } = require("../../../interface/files.cjs");
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
    const app = await search({ choices: apps });
    const deploy_repo_path = path.join(config.paths.despliegues, app);

    await stash(deploy_repo_path, async () => {
      await switchBranch(deploy_repo_path, "master");
      await pull(deploy_repo_path, "master");

      const envs = ["dev", "int", "cert"];
      const yamls = envs.map((env) => ({ env, yaml: getOcYaml(env, app) }));
      const versions = yamls.map((y) => y.yaml ? y.yaml.version : null);

      const selectedEnvs = await search({
        multiple: true,
        choices: envs.map((e, i) => ({ disabled: !versions[i], hint: versions[i] ? `Current: ${versions[i]}` : "Missing yaml", name: e }))
      });
      if (selectedEnvs.length === 0) return process.exit(1);

      const name = yamls.reduce((acc, curr) => curr?.yaml?.name ? curr?.yaml?.name : acc);
      if (!name) {
        log.error(`Could not find name for app ${app} while trying to deploy, searched ${yamls.map((y) => y.yaml.full_path).join(" ")}`);
        return;
      }

      const repo = getRepo(config.paths.frontend, name) ?? getRepo(config.paths.backend, name);
      const type = repo.type;

      let version = null;
      if (repo) {
        const tags = await getTags(repo.full_path);
        version = await search({ choices: tags, message: "Choose a version to deploy:" });
      } else {
        log.warning(`Tags for repository ${app} not found, searched in ${config.paths.frontend} and ${config.paths.backend}`);
        version = await input({ message: "Enter version to deploy, starting with a 'v':" });
      }

      await createNewBranch(deploy_repo_path, "feature/despliegue");
      for (const env of selectedEnvs) {
        const file_path = yamls.find((y) => y.env === env).yaml.full_path;
        const file_name = path.basename(file_path);

        // TODO: implement this script
        // $scripts_repo/oc/dep-yaml $path/$file_name $type
        searchAndReplace(file_path, /tag: .*/, `tag: ${version}`);
        await add(deploy_repo_path, file_name);
      }

      await commit(deploy_repo_path, version);
      createAndMergeMr(deploy_repo_path, "master");
    });
  }
};
