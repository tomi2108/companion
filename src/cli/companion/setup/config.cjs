#!/usr/bin/env node

const { setupConfig } = require("../../../lib/config.cjs");

module.exports = {
  command: "config",
  aliases: [],
  describe: "Interactively setup a config",
  handler: async () => {
    await setupConfig();
  }
};
