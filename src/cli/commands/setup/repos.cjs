#!/usr/bin/env node

const { config } = require("yargs");
const { setupConfig } = require("../../../lib/config.cjs");

module.exports = {
  command: "repos",
  aliases: [],
  describe: "Clone all repos",
  handler: async () => {
    // TODO: clone with glab repo clone -g ...
    console.log("Cloning...");
  }
};
