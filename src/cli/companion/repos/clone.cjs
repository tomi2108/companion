#!/usr/bin/env node

const { cloneGroupOrProject } = require("../../../interface/glab.cjs");
const { createDirIfNotExists } = require("../../../interface/files.cjs");
const config = require("../../../lib/config.cjs");
const log = require("../../../lib/log.cjs");

module.exports = {
  command: "clone",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    const repos = config.gitlab.repos;
    const entries = Object.entries(repos);

    for (const [key, id] of entries) {
      const path = config.paths?.[key];
      if (!path) {
        log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);
        continue;
      }
      createDirIfNotExists(path);
      await cloneGroupOrProject(id, path);
    }
  }
};
