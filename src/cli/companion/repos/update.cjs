#!/usr/bin/env node

const { Repo } = require("../../../interface/repo.cjs");
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
        .filter(Boolean)
    ));

    await Promise.all(
      repos.map(
        async (path) => {
          // TODO: should probably filter from repos
          // everything that is not a valid git repo
          try {
            log.info(`Updating ${path}`);
            await new Repo(path).update();
          } catch { }
        }
      )
    );
  }
};
