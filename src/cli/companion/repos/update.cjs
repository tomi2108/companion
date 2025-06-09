#!/usr/bin/env node

const { stash, pull, switchBranchIfExists } = require("../../../interface/git.cjs");
const config = require("../../../lib/config.cjs");
const log = require("../../../lib/log.cjs");
const { readdirs } = require("../../../lib/utils.cjs");
const path = require("node:path");

module.exports = {
  command: "update",
  aliases: [],
  describe: "Update all repositories",
  handler: async () => {
    // TODO: clone missing repositories

    const apps = [
      ...readdirs(config.paths.frontend).map((p) => path.join(config.paths.frontend, p)),
      ...readdirs(config.paths.backend).map((p) => path.join(config.paths.backend, p))
    ].filter(Boolean);

    const repos = [
      ...readdirs(config.paths.despliegues).map((p) => path.join(config.paths.despliegues, p)),
      ...readdirs(config.paths.vault).map((p) => path.join(config.paths.vault, p)),
      config.paths["3scale"],
      config.paths.argocd
    ].filter(Boolean);

    for (const full_path of apps) {
      log.info(`Updating ${full_path}`);
      await stash(full_path, async () => {
        await switchBranchIfExists(full_path, "master");
        await pull(full_path);
        await switchBranchIfExists(full_path, "develop");
        await pull(full_path);
        await switchBranchIfExists(full_path, "release");
        await pull(full_path);
      });
    }

    for (const full_path of repos) {
      log.info(`Updating ${full_path}`);
      await stash(full_path, async () => {
        await switchBranchIfExists(full_path, "master");
        await pull(full_path);
      });
    }
  }
};
