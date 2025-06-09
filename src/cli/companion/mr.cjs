#!/usr/bin/env node

const { getCurrentPath } = require("../../interface/files.cjs");
const { Repo } = require("../../lib/repo.cjs");
const { createAndMergeMr } = require("../../interface/glab.cjs");
const { search } = require("../../lib/ui.cjs");

module.exports = {
  command: "mr",
  aliases: [],
  describe: "Mr",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const branches = await repo.getBranches();
    const activeBranch = await repo.getActiveBranch();
    const targetBranches = branches.filter((b) => b !== activeBranch);
    const targetBranch = await search({ choices: targetBranches, message: "Choose target branch" });
    await createAndMergeMr(full_path, targetBranch);
  }
};
