#!/usr/bin/env node

const { executeScript } = require("../../interface/cmd.cjs");
const path = require("node:path");
const { Repo } = require("../../lib/repo.cjs");

module.exports = {
  command: "upgrade",
  aliases: [],
  describe: "Upgrade companion",
  handler: async () => {
    const full_path = path.resolve(__dirname, "../../../");
    const repo = new Repo(full_path);
    await repo.pull();
    executeScript("install.sh", { path: full_path });
  }
};
