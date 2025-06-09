#!/usr/bin/env node

const { cloneRepo } = require("../../../interface/glab.cjs");
const config = require("../../../lib/config.cjs");

module.exports = {
  command: "repos",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    const ids = config.gitlab.repo_ids;
    for (const id of ids) {
      cloneRepo(id);
    }
  }
};
