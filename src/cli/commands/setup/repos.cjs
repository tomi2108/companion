#!/usr/bin/env node

const { config } = require("yargs");
const { setupConfig } = require("../../../lib/config.cjs");
const { executeScript } = require("../../../lib/cmd.cjs");

module.exports = {
  command: "repos",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    // TODO: get from config
    const ids = [1, 2, 3, 4];
    executeScript("glab/repo_clone", {
      args: ids
    });
  }
};
