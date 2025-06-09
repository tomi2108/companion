#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { search, input } = require("../../../lib/ui.cjs");
const { deploy } = require("../../../interface/oc.cjs");
const { getRepo, getOcYaml } = require("../../../interface/paths.cjs");
const { getTags } = require("../../../interface/git.cjs");
const log = require("../../../lib/log.cjs");
const { readdirs } = require("../../../lib/utils.cjs");

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific pod version",
  handler: async () => {

    const apps = readdirs(config.paths.despliegues);
    const app = await search({ choices: apps });

    const envs = ["dev", "int", "cert"];
    const yamls = envs.map((env) => getOcYaml(env, app));
    const versions = yamls.map((y) => y ? y.version : null);

    const selectedEnvs = await search({
      multiple: true,
      choices: envs.map((e, i) => ({ disabled: !versions[i], hint: versions[i] ? `Current: ${versions[i]}` : "Missing yaml", name: e }))
    });
    if (selectedEnvs.length === 0) return process.exit(1);

    const name = yamls.reduce((acc, curr) => curr?.name ? curr.name : acc);
    if (!name) {
      log.error(`Could not find name for app ${app} while trying to deploy, searched ${yamls.map((y) => y.full_path).join(" ")}`);
      return;
    }
    const repo = getRepo(config.paths.frontend, name) ?? getRepo(config.paths.backend, name);

    let version = null;
    if (repo) {
      const tags = await getTags(repo.full_path);
      version = await search({ choices: tags, message: "Choose a version to deploy:" });
    } else {
      log.warning(`Tags for repository ${app} not found, searched in ${config.paths.frontend} and ${config.paths.backend}`);
      version = await input({ message: "Enter version to deploy, starting with a 'v':" });
    }

    deploy(selectedEnvs, app, version);
  }
};
