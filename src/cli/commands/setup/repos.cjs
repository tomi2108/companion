#!/usr/bin/env node

const { cloneRepos } = require("../../../lib/glab.cjs");

module.exports = {
  command: "repos",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    // TODO: get from config
    const ids = [1, 2, 3, 4];
    cloneRepos(ids);
  }
};
