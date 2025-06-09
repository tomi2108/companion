#!/usr/bin/env node

const { executeScript } = require("../../interface/cmd.cjs");
const path = require("node:path");

module.exports = {
  command: "upgrade",
  aliases: [],
  describe: "Upgrade companion",
  handler: async () => {

    executeScript("install.sh", { path: path.resolve(__dirname, "../../../") });

  }
};
