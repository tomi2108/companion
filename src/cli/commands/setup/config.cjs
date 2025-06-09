#!/usr/bin/env node

const { config } = require("yargs");
const { setupConfig } = require("../../../lib/config.cjs");

module.exports = {
  command: "config",
  aliases: [],
  describe: "Interactively setup a config",
  handler: async () => {
    console.log(config);
    await setupConfig();
  }
};
