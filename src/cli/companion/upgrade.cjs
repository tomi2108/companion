#!/usr/bin/env node

const { executeScript } = require("../../interface/cmd.cjs");
const path = require("node:path");
const { pull } = require("../../interface/git.cjs");

module.exports = {
  command: "upgrade",
  aliases: [],
  describe: "Upgrade companion",
  handler: async () => {
    const full_path = path.resolve(__dirname, "../../../");
    await pull(full_path);
    executeScript("install.sh", { path: full_path });
  }
};
