#!/usr/bin/env node

const { Repo } = require("../../../lib/repo.cjs");
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

    const repos = Array.from(new Set(
      Object.values(config.paths)
        .flatMap((full_path) =>
          readdirs(full_path)
            .map((p) => path.join(full_path, p))
        )
        .filter(Repo.isGitRepo)
    ));

    await Promise.all(
      repos.map(
        async (path) => {
          log.info(`Updating ${path}`);
          await new Repo(path).update();
        }
      )
    );
  }
};
