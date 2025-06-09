#!/usr/bin/env node

const { setupConfig } = require("../../lib/config.cjs");

module.exports = {
  command: "setup",
  aliases: [],
  describe: "Setup companion",
  handler: async () => {
    await setupConfig();
  }
};
