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

    const env = await search({ choices: ["dev", "int", "cert"] });
    if (!env) return process.exit(1);

    const apps = readdirs(config.paths.despliegues);
    const app = await search({ choices: apps });
    const yaml = getOcYaml(env, app);

    const repo = getRepo(config.paths.frontend, yaml.name) ?? getRepo(config.paths.backend, yaml.name);
    let version = null;

    if (repo) {
      const tags = await getTags(repo.full_path);
      version = await search({ choices: tags, message: `Choose a version to deploy, current version: ${yaml.version}` });
    } else {
      log.warning(`Tags for repository ${app} not found, searched in ${config.paths.frontend} and ${config.paths.backend}`);
      version = await input({ message: "Enter version to deploy, starting with a 'v':" });
    }

    deploy(env, app, version);
  }
};
