#!/usr/bin/env node

const { cloneRepo } = require("../../../interface/git.cjs");
const { cloneGroup } = require("../../../interface/glab.cjs");
const { createDirIfNotExists } = require("../../../interface/files.cjs");
const config = require("../../../lib/config.cjs");
const log = require("../../../lib/log.cjs");

module.exports = {
  command: "clone",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    const repos = config.gitlab.repos;
    const entriesIds = Object.entries(repos).filter(([, id]) => typeof id === "number");
    const entriesLinks = Object.entries(repos).filter(([, id]) => typeof id === "string");

    for (const [key, id] of entriesIds) {
      const path = config.paths?.[key];
      if (!path) {
        log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);
        continue;
      }
      createDirIfNotExists(path);
      cloneGroup(id, path);
    }

    for (const [key, link] of entriesLinks) {
      const path = config.paths?.[key];
      if (!path) {
        log.warning(`Could not clone repo with link ${link} and key ${key}, a path was not specified in the config`);
        continue;
      }
      createDirIfNotExists(path);
      cloneRepo(link, path);
    }

  }
};
